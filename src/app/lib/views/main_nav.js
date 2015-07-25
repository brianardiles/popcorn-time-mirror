(function (App) {
    'use strict';

    App.View.MainNav = Backbone.Marionette.ItemView.extend({
        template: '#main-nav-tpl',
        tagName: 'ul',

        events: {
            'click #nav-settings a': 'settings',
            'click #nav-about a': 'about',
            'click #nav-random a': 'randomMovie',
            'click #nav-movies a': 'showMovies',
            'click #nav-shows a': 'showShows',
            'click #nav-anime a': 'showAnime',
            'click #nav-bookmarks a': 'showFavorites',
            'click #nav-watchlist a': 'showWatchlist',
            'click #nav-collection a': 'showTorrentCollection',
            'click #nav-vpn a': 'vpnConnect',
            'click #nav-update a': 'showUpdater',
        },

        initialize: function () {
            App.vent.on('enableUpdatericon', _.bind(this.showUpdate, this));

            App.vent.on('nav:hide', _.bind(this.hideNav, this));
            App.vent.on('nav:show', _.bind(this.showNav, this));
        },

        hideNav: function () {
            $('#main-nav').addClass('hide');
        },

        showNav: function () {
            $('#main-nav').removeClass('hide');
        },

        setactive: function (set) {
            if (AdvSettings.get('startScreen') === 'Last Open' && set !== 'Updater') {
                AdvSettings.set('lastTab', set);
            }
            $('.right .search').show();
            $('#nav-random').hide();
            $('nav').find('.active').removeClass('active');
            switch (set) {
            case 'TV Series':
            case 'shows':
                $('#nav-shows a').addClass('active');
                break;
            case 'Movies':
            case 'movies':
                $('#nav-random').show();
                $('#nav-movies a').addClass('active');
                break;
            case 'Anime':
            case 'anime':
                $('#nav-anime a').addClass('active');
                break;
            case 'Favorites':
            case 'favorites':
                $('.right .search').hide();
                $('#nav-favorites a').addClass('active');
                break;
            case 'Watchlist':
            case 'watchlist':
                $('.right .search').hide();
                $('#nav-watchlist a').addClass('active');
                break;
            case 'Torrent-collection':
                $('.right .search').hide();
                $('#nav-collection a').addClass('active');
                break;
            case 'Updater':
                $('.right .search').hide();
                break;
            }
        },

        onShow: function () {

            var activetab;

            if (AdvSettings.get('startScreen') === 'Last Open') {
                activetab = AdvSettings.get('lastTab');
            } else {
                activetab = AdvSettings.get('startScreen');
            }

            if (typeof App.currentview === 'undefined') {

                switch (activetab) {
                case 'TV Series':
                    App.currentview = 'shows';
                    break;
                case 'Movies':
                    App.currentview = 'movies';
                    break;
                case 'Anime':
                    App.currentview = 'anime';
                    break;
                case 'Favorites':
                    App.currentview = 'Favorites';
                    App.previousview = 'movies';
                    break;
                case 'Watchlist':
                    App.currentview = 'Watchlist';
                    App.previousview = 'movies';
                    break;
                case 'Torrent-collection':
                    App.currentview = 'Torrent-collection';
                    App.previousview = 'movies';
                    break;
                default:
                    App.currentview = 'movies';
                }
                this.setactive(App.currentview);
            }
            // update VPN icon with cached status
            App.VPNClient.setVPNStatusCached();
        },
        showUpdate: function () {
            App.updateAvailable = true;
            $('#nav-update').show();

        },
        settings: function (e) {
            App.vent.trigger('about:close');
            App.vent.trigger('settings:show');
        },

        about: function (e) {
            App.vent.trigger('about:show');
        },

        showTorrentCollection: function (e) {
            e.preventDefault();

            if (App.currentview !== 'Torrent-collection') {
                App.previousview = App.currentview;
                App.currentview = 'Torrent-collection';
                App.vent.trigger('about:close');
                App.vent.trigger('torrentCollection:show');
                this.setactive('Torrent-collection');
            } else {
                App.currentview = App.previousview;
                App.vent.trigger('torrentCollection:close');
                this.setactive(App.currentview);
            }
        },
        showUpdater: function (e) {
            e.preventDefault();

            if (App.currentview !== 'Updater') {
                App.previousview = App.currentview;
                App.currentview = 'Updater';
                App.vent.trigger('about:close');
                App.vent.trigger('updater:show', App.Updaterv2.updateModel);
                this.setactive('Updater');
            } else {
                App.currentview = App.previousview;
                App.vent.trigger('updater:close');
                this.setactive(App.currentview);
            }
        },


        showShows: function (e) {
            e.preventDefault();
            App.currentview = 'shows';
            App.vent.trigger('about:close');
            App.vent.trigger('torrentCollection:close');
            App.vent.trigger('shows:list', []);
            this.setactive('TV Series');
        },

        showAnime: function (e) {
            e.preventDefault();
            App.currentview = 'anime';
            App.vent.trigger('about:close');
            App.vent.trigger('torrentCollection:close');
            App.vent.trigger('anime:list', []);
            this.setactive('Anime');
        },

        showMovies: function (e) {
            e.preventDefault();

            App.currentview = 'movies';
            App.vent.trigger('about:close');
            App.vent.trigger('torrentCollection:close');
            App.vent.trigger('movies:list', []);
            this.setactive('Movies');
        },

        showFavorites: function (e) {
            e.preventDefault();
            App.previousview = App.currentview;
            App.currentview = 'Favorites';
            App.vent.trigger('about:close');
            App.vent.trigger('torrentCollection:close');
            App.vent.trigger('favorites:list', []);
            this.setactive('Favorites');


        },

        showWatchlist: function (e) {
            e.preventDefault();

            if (App.currentview !== 'Watchlist') {
                App.previousview = App.currentview;
                App.currentview = 'Watchlist';
                App.vent.trigger('about:close');
                App.vent.trigger('torrentCollection:close');
                App.vent.trigger('watchlist:list', []);
                this.setactive('Watchlist');
            } else {
                if ($('#movie-detail').html().length === 0 && $('#about-container').html().length === 0) {
                    App.currentview = App.previousview;
                    App.vent.trigger(App.previousview.toLowerCase() + ':list', []);
                    this.setactive(App.currentview);

                } else {
                    App.vent.trigger('about:close');
                    App.vent.trigger('torrentCollection:close');
                    App.vent.trigger('watchlist:list', []);
                    this.setactive('Watchlist');
                }

            }
            return false;
        },

        vpnConnect: function (e) {
            e.preventDefault();
            App.vent.trigger('vpn:connect');
        },

        randomMovie: function () {
            var that = this;
            $('.spinner').show();

            App.Providers.get('Yts').random()
                .then(function (data) {
                    if (App.watchedMovies.indexOf(data.imdb_code) !== -1) {
                        that.randomMovie();
                        return;
                    }
                    that.model.set({
                        isRandom: true,
                        keywords: data.imdb_code,
                        genre: ''
                    });
                    App.vent.trigger('movie:closeDetail');
                    App.vent.on('list:loaded', function () {
                        if (that.model.get('isRandom')) {
                            $('.main-browser .items .cover')[0].click();
                            that.model.set('isRandom', false);
                        }
                    });
                })
                .catch(function (err) {
                    $('.spinner').hide();
                    $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                });
        }
    });
})(window.App);
