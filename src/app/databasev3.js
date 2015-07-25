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

        /* WATCHED */

        checkWatched: function (data) {
            var watched = this.db.getCollection('watched');
            var result = watched.find({
                imdb: data.imdb_id,
                tvdb: data.tvdb_id,
                episode_id: data.episode_id,
                episode: data.episode,
                season: data.season,
                type: data.type
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
                    episode_id: data.episode_id,
                    episode: data.episode,
                    season: data.season,
                    type: data.type
                });
            } else {
                watched.insert({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb_id,
                    episode_id: data.episode_id,
                    episode: data.episode,
                    season: data.season,
                    type: data.type
                });
            }
            this.db.saveDatabase();

            return Q(true);
        },


        /* BOOKMARKS */


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


        /* CACHE */
        checkCached: function () {},

        cache: function (data, remove) {
            var cache = this.db.getCollection('cache');
            if (remove) {
                cache.removeWhere({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb,
                    title: data.title,
                    type: data.type
                });
            } else {
                cache.insert({
                    imdb: data.imdb_id,
                    tvdb: data.tvdb,
                    title: data.title,
                    type: data.type,
                    data: data
                });
            }
            this.db.saveDatabase();

            return Q(true);
        },

    });

    App.Databasev2 = new Databasev2();
})(window.App);
