(function (App) {
    'use strict';
    var Q = require('q');

    var Database = Backbone.Model.extend({

        initialize: function () {
            var startupTime = window.performance.now();
            console.debug('Database path: ' + data_path);

            App.vent.on('watched', _.bind(this.watched, this));

            this.getUserInfo()

        },
        getUserInfo: function () {
            var bookmarks = this.bookmark('get', 'all')
                .then(function (data) {
                    _.each(data, function (t, i) {
                        var imdb_id = i;
                        App.userBookmarks.push(imdb_id);
                    });
                });

            var movies = this.watched('get', 'movie', 'all')
                .then(function (data) {
                    _.each(data, function (t, i) {
                        var imdb_id = i;
                        App.watchedMovies.push(imdb_id);
                    });
                });

            var episodes = this.watched('get', 'show', 'all')
                .then(function (data) {
                    _.each(data, function (d) {
                        console.log(d);
                        var tvdb_id = d.tvdb_id;
                        console.log(tvdb_id);
                        App.watchedShows.push(tvdb_id);
                    });
                });


            return Q.all([bookmarks, movies, episodes]);

        },
        movie: function (action, data) {
            var toreturn;
            switch (action) {
            case 'get':
                toreturn = JSON.parse(localStorage.getItem('movie-' + data));
                break;
            case 'add':
                if (!localStorage.getItem('movie-' + data.imdb_id)) {
                    localStorage.setItem(movie, JSON.stringify('movie-' + data.imdb_id));
                    toreturn = true;
                }
                break;
            case 'remove':
                localStorage.removeItem('movie-' + data);
                toreturn = true;
                break;
            }
            return Q(toreturn);
        },
        show: function (action, data) {
            var toreturn;
            switch (action) {
            case 'get':
                toreturn = JSON.parse(localStorage.getItem('show-' + data));
                break;
            case 'add':
                if (!localStorage.getItem('show-' + data.imdb_id)) {
                    localStorage.setItem(show, JSON.stringify('show-' + data.imdb_id));
                }
                toreturn = true;
                break;
            case 'remove':
                localStorage.removeItem('show-' + data);
                toreturn = true;
                break;
            }
            return Q(toreturn);
        },
        bookmark: function (action, type, data) {
            if (data && type) {
                var item = 'bookmark-' + type + '-' + data;
            }
            var toreturn;
            switch (action) {
            case 'get':
                if (type === 'all') { //we are fetching all bookmarks!
                    var bookmarked = {};
                    for (var key in localStorage) {
                        if (key.toString().includes('bookmark')) {
                            var d = key.split('-');
                            var type = d[1];
                            var imdb_id = d[2];
                            bookmarked[imdb_id] = type;
                        }
                    }
                    toreturn = bookmarked;
                } else {
                    toreturn = JSON.parse(localStorage.getItem(item));
                }
                break;
            case 'add':
                if (!localStorage.getItem(item)) {
                    localStorage.setItem(item, JSON.stringify(data));
                }
                toreturn = true;
                break;
            case 'remove':
                localStorage.removeItem(item);
                toreturn = true;
                break;
            }
            return Q(toreturn);
        },
        watched: function (action, type, data) {
            console.log(action, type, data);
            var toreturn, item;
            if (type && data) {
                switch (type) {
                case 'show':
                    item = 'watched-' + type + '-' + data.imdb_id + '-' + data.tvdb_id + '-' + data.episode_id;
                    break;
                case 'movie':
                    item = 'watched-' + type + '-' + data;
                    break;
                }
            }
            switch (action) {
            case 'get':
                var watched = {},
                    find;
                if (data === 'all') {
                    find = 'watched-' + type;
                } else {
                    find = 'watched-' + type + '-' + data;
                }
                for (var key in localStorage) {
                    if (key.toString().includes(find)) {
                        var d = key.split('-');
                        var type = d[1];
                        var imdb_id = d[2];
                        var tvdb_id, episode_id;
                        if (type === 'show') {
                            tvdb_id = d[3];
                            episode_id = d[4];
                        } else {
                            tvdb_id = false;
                            episode_id = false;
                        }
                        watched[imdb_id] = {
                            type: type,
                            imdb_id: imdb_id,
                            tvdb_id: tvdb_id,
                            episode_id: episode_id
                        };
                    }
                }
                toreturn = watched;
                break;
            case 'check':
                if (localStorage.getItem(item) !== null) {
                    toreturn = true;
                } else {
                    toreturn = false;
                }
                break;
            case 'add':
                if (!localStorage.getItem(item)) {
                    localStorage.setItem(item, JSON.stringify(data));
                }
                toreturn = true;
                break;
            case 'remove':
                localStorage.removeItem(item);
                toreturn = true;
                break;
            }
            return Q(toreturn);
        }
    });

    App.Database = new Database();
})(window.App);