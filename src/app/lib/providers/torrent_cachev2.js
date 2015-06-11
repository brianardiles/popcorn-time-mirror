(function (App) {
    'use strict';

    var peerflix = require('peerflix'),
        Q = require('q'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        rimraf = require('rimraf'),
        fs = require('fs'),
        request = require('request'),
        zlib = require('zlib');

    var cacheTorrent = Backbone.Model.extend({

        initialize: function () {
            this.tpmDir = path.join(App.settings.tmpLocation, 'TorrentCache');
            this.MAGNET_RESOLVE_TIMEOUT = 60 * 1000; // one minute
            this.handelTmpDir('check');
            this.caching = false;
        },

        cache: function (torrent) {
            this.cacheInfo = {}; //reset the info object used for debugging 
            this.caching = true;
            var deferred = Q.defer();
            var that = this;
            var type = this.getType(torrent);
            switch (type) {
            case 'torrenturl':
            case 'torrent':
            case 'magnet':
                this.cacheInfo.type = type;
                this.checkCached(torrent).then(function (result) {
                    var filePath = result[0],
                        exists = result[1];
                    if (exists) {
                        that.cacheInfo.preExisting = true;
                        deferred.resolve(filePath);
                    } else {
                        that.cacheInfo.preExisting = false;
                        that.handelTorrent(filePath, type, torrent).then(function (path) {
                            deferred.resolve(path);
                        });
                    }
                    that.cacheInfo.path = filePath;
                    that.cacheInfo.input = torrent;
                });
                break;
            default:
                deferred.reject('TorrentCache.resolve(): Unknown torrent type', torrent);
                console.log('TorrentCache.resolve(): Unknown torrent type', torrent);
            }
            return deferred.promise;
        },

        handelTorrent: function (path, type, torrent) {
            var deferred = Q.defer();
            var self = this;
            switch (type) {
            case 'magnet':

                this.engine = peerflix(torrent, {
                    list: true
                });

                this.engine.on('ready', function () {
                    var resolvedTorrentPath = self.engine.path;
                    if (resolvedTorrentPath) {
                        // copy resolved path to cache so it will be awailable next time
                        Common.copyFile(resolvedTorrentPath + '.torrent', path, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            self.caching = false;
                            deferred.resolve(path);
                            self.engine.destroy();
                            self.engine = null;
                        });
                    } else {
                        console.error('TorrentCache.handlemagnet() engine returned no file');
                        self.engine.destroy();
                        self.engine = null;
                    }
                });
                break;
            case 'torrenturl':
                var done = function (error) {
                    if (error) {
                        try {
                            fs.unlink(path);
                        } catch (e) {}
                        return console.error('TorrentCache.handletorrenturl() error: ' + error, torrent);
                    }
                    self.caching = false;
                    deferred.resolve(path);
                };

                try { // in case somehow invaid link hase made it through to here
                    var ws = fs.createWriteStream(path),
                        params = {
                            url: torrent,
                            headers: {
                                'accept-charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
                                'accept-language': 'en-US,en;q=0.8',
                                'accept-encoding': 'gzip,deflate',
                                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36'
                            }
                        },
                        req = request(params)
                        .on('response', function (resp) {
                            if (resp.statusCode >= 400) {
                                return done('Invalid status: ' + resp.statusCode);
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
                                .on('error', done)
                                .on('close', done);
                        })
                        .on('error', done);
                } catch (e) {
                    done(e);
                }
                break;
            case 'torrent':
                Common.copyFile(torrent, path, function (err) {
                    if (err) {
                        console.error('TorrentCache.handletorrent() error: ' + err, torrent);
                    }
                    self.caching = false;
                    deferred.resolve(path);
                });
                break;
            }
            return deferred.promise;
        },
        handelTmpDir: function (type) {
            var self = this;
            switch (type) {
            case 'check':
                mkdirp(this.tpmDir, function (err) {
                    if (err) {
                        win.error('TorrentCache._checkTmpDir()', err);
                    }
                });
                break;
            case 'clear':
                rimraf(this.tpmDir, function (err) {
                    if (err) {
                        win.error('TorrentCache.clearTmpDir()', err);
                    }
                    self.handelTmpDir('check');
                });
                break;
            }
        },
        checkCached: function (torrent) {
            var deferred = Q.defer(),
                name = this.getKey(torrent) + '.torrent',
                targetPath = path.join(this.tpmDir, name);

            // check if file already exists
            fs.readdir(this.tpmDir, function (err, files) {
                if (err) {
                    console.log('TorrentCache.checkCache() readdir:' + err, torrent);
                    return deferred.reject(err);
                }
                var idx = files.indexOf(name);
                if (idx === -1) {
                    return deferred.resolve([targetPath, false]);
                }
                // check if it actually is a file, not dir..
                fs.lstat(targetPath, function (err, stats) {
                    if (err) {
                        console.log('TorrentCache.checkCache() lstat:' + err, torrent);
                        return deferred.reject(err);
                    }
                    if (stats.isFile()) {
                        return deferred.resolve([targetPath, true]);
                    }
                    console.log('TorrentCache.checkCache() target torrent is directory', torrent);
                    deferred.reject('Target torrent is directory');
                });
            });
            return deferred.promise;
        },
        getType: function (torrent) {
            if (typeof torrent === 'string') {
                if (torrent.substring(0, 8) === 'magnet:?') {
                    return 'magnet';
                }
                if (torrent.indexOf('.torrent') !== -1) {
                    if (torrent.indexOf('http://') === 0) {
                        return 'torrenturl';
                    }
                    return 'torrent';
                }
            }
            return 'unknown';
        },
        getKey: function (name) {
            return Common.md5(path.basename(name));
        }
    });

    App.cacheTorrent = new cacheTorrent();
})(window.App);
