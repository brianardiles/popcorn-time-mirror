(function (App) {
    'use strict';
    var readTorrent = require('read-torrent'),
        path = require('path'),
        fs = require('fs'),
        request = require('request'),
        zlib = require('zlib');

    function capitaliseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function startStream(torrent, torrentsrc) {

        var torrentStart = {
            torrent: torrentsrc,
            type: 'dropped-content',
            dropped: true,
            metadata: {
                title: torrent.name,
            },
            device: App.Device.Collection.selected
        };
        App.Streamer.start(torrentStart);

    }

    function onDrop(e) {

        var file = e.dataTransfer.files[0];

        if (file != null && (file.name.indexOf('.torrent') !== -1 || file.name.indexOf('.srt') !== -1)) {

            App.cacheTorrent.cache(file.path).then(function (path) {
                readTorrent(path, function (err, torrent) {
                    if (!err) {
                        var torrentMagnet = 'magnet:?xt=urn:btih:' + torrent.infoHash + '&dn=' + torrent.name.replace(/ +/g, '+').toLowerCase();
                        _.each(torrent.announce, function (value) {
                            var announce = '&tr=' + encodeURIComponent(value);
                            torrentMagnet += announce;
                        });
                        startStream(torrent, torrentMagnet);
                    } else {
                        win.error(err.stack);
                    }
                });
            });

        } else {
            var data = e.dataTransfer.getData('text/plain');
        }

    }

    function onPaste(e) {
        if (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA') {
            return;
        }
        var data = (e.originalEvent || e).clipboardData.getData('text/plain');

        var torrentsrc = data;
        //console.log(torrentsrc, torrentsrc.indexOf('magnet') > -1);

        App.cacheTorrent.cache(torrentsrc).then(function (path) {
            readTorrent(path, function (err, torrent) {
                if (!err) {
                    var torrentMagnet = 'magnet:?xt=urn:btih:' + torrent.infoHash + '&dn=' + torrent.name.replace(/ +/g, '+').toLowerCase();
                    _.each(torrent.announce, function (value) {
                        var announce = '&tr=' + encodeURIComponent(value);
                        torrentMagnet += announce;
                    });
                    startStream(torrent, torrentMagnet);
                } else {
                    win.error(err.stack);
                }
            });
        });


    }

    function onDragUI(hide) {

        if (hide) {
            $('#drop-mask').hide();
            console.log('drag completed');
            $('.drop-indicator').hide();
            return;
        }

        $('#drop-mask').show();
        var showDrag = true;
        var timeout = -1;
        $('#drop-mask').on('dragenter',
            function (e) {
                $('.drop-indicator').show();
                console.log('drag init');
            });
        $('#drop-mask').on('dragover',
            function (e) {
                var showDrag = true;
            });

        $('#drop-mask').on('dragleave',
            function (e) {
                var showDrag = false;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    if (!showDrag) {
                        console.log('drag aborted');
                        $('.drop-indicator').hide();
                        $('#drop-mask').hide();
                    }
                }, 100);
            });
    }

    function initDragDrop() {

        window.ondragenter = function (e) {
            e.preventDefault();
            onDragUI(false);
        };
        window.ondrop = function (e) {
            e.preventDefault();
            onDragUI(true);
            onDrop(e);
        };
        $(document).on('paste', function (e) {
            e.preventDefault();
            onPaste(e);
        });

    }
    initDragDrop();
})(window.App);