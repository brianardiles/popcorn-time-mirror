(function(App) {
    'use strict';

    var semver = require('semver');
    var peerflix = require('peerflix');
    var getPort = require('get-port');
    var crypto = require('crypto');
    var preloadStreamer = Backbone.Model.extend({

        initialize: function() {
            this.client = false;
            this.src = false;
            App.vent.on('preloadStreamer:stop', this.stop);
        },

        start: function(data) {
            var self = this;
            var streamPath = path.join(AdvSettings.get('tmpLocation'), data.metadata.title);
            getPort(function(err, port) {
                self.src = 'http://127.0.0.1:' + port;

                self.client = peerflix(data.torrent, {
                    connections: parseInt(Settings.connectionLimit, 10) || 100, // Max amount of peers to be connected to.
                    dht: parseInt(Settings.dhtLimit, 10) || 50,
                    port: port,
                    id: self.getPeerID(),
                    path: streamPath
                });

                self.client.on('ready', function() {

                    self.client.files.forEach(function(file) {
                        var index = self.client.files.reduce(function(a, b) { //find the biggest file and stream it.
                            return a.length > b.length ? a : b;
                        });
                        index = self.client.files.indexOf(index);
                        var stream = self.client.files[index].createReadStream();
                        self.fileindex = index;
                        self.streamDir = path.dirname(path.join(streamPath, self.client.torrent.files[index].path));
                    });
                });
            });
        },

        getPeerID: function() {
            var version = semver.parse(App.settings.version);
            var torrentVersion = '';
            torrentVersion += version.major;
            torrentVersion += version.minor;
            torrentVersion += version.patch;
            torrentVersion += version.prerelease.length ? version.prerelease[0] : 0;
            var torrentPeerId = '-PT';
            torrentPeerId += torrentVersion;
            torrentPeerId += '-';
            torrentPeerId += crypto.pseudoRandomBytes(6).toString('hex');
            return torrentPeerId;
        },
        stop: function() {
            console.info('PreloadStreamer destroyed');
            this.src = false;
            if (this.client) {
                this.client.destroy();
            }
            this.client = false;

        }
    });

    App.PreloadStreamer = new preloadStreamer();
})(window.App);