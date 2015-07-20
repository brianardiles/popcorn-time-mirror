(function (App) {
    'use strict';

    var Q = require('q');

    var Subtitlesv2 = Backbone.Model.extend({

        initialize: function () {

        },

        get: function (data) {
            var defer = Q.defer();
            var defaultSubtitle = data.defaultSubtitle;
            var type = data.type;
            var that = this;

            switch (type) {
            case 'show':
                this.fetchTVSubtitles({
                    imdbid: data.imdb_id,
                    season: data.season,
                    episode: data.episode
                }).then(function (subs) {
                    if (subs && subs[defaultSubtitle]) {
                        that.setupLocalSubs(defaultSubtitle, subs).then(function () {

                        });
                    }
                    defer.resolve(false);
                });
                break;
            case 'movie':
                this.setupLocalSubs(data.defaultSubtitle, data.subtitles).then(function () {

                });
                break;
            }
            return defer.promise;
        },

        fetchTVSubtitles: function (data) {
            var that = this;
            var defer = Q.defer();

            win.debug('Subtitles data request:', data);

            var subtitleProvider = App.Config.getProvider('tvshowsubtitle');

            subtitleProvider.fetch(data).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    var subtitles = subs;
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

    });

    App.Subtitlesv2 = new Subtitlesv2();
})(window.App);
