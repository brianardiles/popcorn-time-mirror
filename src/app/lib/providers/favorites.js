(function (App) {
    'use strict';
    var Q = require('q');

    var Favorites = function () {};
    Favorites.prototype.constructor = Favorites;

    var queryTorrents = function (filters) {
        var deferred = Q.defer();

        App.Databasev2.getBookmarks().then(function (data) {
            deferred.resolve(data);
        });

        return deferred.promise;
    };

    var formatForPopcorn = function (items) {
        var ItemList = [];
        _.each(items, function (i) {
            var deferred = Q.defer();
            var type = i.type;
            App.Databasev2.getCached(i).then(function (cached) {
                if (cached) {
                    if (type === 'show') {
                        cached.data.image = cached.data.images.poster;
                    }
                    deferred.resolve(cached.data);
                }
            });
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
