(function(App) {
    'use strict';

    var semver = require('semver');
    var peerflix = require('peerflix');
    var getPort = require('get-port');
    var crypto = require('crypto');
    var Streamer = Backbone.Model.extend({

        initialize: function() {
            this.updatedInfo = {};
            this.client = false;
            this.fileindex = null;
            var self = this;
            this.getPort();
            App.vent.on('streamer:update', function(data) {
                if (!data)
                    return;
                for (var key in data) {
                    self.updatedInfo[key] = data[key];
                }
            });
        },

        start: function(data) {
            var self = this;
            var streamPath = path.join(AdvSettings.get('tmpLocation'), data.metadata.title);

            this.client = peerflix(data.torrent, {
                connections: parseInt(Settings.connectionLimit, 10) || 100, // Max amount of peers to be connected to.
                dht: parseInt(Settings.dhtLimit, 10) || 50,
                port: parseInt(Settings.streamPort, 10) || self.port,
                id: self.getPeerID(),
                verify: false,
                tmp: streamPath // we'll have a different file name for each stream also if it's same torrent in same session
            });

            this.client.on('ready', function() {

                if (data.choosefile) {

                    var streamableFiles = [];
                    self.client.files.forEach(function(file, index) {
                        if (file.name.endsWith('.avi') || file.name.endsWith('.mp4') || file.name.endsWith('.mkv') || file.name.endsWith('.wmv') || file.name.endsWith('.mov')) {
                            file.index = index;
                            streamableFiles.push(file);
                        }
                    })

                    App.vent.trigger('system:openFileSelector', new Backbone.Model({
                        files: streamableFiles,
                        torrent: data.torrent
                    }));

                    var startLoadingFromFileSelector = function() {
                        require('watchjs').unwatch(self.updatedInfo, 'fileSelectorIndex', startLoadingFromFileSelector);
                        var index = self.updatedInfo.fileSelectorIndex;
                        var stream = self.client.files[index].createReadStream();
                        self.fileindex = index;
                    }
                    require('watchjs').watch(self.updatedInfo, 'fileSelectorIndex', startLoadingFromFileSelector);
                } else {
                    if (self.client) {
                        self.client.files.forEach(function(file) {
                            var index = self.client.files.reduce(function(a, b) {
                                return a.length > b.length ? a : b;
                            });
                            index = self.client.files.indexOf(index);

                            var stream = self.client.files[index].createReadStream();
                            self.fileindex = index;
                        });
                    }
                }
            });

            var stateModel = new Backbone.Model({
                backdrop: data.metadata.backdrop,
                title: data.metadata.title,
                player: data.device,
                show_controls: false,
                data: data
            });

            App.vent.trigger('stream:started', stateModel);

        },
        getPort: function() {
            if (!Settings.streamPort) {
                var self = this;
                getPort(function(err, port) {
                    self.port = port;
                    self.src = 'http://127.0.0.1:' + port;
                });
            } else {
                this.port = parseInt(Settings.streamPort, 10);
                this.src = 'http://127.0.0.1:' + parseInt(Settings.streamPort, 10);
            }
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
        destroy: function() {
            if (this.client) {
                this.client.destroy();
            }
            this.client = false;
            this.fileindex = null;
            this.getPort();
        }

    });

    App.Streamer = new Streamer();
})(window.App);