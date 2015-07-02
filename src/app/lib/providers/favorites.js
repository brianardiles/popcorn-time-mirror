(function (App) {
    'use strict';
    var Q = require('q');

    var Favorites = function () {};
    Favorites.prototype.constructor = Favorites;

    var queryTorrents = function (filters) {
        var deferred = Q.defer();
        App.Database.bookmark('get', 'all').then(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    var formatForPopcorn = function (items) {
        var ItemList = [];
        _.each(items, function (t, i) {
            var deferred = Q.defer();
            var type = t;
            var imdb_id = i;
            if (type === 'movie') {
                // its a movie
                App.Database.movie('get', imdb_id)
                    .then(function (data) {
                            data.type = 'bookmarkedmovie';
                            if (/slurm.trakt.us/.test(data.image)) {
                                data.image = data.image.replace(/slurm.trakt.us/, 'walter.trakt.us');
                            }
                            deferred.resolve(data);
                        },
                        function (err) {
                            deferred.reject(err);
                        });
            } else {
                // its a tv show
                var _data = {};
                App.Database.show('get', imdb_id)
                    .then(function (data) {
                        data.type = 'bookmarkedshow';
                        data.imdb = data.imdb_id;
                        console.log(data);
                        // This is an old boxart, fetch the latest boxart
                        if (/slurm.trakt.us/.test(data.images.poster)) {
                            // Keep reference to old data in case of error
                            _data = data;
                            var provider = App.Providers.get(data.provider);
                            return provider.detail(data.imdb_id, data);
                        } else {
                            data.image = data.images.poster;
                            deferred.resolve(data);
                            return null;
                        }
                    }, function (err) {
                        deferred.reject(err);
                    }).then(function (data) {
                        if (data) {
                            // Cache new show and return
                            App.Database.show('add', data)
                            data.type = 'bookmarkedshow';
                            data.imdb = data.imdb_id;
                            data.image = data.images.poster;
                            deferred.resolve(data);
                        }
                    }, function (err) {
                        // Show no longer exists on provider
                        // Scrub bookmark and TV show
                        // But return previous data one last time
                        App.Database.show('remove', _data.imdb_id);
                        App.Database.bookmark('remove', 'show', _data.imdb_id);
                        deferred.resolve(_data);
                    });
            }
            ItemList.push(deferred.promise);
        });

        return Q.all(ItemList);
    };

    Favorites.prototype.extractIds = function (items) {
        return _.pluck(items, 'imdb_id');
    };

    Favorites.prototype.fetch = function (filters) {
        return queryTorrents(filters).then(formatForPopcorn);
    };

    App.Providers.Favorites = Favorites;

})(window.App);