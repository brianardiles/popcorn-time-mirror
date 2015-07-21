(function (App) {
    'use strict';

    var Q = require('q');

    var Subtitlesv2 = Backbone.Model.extend({

        initialize: function () {

        },

        get: function (data) {
            var defaultSubtitle = data.defaultSubtitle;
            var type = data.type;
            var that = this;
            console.log(data);
            switch (type) {
            case 'show':
                this.fetchTVSubtitles({
                    imdbid: data.imdb_id,
                    season: data.season,
                    episode: data.episode
                }).then(function (subs) {
                    if (subs && subs[defaultSubtitle]) {
                        that.initsubs(subs, defaultSubtitle).then(function (info) {
                            info = {
                                subs: subs,
                                extpath: info
                            };
                            console.log(info);
                            App.vent.trigger('subtitlev2:done', info);
                        });
                    }
                });
                break;
            case 'movie':
                this.initsubs(data.subtitles, defaultSubtitle).then(function (info) {
                    console.log(info);
                    App.vent.trigger('subtitlev2:done', info);
                });
                break;
            }
        },

        fetchTVSubtitles: function (data) {
            var that = this;
            var defer = Q.defer();

            win.debug('Subtitles data request:', data);

            var subtitleProvider = App.Config.getProvider('tvshowsubtitle');

            subtitleProvider.fetch(data).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    defer.resolve(subs);
                    win.info(Object.keys(subs).length + ' subtitles found');
                } else {
                    win.warn('No subtitles returned');
                    defer.resolve(false);
                }
            }).catch(function (err) {
                defer.resolve(false);
                console.log('subtitleProvider.fetch()', err);
            });
            return defer.promise;
        },

        initsubs: function (subtitles, defaultSubtitle) {
            var that = this;
            var defer = Q.defer();
            App.vent.on('subtitle:downloaded', function (sub) {
                if (sub) {
                    App.vent.trigger('subtitle:convert', {
                        path: sub,
                        language: defaultSubtitle
                    }, function (err, res) {
                        if (err) {
                            defer.resolve(false);
                            win.error('error converting subtitles', err);
                        } else {
                            defer.resolve(sub);
                            App.Subtitles.Server.start(res);
                        }
                    });
                } else {
                    defer.resolve(false);
                }
            });
            App.vent.trigger('subtitle:download', {
                url: subtitles[defaultSubtitle],
                path: path.join(App.Streamer.streamDir, App.Streamer.client.torrent.files[App.Streamer.fileindex].name)
            });
            return defer.promise;
        }

    });

    App.Subtitlesv2 = new Subtitlesv2();
})(window.App);
