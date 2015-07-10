(function (App) {
    'use strict';

    var request = require('request'),
        URI = require('URIjs'),
        Q = require('q'),
        _ = require('underscore'),
        inherits = require('util').inherits;

    var API_ENDPOINT = URI('http://sg.media-imdb.com');


    function Imdb() {
        App.Providers.CacheProviderV2.call(this, 'metadata');

        var self = this;

        _.each(this.suggestions, function (method, key) {
            self.suggestions[key] = method.bind(self);
        });


    }

    /*
     * Cache
     */

    inherits(Imdb, App.Providers.CacheProviderV2);

    function MergePromises(promises) {
        return Q.all(promises).then(function (results) {
            return _.unique(_.flatten(results));
        });
    }

    Imdb.prototype.cache = function (key, ids, func) {
        var self = this;
        return this.fetch(ids).then(function (items) {
            var nonCachedIds = _.difference(ids, _.pluck(items, key));
            return MergePromises([
                Q(items),
                func(nonCachedIds).then(self.store.bind(self, key))
            ]);
        });
    };

    /*
     * Imdb
     */

    Imdb.prototype.suggestions = {
        get: function (string, type) {
            var defer = Q.defer();

            var parts = {
                protocol: 'http',
                hostname: 'sg.media-imdb.com',
                path: 'suggests/' + string.charAt(0) + '/' + string + '.json'
            };
            var requestUri = URI.build(parts);
            console.log(requestUri)

            request({
                method: 'GET',
                url: requestUri.toString(),
            }, function (error, response, body) {
                if (error || !body) {
                    defer.reject(error);
                } else if (response.statusCode >= 400) {
                    defer.resolve({});
                } else {
                    defer.resolve(body);
                }
            });


            return defer.promise;
        }
    };

    App.Providers.Imdb = Imdb;
})(window.App);
