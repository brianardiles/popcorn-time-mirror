(function (App) {
    'use strict';

    /*
    Updates: [Automatically update, Notify me when an update is available, Disabled]
    Update Channel: [stable, expiremental, nightly]
    */

    var request = require('request'),
        fs = require('fs'),
        Q = require('q'),
        _ = require('underscore'),
        path = require('path'),
        crypto = require('crypto'),
        progress = require('request-progress'),
        AdmZip = require('adm-zip'),
        rimraf = require('rimraf');

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
                download: {
                    status: 'Initializing',
                    percentDone: 0,
                    downloaded: 0,
                    totalSize: 0
                }
            };

        },
        check: function () {
            if (!this.updateEndpoint) {
                this.updateEndpoint = 'http://update.popcorntime.io/' + Settings.updatechannel + '-desktop/' + Settings.os + '/' + this.gitHash;
            }
            var defer = Q.defer();
            var responce = defer.promise;
            var that = this;

            switch (Settings.automaticUpdating) {
            case 'checkandinstall':
                //TODO  
                break;
            case 'checkandnotify':
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
                        that.handleUpdate(d);
                    }
                });
                break;
            case 'disable':
                win.debug('Updates have been disabled from the settings.');
                defer.resolve(false);
                return defer.promise;
            }
        },
        handleUpdate: function (d) {
            if (!d[Settings.arch]) {
                return console.log('Update Does not Contain Our Arch :(');
            }
            var data = d[Settings.arch];
            App.vent.trigger('notification', 'Update Available: Version ' + data.meta.title, data.meta.description, 'update'); //trigger notification of update
            var type = 'package';
            var downloadURL = data.download.package;

            if (data.download['installer']) {
                type = 'installer';
                downloadURL = data.download.installer;
            }

            this.downloadURL = downloadURL;
            this.verificationinfo = data.verification;
            this.updateType = type;

            this.updateModel = new Backbone.Model({
                changelog: data.change_log,
                version_name: data.meta.title,
                description: data.meta.description,
                version: data.meta.version,
                blog_url: data.meta.blog_url
            });
            App.vent.trigger('enableUpdatericon');

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
                if (verification.checksum !== hash.read().toString('hex')) {
                    defer.resolve(false);
                } else {
                    defer.resolve(true);
                }
            });
            return defer.promise;
        },
        downloadUpdate: function (override) {
            var url = this.downloadURL;
            var verification = this.verificationinfo;
            var that = this;


            var updatePath = path.join(this.UpdaterCacheDir, path.basename(url));

            if (fs.existsSync(updatePath) && !override) {

                var stats = fs.statSync(updatePath);
                var fileSizeInBytes = stats['size'];
                this.information.download = {
                    status: 'Verifying',
                    percentDone: 100,
                    downloaded: fileSizeInBytes,
                    totalSize: fileSizeInBytes
                };

                this.VerifyUpdate(updatePath, verification).then(function (result) {
                    console.log(result);
                    if (result) { // ! for debug remove ! for production
                        that.installUpdate(updatePath).then(function (result) {
                            console.log(result);
                        });
                    } else {

                    }
                });
            } else {
                progress(request(url), {
                        throttle: 500, // Throttle the progress event to 2000ms, defaults to 1000ms
                        delay: 500 // Only start to emit after 1000ms delay, defaults to 0ms
                    })
                    .on('progress', function (state) {
                        that.information.download = {
                            status: 'Downloading',
                            percentDone: state.percent,
                            downloaded: state.received,
                            totalSize: state.total
                        };
                        console.log(that.information.download);
                    })
                    .on('error', function (err) {
                        // Do something with err
                    })
                    .pipe(fs.createWriteStream(updatePath))
                    .on('close', function (err) {
                        that.information.download = {
                            status: 'Verifying',
                            percentDone: '100',
                            downloaded: that.information.download.totalSize,
                            totalSize: that.information.download.totalSize
                        };
                        that.VerifyUpdate(updatePath, verification).then(function (result) {
                            console.log(result);
                            if (result) { // ! for debug remove ! for production
                                that.installUpdate(updatePath).then(function (result) {
                                    console.log(result);
                                });
                            } else {}
                        });
                    });
            }
        },
        installUpdate: function (updatepath, type) {
            var defer = Q.defer();
            var installDir = (Settings.os === 'linux' ? process.execPath : process.cwd());
            var type = this.updateType;

            console.log(updatepath, type);

            this.information.download.status = 'Installing';

            switch (Settings.os) {
            case 'windows':
                if (type === 'installer') {
                    this.runExe(updatepath).then(this.closeApp);
                } else {

                }

                break;

            case 'linux':

                break;

            case 'mac':
                var pack = new AdmZip(updatepath);
                pack.extractAllToAsync(installDir, false, function (err) { //false for debug, true for production
                    if (err) {
                        defer.reject(err);
                    } else {
                        fs.unlink(updatepath, function (err) {
                            if (err) {
                                defer.reject(err);
                            } else {
                                defer.resolve(true);
                            }
                        });
                    }
                });
                break;

            default:
                win.error('Operating system not found.');
                defer.resolve(false);
            }

            return defer.promise;
        },
        closeApp: function () {
            var gui = require('nw.gui');
            gui.App.quit();
        },
        runExe: function (path) {
            var exec = require('child_process').exec;
            var child = exec(path, function (error, stdout, stderr) {
                if (error) {
                    console.log(error, stdout, stderr);
                }
            });
            return Q(true);
        }

    });

    App.Updaterv2 = new Updaterv2();
})(window.App);
