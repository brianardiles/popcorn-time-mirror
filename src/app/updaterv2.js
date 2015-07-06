(function (App) {
    'use strict';

    var request = require('request'),
        fs = require('fs'),
        Q = require('q'),
        _ = require('underscore'),
        path = require('path'),
        crypto = require('crypto'),
        progress = require('request-progress');

    var Updaterv2 = Backbone.Model.extend({
        initialize: function () {
            this.updateEndpoint = 'http://update.popcorntime.io/desktop';
            this.UpdaterCacheDir = path.join(require('nw.gui').App.dataPath + '/UpdaterCache/');
            if (!fs.existsSync(this.UpdaterCacheDir)) {
                fs.mkdirSync(this.UpdaterCacheDir);
                win.debug('UpdaterCache: data directory created');
            }
            this.information = {};
        },
        check: function () {
            var defer = Q.defer();
            var responce = defer.promise;

            var that = this;
            request(this.updateEndpoint, {
                json: true
            }, function (err, res, data) {
                if (err || !data) {
                    defer.reject(err);
                } else {
                    defer.resolve(data);
                }
            });

            responce.then(function (d) {
                var data = d[Settings.os];
                var upstreamCommit = Object.getOwnPropertyNames(data)[0];
                if (App.git.commit !== upstreamCommit) {
                    that.handelUpdate(data[upstreamCommit]);
                }
            });

        },
        handelUpdate: function (d) {
            if (!d[Settings.arch]) {
                return console.log('Update Does not Contain Our Arch :(');
            }
            var data = d[Settings.arch];
            console.log(data);
            App.vent.trigger('notification', 'Update Available: Version ' + data.version, data.description, 'update'); //trigger notification of update

            this.downloadUpdate(data.updateUrl, {
                checksum: data.checksum,
                signature: data.signature
            });
        },
        VerifyUpdate: function (update, secinfo) {
            var defer = Q.defer();
            var self = this;

            var hash = crypto.createHash('SHA1'),
                verify = crypto.createVerify('DSA-SHA1');

            var readStream = fs.createReadStream(update);
            readStream.pipe(hash);
            readStream.pipe(verify);
            readStream.on('end', function () {
                hash.end();
                if (
                    secinfo.checksum !== hash.read().toString('hex') ||
                    verify.verify(VERIFY_PUBKEY, secinfo.signature, 'base64') === false
                ) {
                    defer.reject('invalid hash or signature');
                } else {
                    defer.resolve(true);
                }
            });
            return defer.promise;
        },
        downloadUpdate: function (url, secinfo, override) {
            var that = this;
            var updatePath = path.join(this.UpdaterCacheDir, path.basename(url));

            if (fs.existsSync(updatePath) && !override) {
                this.VerifyUpdate(updatePath, secinfo).then(function (result) {
                    console.log(result);
                });
            } else {
                progress(request(url), {
                        throttle: 500, // Throttle the progress event to 2000ms, defaults to 1000ms
                        delay: 500 // Only start to emit after 1000ms delay, defaults to 0ms
                    })
                    .on('progress', function (state) {
                        that.information.download = {
                            percentDone: state.percent,
                            downloaded: state.received,
                            totalSize: state.total
                        };
                        console.log(that.information.download)
                    })
                    .on('error', function (err) {
                        // Do something with err
                    }).on('close', function (err) {
                        console.log('Update Downloaded!')
                    })
                    .pipe(fs.createWriteStream(updatePath));
            }
        },
        installUpdate: function (path, platform) {},


    });

    App.Updaterv2 = new Updaterv2();
})(window.App);
