(function (App) {
    'use strict';
    var Q = require('q');
    var loki = require('lokijs');
    var path = require('path');
    var fs = require('fs');

    var Databasev2 = Backbone.Model.extend({
        initialize: function () {
            var dbpath = path.join(require('nw.gui').App.dataPath + '/Database.json');
            if (!fs.existsSync(dbpath)) {
                fs.closeSync(fs.openSync(dbpath, 'w'));
            }
            this.db = new loki(dbpath, {
                autoload: true,
                autosave: true
            });
            this.loadHandler();
            App.vent.on('watched', _.bind(this.watched, this));
            App.vent.on('bookmarked', _.bind(this.bookmarked, this));
        },
        loadHandler: function () {
            if (this.db.getCollection('watched') === null) {
                this.db.addCollection('watched');
            }
            if (this.db.getCollection('resume') === null) {
                this.db.addCollection('resume');
            }
            if (this.db.getCollection('bookmarked') === null) {
                this.db.addCollection('bookmarked');
            }
            if (this.db.getCollection('cache') === null) {
                this.db.addCollection('cache');
            }
        },

        /* RESUME */

        ckeckResume: function (data) {
            var resume = this.db.getCollection('resume');
            var result = resume.findWhere({
                imdb: data.imdb_id,
                tvdb: data.tvdb_id,
                episode: data.episode,
                season: data.season,
                type: data.type
            });
            var r = false;
            if (result.length > 0) {
                r = result[0];
            }
            return Q(r);
        },

        resume: function (data, remove) {
            var resume = this.db.getCollection('resume');
            if (remove) {
                resume.removeWhere({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb_id,
                    episode: data.episode,
                    season: data.season,
                    type: data.type
                });
                this.db.saveDatabase();
            } else {
                var that = this;
                this.ckeckResume(data).then(function (status) {
                    if (status) {
                        resume.removeWhere({
                            imdb: data.imdb_id,
                            tvdb: data.tvdb_id,
                            episode: data.episode,
                            season: data.season,
                            type: data.type
                        });
                        resume.insert({
                            imdb: data.imdb_id,
                            season: data.season,
                            episode: data.episode,
                            tvdb_id: data.tvdb_id,
                            type: data.type,
                            timeindex: data.timeindex,
                            duration: data.duration
                        });
                    } else {
                        resume.insert({
                            imdb: data.imdb_id,
                            season: data.season,
                            episode: data.episode,
                            tvdb_id: data.tvdb_id,
                            type: data.type,
                            timeindex: data.timeindex,
                            duration: data.duration
                        });
                    }
                    that.db.saveDatabase();
                });
            }
            return Q(true);
        },

        /* WATCHED */

        checkWatched: function (data) {
            var watched = this.db.getCollection('watched');
            var result = watched.where(function (obj) {
                return obj.imdb === data.imdb_id && obj.tvdb === data.tvdb_id && obj.episode === data.episode && obj.season === data.season && obj.type === data.type;
            });
            var r = false;
            if (result.length > 0) {
                r = true;
            }
            return Q(r);
        },

        watched: function (data, remove) {
            var watched = this.db.getCollection('watched');
            if (remove) {
                watched.removeWhere({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb_id,
                    episode: data.episode,
                    season: data.season,
                    type: data.type
                });
            } else {
                watched.insert({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb_id,
                    episode: data.episode,
                    season: data.season,
                    type: data.type
                });
            }
            this.db.saveDatabase();
            return Q(true);
        },

        /* BOOKMARKS */

        getBookmarks: function () {
            var bookmarked = this.db.getCollection('bookmarked');
            return Q(bookmarked.data);
        },

        checkBookmarked: function (data) {
            var bookmarked = this.db.getCollection('bookmarked');
            var result = bookmarked.find({
                imdb: data.imdb_id,
                tvdb: data.tvdb,
                title: data.title,
                type: data.type
            });
            var r = false;
            if (result.length > 0) {
                r = true;
            }
            return Q(r);
        },

        bookmarked: function (data, remove) {
            var bookmarked = this.db.getCollection('bookmarked');
            if (remove) {
                bookmarked.removeWhere({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb,
                    title: data.title,
                    type: data.type
                });
            } else {
                bookmarked.insert({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb,
                    time: new Date().getTime(),
                    title: data.title,
                    type: data.type
                });
            }
            this.db.saveDatabase();
            return Q(true);
        },

        getCached: function (data) {
            var cache = this.db.getCollection('cache');
            console.log(data);
            var result = cache.find({
                imdb: data.imdb,
                tvdb: data.tvdb,
                title: data.title,
                type: data.type
            });
            var r = false;
            if (result.length > 0) {
                r = result[0];
            }
            return Q(r);
        },

        /* CACHE */
        checkCached: function (data) {
            var cache = this.db.getCollection('cache');
            var result = cache.find({
                imdb: data.imdb_id,
                tvdb: data.tvdb_id,
                title: data.title,
                type: data.type
            });
            var r = false;
            if (result.length > 0) {
                r = true;
            }
            return Q(r);
        },

        cache: function (data, remove) {
            var cache = this.db.getCollection('cache');
            if (remove) {
                cache.removeWhere({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb_id,
                    title: data.title,
                    type: data.type
                });
                this.db.saveDatabase();
            } else {
                var that = this;
                this.checkCached(data).then(function (status) {
                    if (!status) {
                        cache.insert({
                            imdb: data.imdb_id,
                            tvdb: data.tvdb_id,
                            title: data.title,
                            type: data.type,
                            data: data
                        });
                        that.db.saveDatabase();
                    }
                });
            }
            return Q(true);
        },

    });

    App.Databasev2 = new Databasev2();
})(window.App);