(function (App) {
    'use strict';
    var Q = require('q');

    var Database = Backbone.Model.extend({

        initialize: function () {
            var startupTime = window.performance.now();
            console.debug('Database path: ' + data_path);

            App.vent.on('watched', _.bind(this.watched, this));

            //this.getUserInfo()

        },
        getUserInfo: function () {
            var bookmarks = this.bookmark('get', 'all')
                .then(function (data) {
                    var bookmarks = [];
                    _.each(data, function (t, i) {
                        var imdb_id = i;
                        bookmarks.push(imdb_id);
                    });
                    App.userBookmarks = bookmarks;
                });

            var movies = this.watched('get', 'movie', 'all')
                .then(function (data) {
                    var watchedmovies = [];
                    _.each(data, function (t, i) {
                        var imdb_id = i;
                        watchedmovies.push(imdb_id);
                    });
                    App.watchedMovies = watchedmovies;
                });

            var episodes = this.watched('get', 'show', 'all')
                .then(function (data) {
                    var watchedshows = [];
                    _.each(data, function (d) {
                        var tvdb_id = d.tvdb_id;
                        watchedshows.push(tvdb_id);
                    });
                    console.log(watchedshows);
                    App.watchedShows = watchedshows;
                });

        },
        movie: function (action, data) {
            var toreturn;
            switch (action) {
            case 'get':
                toreturn = JSON.parse(localStorage.getItem('movie-' + data));
                break;
            case 'add':
                if (!localStorage.getItem('movie-' + data.imdb_id)) {
                    localStorage.setItem('movie-' + data.imdb_id, JSON.stringify(data));
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
                    localStorage.setItem('show-' + data.imdb_id, JSON.stringify(data));
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
        },
        watched: function (action, type, data) {
            console.log(action, type, data);
            var toreturn, item;
            if (type && data) {
                switch (type) {
                case 'show':
                    if (action === 'get-all') {
                        item = 'watched-' + type + '-' + data.imdb_id + '-' + data.tvdb_id;
                    } else {
                        item = 'watched-' + type + '-' + data.imdb_id + '-' + data.tvdb_id + '-' + data.episode_id;
                    }
                    break;
                case 'movie':
                    item = 'watched-' + type + '-' + data;
                    break;
                }
            }
            switch (action) {
            case 'get-all':
            case 'get':
                var watcheditems = {};
                for (var key in localStorage) {
                    if (key.toString().includes(item)) {
                        var i;
                        var d = key.split('-');
                        var type = d[1];
                        var imdb_id = d[2];
                        var tvdb_id, episode_id;
                        if (type === 'show') {
                            tvdb_id = d[3];
                            episode_id = d[4];
                            i = tvdb_id;
                        } else {
                            i = imdb_id;
                            tvdb_id = false;
                            episode_id = false;
                        }

                        var newwatched = {
                            'type': type,
                            'imdb_id': imdb_id,
                            'tvdb_id': tvdb_id,
                            'episode_id': episode_id
                        };
                        watcheditems[i] = newwatched;
                        console.log(watcheditems, episode_id);
                    }
                }
                toreturn = watcheditems;
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