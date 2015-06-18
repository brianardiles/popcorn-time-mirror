(function (App) {
    'use strict';

    var Q = require('q');
    var request = require('request');
    var inherits = require('util').inherits;

    var URL = "http://localhost:8080/tododarteapi-video.json";

    function Cubarte() {
        if (!(this instanceof Cubarte)) {
            return new Cubarte();
        }

        App.Providers.Generic.call(this);
    }
    inherits(Cubarte, App.Providers.Generic);

    Cubarte.prototype.extractIds = function (items) {
        return _.pluck(items.results, 'ref');
    };

    var format = function (data) {
        var results = _.chain(data.resources)
                .map(function (movie) {
                return {
                    type: 'movie',
                    imdb_id: movie.ref,
                    ref: movie.ref,
                    title: movie.field8,
                    year: movie.creation_date.split('-')[0],
                    genre: ['FIXME'],
                    rating: movie.rating,
                    runtime: 'FIXME',
                    image: movie.preview,
                    cover: movie.preview,
                    backdrop: movie.preview,
                    synopsis: movie.field3,
                    trailer: false,
                    certification: false,
                    torrents: {
                        '720p': {
                            url: movie.download_url,
                            magnet: 'magnet:?xt=urn:btih:' + movie.download_url + '&tr=udp://open.demonii.com:1337&tr=udp://tracker.coppersurfer.tk:6969',
                            size: 0,
                            filesize: 0,
                            seed: 0,
                            peer: 0,
                        }
                    }
                };
            }).value();

        return {
            results: results,
            hasMore: data.movie_count > data.page_number * data.limit
        };
    };

    Cubarte.prototype.fetch = function (filters) {
        var params = {
            sort_by: 'seeds',
            limit: 50,
            with_rt_ratings: true
        };

        if (filters.page) {
            params.page = filters.page;
        }

        if (filters.keywords) {
            params.query_term = filters.keywords;
        }

        if (filters.genre) {
            params.genre = filters.genre;
        }

        if (filters.order === 1) {
            params.order_by = 'asc';
        }

        if (filters.sorter && filters.sorter !== 'popularity') {
            params.sort_by = filters.sorter;
        }

        if (Settings.movies_quality !== 'all') {
            params.quality = Settings.movies_quality;
        }

        if (Settings.translateSynopsis) {
            params.lang = Settings.language;
        }

        var defer = Q.defer();

        request({
            uri: URL,
//            qs: params,
            strictSSL: false,
            json: true,
            timeout: 10000
        }, function (err, res, data) {
            if (err || res.statusCode >= 400) {
                return defer.reject(err || 'Status Code is above 400');
            } else if (!data || data.status === 'error') {
                err = data ? data.status_message : 'No data returned';
                return defer.reject(err);
            } else {
                return defer.resolve(format(data));
            }
        });

        return defer.promise;
    };

    Cubarte.prototype.random = function () {
        var defer = Q.defer();
        request({
            uri: 'http://cloudflare.com/api/v2/get_random_movie.json?' + Math.round((new Date()).valueOf() / 1000) + '&with_images=true',
            headers: {
                'Host': 'eqwww.image.yt'
            },
            strictSSL: false,
            json: true,
            timeout: 10000
        }, function (err, res, data) {
            if (err || res.statusCode >= 400) {
                return defer.reject(err || 'Status Code is above 400');
            } else if (!data || data.status === 'error') {
                err = data ? data.status_message : 'No data returned';
                return defer.reject(err);
            } else {
                return defer.resolve(data.data);
            }
        });
        return defer.promise;
    };

    Cubarte.prototype.detail = function (torrent_id, old_data) {
        return Q(old_data);
    };

    App.Providers.Cubarte = Cubarte;
})(window.App);
