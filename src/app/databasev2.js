// Global App skeleton for backbone
var App = new Backbone.Marionette.Application();

App.startupTime = window.performance.now();

(function (App) {
    'use strict';
    var Q = require('q');

    var Database = Backbone.Model.extend({
        initialize: function () {
            App.vent.on('watched', _.bind(this.watched, this));
        },
        setting: function (action, data) {
            var toreturn;
            switch (action) {
            case 'get':
                toreturn = JSON.parse(localStorage.getItem('setting-' + data.key));
                break;
            case 'set':
                localStorage.setItem('setting-' + data.key, JSON.stringify(data.value));
                toreturn = true;
                break;
            case 'remove':
                localStorage.removeItem('setting-' + data.key);
                toreturn = true;
                break;
            }
            return Q(toreturn);
        },
        delete: function (db) {
            switch (db) {
            case 'watched':
                for (var key in localStorage) {
                    if (key.toString().includes('watched')) {
                        localStorage.removeItem(key);
                    }
                }
                break;
            case 'bookmarks':
                for (var key in localStorage) {
                    if (key.includes('bookmark') || key.includes('movie') || key.includes('show')) {
                        localStorage.removeItem(key);
                    }
                }
                break;
            case 'settings':
                for (var key in localStorage) {
                    if (key.includes('setting')) {
                        localStorage.removeItem(key);
                    }
                }
                break;
            case 'all':
                localStorage.clear();
                break;
            }
            return Q(true);
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
                var watched;
                for (var key in localStorage) {
                    if (key.toString().includes(item)) {
                        var d = key.split('-');
                        var type = d[1];
                        var imdb_id = d[2];
                        var tvdb_id, episode_id;
                        if (type === 'show') {
                            tvdb_id = d[3];
                            episode_id = d[4];
                            watched = {
                                'type': type,
                                'imdb_id': imdb_id,
                                'tvdb_id': tvdb_id,
                                'episode_id': episode_id
                            };
                        } else {
                            watched = {
                                'type': type,
                                'imdb_id': imdb_id
                            };
                        }
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