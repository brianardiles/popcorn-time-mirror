(function (App) {
    'use strict';

    /*
    Updates: [Automatically update, Notify me when an update is available, Disabled]
    Update Channel: [Stable, Experimental, Nightly]
    */

    var request = require('request'),
        fs = require('fs'),
        Q = require('q'),
        _ = require('underscore'),
        path = require('path'),
        crypto = require('crypto'),
        progress = require('request-progress');

    var Updaterv2 = Backbone.Model.extend({
        initialize: function () {

            this.githash = App.git.commit;

            this.gitHash = 'e4fdcc522f6a57882f1d7b716009f0099b920046'; //for debugging olny!

            this.pubkey = '-----BEGIN PUBLIC KEY-----\n' +
                'MIIBtjCCASsGByqGSM44BAEwggEeAoGBAPNM5SX+yR8MJNrX9uCQIiy0t3IsyNHs\n' +
                'HWA180wDDd3S+DzQgIzDXBqlYVmcovclX+1wafshVDw3xFTJGuKuva7JS3yKnjds\n' +
                'NXbvM9CrJ2Jngfd0yQPmSh41qmJXHHSwZfPZBxQnspKjbcC5qypM5DqX9oDSJm2l\n' +
                'fM/weiUGnIf7AhUAgokTdF7G0USfpkUUOaBOmzx2RRkCgYAyy5WJDESLoU8vHbQc\n' +
                'rAMnPZrImUwjFD6Pa3CxhkZrulsAOUb/gmc7B0K9I6p+UlJoAvVPXOBMVG/MYeBJ\n' +
                '19/BH5UNeI1sGT5/Kg2k2rHVpuqzcvlS/qctIENgCNMo49l3LrkHbJPXKJ6bf+T2\n' +
                '8lFWRP2kVlrx/cHdqSi6aHoGTAOBhAACgYBTNeXBHbWDOxzSJcD6q4UDGTnHaHHP\n' +
                'JgeCrPkH6GBa9azUsZ+3MA98b46yhWO2QuRwmFQwPiME+Brim3tHlSuXbL1e5qKf\n' +
                'GOm3OxA3zKXG4cjy6TyEKajYlT45Q+tgt1L1HuGAJjWFRSA0PP9ctC6nH+2N3HmW\n' +
                'RTcms0CPio56gg==\n' +
                '-----END PUBLIC KEY-----\n';
            this.UpdaterCacheDir = path.join(require('nw.gui').App.dataPath + '/UpdaterCache/');
            if (!fs.existsSync(this.UpdaterCacheDir)) {
                fs.mkdirSync(this.UpdaterCacheDir);
                win.debug('UpdaterCache: data directory created');
            }

            this.information = {
                download: null,
                verifyed: false,
                installed: false
            };


        },
        check: function () {
            if (!this.updateEndpoint) {
                this.updateEndpoint = 'http://update.popcorntime.io/' + 'stable' + '-desktop/' + Settings.os + '/' + this.gitHash;
            }
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
                if (!d['error']) {
                    that.handelUpdate(d);
                }
            });
        },
        handelUpdate: function (d) {
            if (!d[Settings.arch]) {
                return console.log('Update Does not Contain Our Arch :(');
            }
            var data = d[Settings.arch];
            App.vent.trigger('notification', 'Update Available: Version ' + data.meta.title, data.meta.description, 'update'); //trigger notification of update
            var type = 'package';
            var downloadURL = data.download.package;
            if (_.pluck(data.download, 'installer')) {
                type = 'installer';
                downloadURL = data.download.installer;
            }
            this.downloadUpdate(downloadURL, data.verification, type);
        },
        VerifyUpdate: function (update, verification) {
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
                    verification.checksum !== hash.read().toString('hex') ||
                    verify.verify(self.pubkey, verification.signature, 'base64') === false
                ) {
                    defer.resolve(false);
                } else {
                    defer.resolve(true);
                }
            });
            return defer.promise;
        },
        downloadUpdate: function (url, verification, type, override) {
            var that = this;
            var updatePath = path.join(this.UpdaterCacheDir, path.basename(url));

            if (fs.existsSync(updatePath) && !override) {
                this.VerifyUpdate(updatePath, verification).then(function (result) {
                    console.log(result);
                    if (result) {
                        that.information.verifyed = true;
                    } else {
                        that.information.verifyed = 'failed';
                    }
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
                        console.log(that.information.download);
                    })
                    .on('error', function (err) {
                        // Do something with err
                    }).on('close', function (err) {
                        that.information.download = {
                            percentDone: '100',
                            downloaded: state.received,
                            totalSize: state.total
                        };
                        cosnole.log('updateFunnihsedDownloading!!!!')
                        that.VerifyUpdate(updatePath, verification).then(function (result) {
                            console.log(result);
                            if (result) {
                                that.information.verifyed = true;
                            } else {
                                that.information.verifyed = 'failed';
                            }
                        });
                        console.log('Update Downloaded!');
                    })
                    .pipe(fs.createWriteStream(updatePath));
            }
        },
        installUpdate: function (path, type) {


        },


    });

    App.Updaterv2 = new Updaterv2();
})(window.App);