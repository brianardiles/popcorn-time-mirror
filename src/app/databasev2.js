(function (App) {
    'use strict';
    var Q = require('q');

    var Database = Backbone.Model.extend({

        initialize: function () {
            var startupTime = window.performance.now();
            console.debug('Database path: ' + data_path);

            App.vent.on('show:watched', _.bind(this.watched, this));
            App.vent.on('show:unwatched', _.bind(this.watched, this));
            App.vent.on('movie:watched', _.bind(this.watched, this));
            App.vent.on('movie:unwatched', _.bind(this.watched, this));

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
            var item, toreturn;
            switch (type) {
            case 'show':
                item = 'watched-' + type + '-' + data.imdb_id + '-' + data.tvdb_id + '-' + data.episode_id;
                break;
            case 'movie':
                item = 'watched-' + type + '-' + data.imdb_id;
                break;
            }
            switch (action) {
            case 'check':
                if (localStorage.getItem(item)) {
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