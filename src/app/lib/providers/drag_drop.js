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

        var type, title, season, episode, showName;

        if (torrent.name) { // sometimes magnets don't have names for some reason
            var torrenttitle = $.trim(torrent.name.replace('[rartv]', '').replace('[PublicHD]', '').replace('[ettv]', '').replace('[eztv]', '')).replace(/[\s]/g, '.');


            var se_re = torrenttitle.match(/(.*)S(\d\d)E(\d\d)/i); // regex try (ex: title.s01e01)

            if (se_re === null) { // if fails
                se_re = title.match(/(.*)(\d\d\d\d)+\W/i); // try another regex (ex: title.0101)
                if (se_re !== null) {
                    se_re[3] = se_re[2].substr(2, 4);
                    se_re[2] = se_re[2].substr(0, 2);
                } else {
                    se_re = title.match(/(.*)(\d\d\d)+\W/i); // try a last one (ex: title.101)
                    if (se_re !== null) {
                        se_re[3] = se_re[2].substr(1, 2);
                        se_re[2] = se_re[2].substr(0, 1);
                    }
                }
            }

            if (se_re != null) {
                showName = $.trim(se_re[1].replace(/[\.]/g, ' '))
                    .replace(/^\[.*\]/, '') // starts with brackets
                    .replace(/[^\w ]+/g, '') // remove brackets
                    .replace(/ +/g, '-') // has spaces
                    .replace(/_/g, '-') // has '_'
                    .replace(/\-$/, '') // ends with '-'
                    .replace(/^\./, ''); // starts with '.'
                showName = capitaliseFirstLetter(showName);
                season = parseInt(se_re[2]);
                episode = parseInt(se_re[3]);
                title = showName + ' - ' + i18n.__('Season') + ' ' + season + ', ' + i18n.__('Episode') + ' ' + episode;
                type = 'dropped-tvshow';

            } else {
                var filename = $.trim(torrenttitle.replace(/[\.]/g, ' ')).replace(/[^\w ]+/g, ' ').replace(/ +/g, ' ');

                title = filename.split(filename.split(/[^\d]/).filter(function (n) {
                    if ((n >= 1900) && (n <= 2099)) {
                        return n;
                    }
                }))[0];

                type = 'dropped-movie';

            }
        }


        var torrentStart = {
            torrent: torrentsrc,
            type: type,
            choosefile: true,
            metadata: {
                title: title,
                showName: showName,
                season: season,
                episode: episode
            },
            device: App.Device.Collection.selected

        };
        App.Streamer.start(torrentStart);

    }

    function onDrop(e) {

        var file = e.dataTransfer.files[0];

        if (file != null && (file.name.indexOf('.torrent') !== -1 || file.name.indexOf('.srt') !== -1)) {

            fs.writeFile(path.join(App.settings.tmpLocation, file.name), fs.readFileSync(file.path), function (err) {
                if (err) {
                    App.PlayerView.closePlayer();
                    win.error(err.stack);

                } else {
                    if (file.name.indexOf('.torrent') !== -1) {
                        Settings.droppedTorrent = file.name;
                        var torrentsrc = path.join(AdvSettings.get('tmpLocation'), file.name);
                        readTorrent(torrentsrc, function (err, torrent) {
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
                    } else if (file.name.indexOf('.srt') !== -1) {
                        Settings.droppedSub = file.name;
                        App.vent.trigger('videojs:drop_sub');
                    }
                }
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
        console.log(torrentsrc, torrentsrc.indexOf('magnet') > -1);


        if (torrentsrc.indexOf('magnet') > -1) {
            Settings.droppedMagnet = data;
            readTorrent(torrentsrc, function (err, torrent) {
                startStream(torrent, torrentsrc);
            });
        } else {
            if (torrentsrc.startsWith('http')) {
                var ws = fs.createWriteStream(path.join(AdvSettings.get('tmpLocation'), 'pct-remote-torrent.torrent'));

                if (fs.exists(path.join(AdvSettings.get('tmpLocation'), 'pct-remote-torrent.torrent'))) {
                    fs.unlink(path.join(AdvSettings.get('tmpLocation'), 'pct-remote-torrent.torrent'));
                }
                request(torrentsrc).on('response', function (resp) {
                    if (resp.statusCode >= 400) {
                        return done('Invalid status: ' + resp.statusCode); // jshint ignore:line
                    }
                    switch (resp.headers['content-encoding']) {
                    case 'gzip':
                        resp.pipe(zlib.createGunzip()).pipe(ws);
                        break;
                    case 'deflate':
                        resp.pipe(zlib.createInflate()).pipe(ws);
                        break;
                    default:
                        resp.pipe(ws);
                        break;
                    }
                    ws
                        .on('error', function () {
                            console.log('error');
                        })
                        .on('close', function () {
                            console.log('done');
                            console.log(ws.path);
                            readTorrent(ws.path, function (err, torrent) {
                                var torrentMagnet = 'magnet:?xt=urn:btih:' + torrent.infoHash + '&dn=' + torrent.name.replace(/ +/g, '+').toLowerCase();
                                _.each(torrent.announce, function (value) {
                                    var announce = '&tr=' + encodeURIComponent(value);
                                    torrentMagnet += announce;
                                });
                                startStream(torrent, torrentMagnet);
                            });

                        });
                });
            } else {
                win.error('Not an online torrent');
            }
        }
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
