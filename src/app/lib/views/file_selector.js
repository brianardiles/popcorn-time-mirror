(function (App) {
    'use strict';

    var _this,
        formatMagnet;

    var FileSelector = Backbone.Marionette.ItemView.extend({
        template: '#file-selector-tpl',
        className: 'file-selector',

        events: {
            'click .close-icon': 'closeSelector',
            'click .file-item': 'startStreaming',
            'click .store-torrent': 'storeTorrent',
            'click .playerchoicemenu li a': 'selectPlayer'
        },

        initialize: function () {
            _this = this;

            formatMagnet = function (link) {
                // format magnet with Display Name
                var index = link.indexOf('\&dn=') + 4, // keep display name
                    _link = link.substring(index); // remove everything before dn
                _link = _link.split('\&'); // array of strings starting with &
                _link = _link[0]; // keep only the first (i.e: display name)
                _link = _link.replace(/\+/g, '.'); // replace + by .
                _link = _link.replace(/%5B/g, '[').replace(/%5D/g, ']');
                link = _link.replace(/%28/g, '(').replace(/%29/g, ')');
                return link;
            };
        },

        onBeforeRender: function () {
            this.bitsnoopRequest(this.model.get('torrent'));
        },

        onShow: function () {
            this.isTorrentStored();
            App.FileSelectorIsOpen = true;
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                _this.closeSelector(e);
            });

            App.Device.Collection.setDevice(AdvSettings.get('chosenPlayer'));
            App.Device.ChooserView('#player-chooser2').render();
            this.$('#watch-now').text('');
        },

        bitsnoopRequest: function (hash) {
            var endpoint = 'http://bitsnoop.com/api/fakeskan.php?hash=';

            request({
                method: 'GET',
                url: endpoint + hash,
                headers: {
                    'User-Agent': 'request'
                }
            }, function (error, response, body) {
                if (!error && response.statusCode <= 400) {
                    if (body === 'FAKE') {
                        $('.fakeskan').text(i18n.__('%s reported this torrent as fake', 'FakeSkan')).show();
                    }
                }
            });
        },

        startStreaming: function (e) {

            //var file = parseInt($(e.currentTarget).attr('data-file'));
            var actualIndex = parseInt($(e.currentTarget).attr('data-index'));
            var fileSelectedName = $(e.currentTarget).attr('data-filename');

            App.vent.trigger('streamer:update', {
                fileSelectorIndex: actualIndex,
                fileSelectorIndexName: fileSelectedName
            });

            App.vent.trigger('system:closeFileSelector');
        },

        isTorrentStored: function () {
            var target = require('nw.gui').App.dataPath + '/TorrentCollection/';
            var newpath = path.join(target, App.Streamer.client.torrent.name + '.torrent');
            var newpath2 = path.join(target, App.Streamer.client.torrent.name.replace(/\./g, ' ') + '.torrent');
            // check if torrent stored
            if (!fs.existsSync(newpath) && !fs.existsSync(newpath2)) {
                $('.store-torrent').text(i18n.__('Store this torrent'));
                return false;
            } else {
                $('.store-torrent').text(i18n.__('Remove this torrent'));
                return true;
            }
        },

        storeTorrent: function () {
            var os = require('os');
            var target = require('nw.gui').App.dataPath + '/TorrentCollection/';

            var oldfilename = App.Streamer.client.infoHash + '.torrent';
            var newfilename = App.Streamer.client.torrent.name + '.torrent';
            var newfilename2 = App.Streamer.client.torrent.name.replace(/\./g, ' ') + '.torrent';

            var torrentlocation = path.join(os.tmpDir(), 'torrent-stream', oldfilename);
            var newpath = path.join(target, newfilename2);


            if (this.isTorrentStored()) {
                if (fs.existsSync(path.join(target, newfilename))) {
                    fs.unlinkSync(path.join(target, newfilename)); // remove the torrent
                } else if (fs.existsSync(path.join(target, newfilename2))) {
                    fs.unlinkSync(path.join(target, newfilename2)); // remove the torrent
                }

                win.debug('Torrent Collection: deleted', App.Streamer.client.torrent.name);
            } else {
                fs.writeFileSync(newpath, fs.readFileSync(torrentlocation)); // save torrent
                win.debug('Torrent Collection: added', App.Streamer.client.torrent.name);
            }

            this.isTorrentStored(); // trigger button change

            if (App.currentview === 'Torrent-collection') {
                App.vent.trigger('torrentCollection:show'); // refresh collection
            }
        },

        selectPlayer: function (e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            _this.model.set('device', player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        },

        closeSelector: function (e) {
            Mousetrap.bind('backspace', function (e) {
                App.vent.trigger('show:closeDetail');
                App.vent.trigger('movie:closeDetail');
            });
            $('.filter-bar').show();
            $('#header').removeClass('header-shadow');
            $('#movie-detail').show();
            App.vent.trigger('player:close');
            App.vent.trigger('streamer:stop');
            App.vent.trigger('system:closeFileSelector');
        },

        onDestroy: function () {
            Settings.droppedTorrent = false;
            Settings.droppedMagnet = false;
            Settings.droppedStoredMagnet = false;
            App.FileSelectorIsOpen = false;
        },

    });

    App.View.FileSelector = FileSelector;
})(window.App);
