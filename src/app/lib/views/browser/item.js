(function (App) {
    'use strict';

    var prevX = 0;
    var prevY = 0;

    var Item = Backbone.Marionette.ItemView.extend({
        template: '#item-tpl',

        tagName: 'li',
        className: 'item',

        attributes: function () {
            return {
                'data-imdb-id': this.model.get('imdb_id')
            };
        },

        ui: {
            cover: 'img',
            bookmarkIcon: '.actions-favorites',
            watchedIcon: '.actions-watched'
        },
        events: {
            'click .actions-favorites': 'toggleFavorite',
            'click .actions-watched': 'toggleWatched',
            'click img': 'showDetail',
            'mouseover .cover': 'hoverItem'
        },

        initialize: function () {

            var imdb = this.model.get('imdb_id'),
                itemtype = this.model.get('type'),
                images = this.model.get('images'),
                img = (images) ? images.poster : this.model.get('image'),
                watched, bookmarked, cached, that = this;

            App.Database.bookmark('check', this.model.get('type'), imdb).then(function (d) {
                bookmarked = d;
                that.model.set('bookmarked', bookmarked);
                App.Database.watched('check', that.model.get('type'), imdb).then(function (w) {
                    watched = w;
                    that.model.set('watched', watched);
                });
            });

            switch (itemtype) {
            case 'bookmarkedshow':
                this.model.set('image', App.Trakt.resizeImage(img, 'thumb'));
                break;
            case 'show':
                this.model.set('image', App.Trakt.resizeImage(img, 'thumb'));
                break;
            case 'bookmarkedmovie':
            case 'movie':
                this.model.set('image', img);
                break;
            }

            var date = new Date();
            var today = ('0' + (date.getMonth() + 　1)).slice(-2) + ('0' + (date.getDate())).slice(-2);
            if (today === '0401') { //april's fool
                var title = this.model.get('title');
                var titleArray = title.split(' ');
                var modified = false;
                var toModify;
                if (titleArray.length !== 1) {
                    for (var i = 0; i < titleArray.length; i++) {
                        if (titleArray[i].length > 3 && !modified) {
                            if (Math.floor((Math.random() * 10) + 1) > 5) { //random
                                titleArray[i] = 'Popcorn';
                                modified = true;
                            }
                        }
                    }
                }
                this.model.set('title', titleArray.join(' '));
            }
        },

        onShow: function () {
            this.loadCover();
        },


        onDestroy: function () {

        },


        loadCover: function () {
            var coverCache = new Image();
            coverCache.src = this.model.get('image');
            var that = this;
            coverCache.onload = function () {
                try {
                    that.ui.cover.addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };
            coverCache.onerror = function () {
                try {
                    that.ui.cover.attr('src', 'url("images/posterholder.png")').addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };


        },

        showDetail: function (e) {
            e.preventDefault();
            var provider = App.Providers.get(this.model.get('provider'));
            var data;
            var type = this.model.get('type');
            switch (type) {
            case 'bookmarkedmovie':
                var SelectedMovie = new Backbone.Model({
                    imdb_id: this.model.get('imdb_id'),
                    image: this.model.get('image'),
                    cover: this.model.get('cover'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    genre: this.model.get('genre'),
                    synopsis: this.model.get('synopsis'),
                    runtime: this.model.get('runtime'),
                    year: this.model.get('year'),
                    health: this.model.get('health'),
                    subtitle: this.model.get('subtitle'),
                    backdrop: this.model.get('backdrop'),
                    rating: this.model.get('rating'),
                    trailer: this.model.get('trailer'),
                    provider: this.model.get('provider'),
                    watched: this.model.get('watched'),
                    bookmarked: true,
                });

                App.vent.trigger('movie:showDetail', SelectedMovie);
                break;

            case 'bookmarkedshow':
                type = 'show';
                /* falls through */
            case 'show':
            case 'movie':
                var Type = type.charAt(0).toUpperCase() + type.slice(1);
                this.model.set('health', false);
                var that = this;
                $('.spinner').show();
                data = provider.detail(this.model.get('imdb_id'), this.model.attributes)
                    .catch(function () {
                        $('.spinner').hide();
                        $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                    })
                    .then(function (data) {
                        data.provider = provider.name;
                        data.bookmarked = that.model.get('bookmarked');
                        Q.all([
                            that.getCast(),
                            that.getSeasonImages(),
                            that.getColor()
                        ]).spread(function (cast, images, color) {
                            data.cast = cast;
                            data.color = color.color;
                            data.textcolor = color.textcolor;
                            data.seasonImages = images;
                            console.log(data);
                            $('.spinner').hide();
                            App.vent.trigger(type + ':showDetail', new App.Model[Type](data));
                        });

                    });
                break;

            }
        },
        getColor: function () {
            var defer = Q.defer();
            var img = document.createElement('img');
            img.setAttribute('src', App.Trakt.resizeImage(this.model.get('image'), 'medium'));
            img.addEventListener('load', function () {
                var vibrant = new Vibrant(img, 64, 4);
                var swatches = vibrant.swatches();
                var color = null;
                var textColor = null;

                if (swatches['Vibrant']) {
                    if (swatches['Vibrant'].getPopulation() < 20) {
                        color = swatches['Muted'].getHex();
                        textColor = swatches['Muted'].getTitleTextColor();
                    } else {
                        color = swatches['Vibrant'].getHex();
                        textColor = swatches['Vibrant'].getTitleTextColor();
                    }
                } else if (swatches['Muted']) {
                    color = swatches['Muted'].getHex();
                    textColor = swatches['Muted'].getTitleTextColor();
                } else {
                    defer.resolve(null);
                }

                if (textColor === '#000' || textColor === '#000000') {
                    textColor = '#111214';
                }

                if (color && textColor) {
                    defer.resolve({
                        color: color,
                        textcolor: textColor
                    });
                } else {
                    defer.resolve(null);
                }

                img.remove();
            });
            img.addEventListener('error', function () {
                defer.resolve(null);
                img.remove();
            });
            return defer.promise;
        },

        getSeasonImages: function () {
            var that = this;
            var defer = Q.defer();
            var type = this.model.get('type');
            if (type === 'show') {
                App.Trakt.seasons.summary(this.model.get('imdb_id'))
                    .then(function (images) {
                        if (!images) {
                            win.warn('Unable to fetch data from Trakt.tv');
                            defer.resolve({});
                        } else {
                            defer.resolve(images);
                        }
                    }).catch(function (err) {
                        console.log(err);
                        defer.resolve({});
                    });
            } else {
                defer.resolve({});
            }
            return defer.promise;
        },
        getCast: function () {
            var that = this;
            var type = this.model.get('type');
            var defer = Q.defer();
            switch (type) {

            case 'show':
                App.Trakt.shows.people(this.model.get('imdb_id'))
                    .then(function (people) {
                        if (!people) {
                            defer.resolve({});
                            win.warn('Unable to fetch data from Trakt.tv');
                        } else {
                            defer.resolve(people);
                        }
                    }).catch(function (err) {
                        console.log(err);
                        defer.resolve({});
                    });

                break;
            case 'movie':
                App.Trakt.movies.people(this.model.get('imdb_id'))
                    .then(function (people) {
                        if (!people) {
                            defer.resolve({});
                            win.warn('Unable to fetch data from Trakt.tv');
                        } else {
                            defer.resolve(people);
                        }
                    }).catch(function (err) {
                        console.log(err);
                        defer.resolve({});
                    });
                break;

            }
            return defer.promise;
        },
        toggleWatched: function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (this.model.get('watched')) {
                this.ui.watchedIcon.removeClass('selected');
                if (Settings.watchedCovers === 'fade') {
                    this.$el.removeClass('watched');
                }
                this.model.set('watched', false);
                App.vent.trigger('watched', 'remove', 'movie', this.model.get('imdb_id'));
            } else {
                this.ui.watchedIcon.addClass('selected');
                switch (Settings.watchedCovers) {
                case 'fade':
                    this.$el.addClass('watched');
                    break;
                case 'hide':
                    this.$el.remove();
                    break;
                }
                this.model.set('watched', true);
                App.vent.trigger('watched', 'add', 'movie', this.model.get('imdb_id'));
            }

            this.ui.watchedIcon.tooltip({
                title: this.ui.watchedIcon.hasClass('selected') ? i18n.__('Mark as unseen') : i18n.__('Mark as Seen')
            });
        },

        toggleFavorite: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            var provider = App.Providers.get(this.model.get('provider'));
            var data;

            switch (this.model.get('type')) {
            case 'bookmarkedshow':
                App.Database.bookmark('remove', 'show', this.model.get('imdb_id'))
                    .then(function () {

                        win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                        that.model.set('bookmarked', false);
                        App.Database.show('remove', that.model.get('imdb_id'));


                        // we'll delete this element from our list view
                        $(e.currentTarget).closest('li').animate({
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            width: '0%',
                            opacity: 0
                        }, 500, function () {
                            $(this).remove();
                            $('.items').append($('<li/>').addClass('item ghost'));
                            if ($('.items li').length === 0) {
                                App.vent.trigger('movies:list', []);
                            }
                        });
                    });
                break;
            case 'bookmarkedmovie':
                App.Database.bookmark('remove', 'movie', this.model.get('imdb_id'))
                    .then(function () {
                        win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');

                        App.Database.movie('remove', that.model.get('imdb_id'));
                        that.model.set('bookmarked', false);
                        // we'll delete this element from our list view
                        $(e.currentTarget).closest('li').animate({
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            width: '0%',
                            opacity: 0
                        }, 500, function () {
                            $(this).remove();
                            $('.items').append($('<li/>').addClass('item ghost'));
                            if ($('.items li').length === 0) {
                                App.vent.trigger('movies:list', []);
                            }
                        });
                    });
                break;

            case 'movie':
                if (this.model.get('bookmarked')) {
                    this.ui.bookmarkIcon.removeClass('selected');
                    App.Database.bookmark('remove', 'movie', this.model.get('imdb_id'))
                        .then(function () {
                            win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                            // we'll make sure we dont have a cached movie
                            return App.Database.movie('remove', that.model.get('imdb_id'));
                        })
                        .then(function () {
                            that.model.set('bookmarked', false);
                        });
                } else {
                    this.ui.bookmarkIcon.addClass('selected');

                    if (this.model.get('imdb_id').indexOf('mal') !== -1 && this.model.get('item_data') === 'Movie') {
                        // Anime
                        data = provider.detail(this.model.get('imdb_id'), this.model.attributes)
                            .catch(function () {
                                $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                            })
                            .then(function (data) {
                                var movie = {
                                    imdb_id: data.imdb_id,
                                    image: data.image,
                                    cover: data.cover,
                                    torrents: {}, //
                                    title: data.title,
                                    genre: {}, //
                                    synopsis: data.synopsis,
                                    runtime: data.runtime,
                                    year: data.year,
                                    health: false,
                                    subtitle: data.subtitle,
                                    backdrop: undefined,
                                    rating: data.rating,
                                    trailer: false,
                                    provider: that.model.get('provider'),
                                };
                                movie.torrents = data.torrents;
                                movie.genre = data.genre;

                                App.Database.movie('add', movie).then(function () {
                                    return App.Database.bookmark('add', 'movie', that.model.get('imdb_id'));
                                }).then(function () {
                                    win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                                    that.model.set('bookmarked', true);
                                });

                            });
                    } else {
                        // Movie
                        var movie = {
                            imdb_id: this.model.get('imdb_id'),
                            image: this.model.get('image'),
                            cover: this.model.get('cover'),
                            torrents: this.model.get('torrents'),
                            title: this.model.get('title'),
                            genre: this.model.get('genre'),
                            synopsis: this.model.get('synopsis'),
                            runtime: this.model.get('runtime'),
                            year: this.model.get('year'),
                            health: this.model.get('health'),
                            subtitle: this.model.get('subtitle'),
                            backdrop: this.model.get('backdrop'),
                            rating: this.model.get('rating'),
                            trailer: this.model.get('trailer'),
                            provider: this.model.get('provider'),
                        };

                        App.Database.movie('add', movie).then(function () {
                            return App.Database.bookmark('add', 'movie', that.model.get('imdb_id'));
                        }).then(function () {
                            win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                            that.model.set('bookmarked', true);
                        });

                    }
                }
                break;
            case 'show':
                if (this.model.get('bookmarked') === true) {
                    this.ui.bookmarkIcon.removeClass('selected');
                    this.model.set('bookmarked', false);

                    App.Database.bookmark('remove', 'show', this.model.get('imdb_id')).then(function () {
                        win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                        // we'll make sure we dont have a cached show
                        App.Database.show('remove', that.model.get('imdb_id'));
                    });

                } else {
                    this.model.set('bookmarked', true);
                    this.ui.bookmarkIcon.addClass('selected');
                    data = provider.detail(this.model.get('imdb_id'), this.model.attributes)
                        .then(function (data) {
                                data.provider = that.model.get('provider');
                                App.Database.show('add', data)
                                    .then(function (d) {
                                        return App.Database.bookmark('add', 'show', that.model.get('imdb_id'));
                                    })
                                    .then(function () {
                                        win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                                        that.model.set('bookmarked', true);
                                        App.userBookmarks.push(that.model.get('imdb_id'));
                                    });
                            },
                            function (err) {
                                $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                            });
                }
                break;

            }

            this.ui.bookmarkIcon.tooltip({
                title: this.ui.bookmarkIcon.hasClass('selected') ? i18n.__('Remove from bookmarks') : i18n.__('Add to bookmarks')
            });
        }

    });

    App.View.Item = Item;
})(window.App);
