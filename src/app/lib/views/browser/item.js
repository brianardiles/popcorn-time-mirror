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
                'data-imdb-id': this.model.get('imdb_id'),
                'data-type': this.model.get('type')
            };
        },

        ui: {
            cover: 'img',
            infowrapper: '.info',
            infofab: '.info paper-fab',
            infodot: '.info .meta .dot',
            bookmarkIcon: '.actions-favorites',
            watchedIcon: '.actions-watched'
        },

        events: {
            'click .actions-favorites': 'toggleFavorite',
            'click .actions-watched': 'toggleWatched',
            'click img': 'showDetail',
            'click .info': 'showDetail',
            'mouseover': 'hoverItem',
            'click #play-action': 'clickplay'
        },

        initialize: function () {
            this.dummyclosed = true;
            var imdb = this.model.get('imdb_id'),
                itemtype = this.model.get('type'),
                images = this.model.get('images'),
                img = (images) ? images.poster : this.model.get('image'),
                watched, bookmarked, cached, that = this;

            App.Databasev2.checkBookmarked(this.model.attributes).then(function (b) {
                that.model.set('bookmarked', b);
            });
            App.Databasev2.checkWatched(this.model.attributes).then(function (w) {
                that.model.set('watched', w);
            });
            switch (itemtype) {
            case 'bookmarkedshow':
                this.model.set('image', App.Trakt.resizeImage(img, 'medium'));
                break;
            case 'show':
                this.model.set('image', App.Trakt.resizeImage(img, 'medium'));
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
            if (!this.model.get('rating')) {
                this.model.set('rating', 'NaN');
            } else if (itemtype !== 'movie') {
                var rating = this.model.get('rating').percentage / 10;
                rating = Math.round(rating * 2) / 2;
                this.model.set('rating', rating);
            }

        },

        onShow: function () {
            this.loadCover();
            this.listenEvents();
        },

        listenEvents: function () {
            this.listenTo(App.vent, 'bookmarked', function (data, remove) {
                if (data.imdb_id === this.model.get('imdb_id')) {
                    if (!remove) {
                        this.model.set('bookmarked', true);
                    } else {
                        this.model.set('bookmarked', false);
                    }
                }
            });
            this.listenTo(App.vent, 'watched', function (data, remove) {
                if (data.imdb_id === this.model.get('imdb_id') && data.type !== 'show') {
                    if (!remove) {
                        this.model.set('watched', true);
                    } else {
                        this.model.set('watched', false);
                    }
                }
            });
            this.listenTo(App.vent, 'dummy:closeDetail', function () {
                this.dummyclosed = false;
            });

        },
        onDestroy: function () {

        },

        hoverItem: function () {
            var that = this;
            if (!this.backgroundset) {
                this.getColor(true).then(function (color) {
                    that.model.set('color', color.color);
                    that.ui.infowrapper.css('background', color.color);
                    that.ui.infowrapper.css('color', color.textcolor);
                    that.ui.infodot.css('background', color.textcolor);
                    that.ui.infofab.css('background', color.fab);
                    that.backgroundset = true;
                });
            }

        },
        loadCover: function () {
            var coverCache = new Image();
            coverCache.src = this.model.get('image');
            var that = this;
            coverCache.onload = function () {
                try {
                    that.model.set('image', App.Trakt.resizeImage(that.model.get('image'), 'medium'));
                    that.ui.cover.addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };
            coverCache.onerror = function () {
                try {
                    that.model.set('image', 'images/posterholder.png');
                    that.ui.cover.attr('src', 'images/posterholder.png').addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };


        },

        clickplay: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.model.get('type') === 'movie') {
                var that = this;
                _.delay(function () {
                    _.defer(_.bind(that.play, that));
                }, 300);
            } else {
                _.defer(_.bind(this.play, this));
            }
        },
        play: function () {
            var provider = App.Providers.get(this.model.get('provider'));
            var type = this.model.get('type');
            switch (type) {
            case 'bookmarkedmovie':
                var SelectedMovie = new Backbone.Model({
                    imdb_id: this.model.get('imdb_id'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    subtitle: this.model.get('subtitle'),
                    backdrop: this.model.get('backdrop'),
                    provider: this.model.get('provider'),
                    watched: this.model.get('watched')
                });
                break;
            case 'bookmarkedshow':
                type = 'show';
                /* falls through */
            case 'show':
            case 'movie':
                var that = this;
                provider.detail(this.model.get('imdb_id'), this.model.attributes)
                    .catch(function () {
                        $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                    })
                    .then(function (data) {
                        Q.all([
                            that.getSeasonImages(),
                            that.getColor()
                        ]).spread(function (images, color) {
                            data.color = color.color;
                            data.seasonImages = images;
                            that.startStreaming(data);
                        });

                    });
                break;
            }
        },

        startStreaming: function (data) {
            var type = this.model.get('type');

            switch (type) {
            case 'movie':
                var quality = null;
                var fallbackOrder = ['720p', '1080p'];
                if (data.torrents[Settings.movies_default_quality]) {
                    quality = Settings.movies_default_quality;
                } else {
                    $.each(fallbackOrder, function (index, value) {
                        if (quality == null && data.torrents[value]) {
                            quality = value;
                        }
                    });
                }
                var torrentStart = {
                    torrent: data.torrents[quality].magnet,
                    metadata: {
                        backdrop: data.backdrop,
                        title: data.title,
                        imdb_id: data.imdb_id,
                        color: data.color,
                        quality: quality
                    },
                    subtitles: data.subtitle,
                    defaultSubtitle: Settings.subtitle_language,
                    type: 'movie',
                    device: App.Device.Collection.selected
                };
                App.Streamer.start(torrentStart);
                break;
            case 'show':
                var that = this;
                this.getShowEpisode(data).then(function (episodedata) {
                    var title = that.model.get('title');
                    var episode = episodedata.episode;
                    var episode_id = episodedata.tvdb_id;
                    var season = episodedata.season;
                    var name = episodedata.title;

                    var episodes = [];
                    var episodes_data = [];
                    var selected_quality = episodedata.quality;

                    if (AdvSettings.get('playNextEpisodeAuto') && that.model.get('imdb_id').indexOf('mal') === -1) {
                        _.each(data.episodes, function (value) {
                            var epaInfo = {
                                id: parseInt(value.season) * 100 + parseInt(value.episode),
                                title: value.title,
                                torrents: value.torrents,
                                season: value.season,
                                episode: value.episode,
                                episode_id: value.tvdb_id,
                                tvdb_id: that.model.get('tvdb_id'),
                                imdb_id: that.model.get('imdb_id')
                            };
                            episodes_data.push(epaInfo);
                            episodes.push(parseInt(value.season) * 100 + parseInt(value.episode));
                        });
                        episodes.sort();
                        episodes_data = _.sortBy(episodes_data, 'id');

                    } else {
                        episodes = null;
                        episodes_data = null;
                    }

                    var torrentStart = {
                        torrent: episodedata.torrent,
                        type: 'show',
                        metadata: {
                            title: title + ' - ' + i18n.__('Season') + ' ' + season + ', ' + i18n.__('Episode') + ' ' + episode + ' - ' + name,
                            showName: title,
                            season: season,
                            episode: episode,
                            episodeName: name,
                            tvdb_id: data.tvdb_id,
                            episode_id: episode_id,
                            imdb_id: that.model.get('imdb_id'),
                            backdrop: data.images.fanart,
                            quality: selected_quality,
                            color: data.color
                        },
                        autoPlayData: {
                            episodes: episodes,
                            streamer: 'main',
                            episodes_data: episodes_data
                        },
                        defaultSubtitle: Settings.subtitle_language,
                        device: App.Device.Collection.selected
                    };
                    App.Streamer.start(torrentStart);
                });
                break;
            }

        },


        getShowEpisode: function (data) {
            var defer = Q.defer();
            var unWatchedEpisodes = [];
            var watchedEpisodes = [];
            var tvdb_id = data.tvdb_id;
            var imdb_id = data.imdb_id;
            var that = this;
            var episodes = data.episodes;
            var checkedEpisodes = [];
            episodes.forEach(function (episode, index, array) {
                var value = {
                    tvdb_id: tvdb_id,
                    imdb_id: imdb_id,
                    episode_id: episode.tvdb_id,
                    season: episode.season,
                    episode: episode.episode
                };
                App.Database.watched('check', 'show', value)
                    .then(function (watched) {
                        if (!watched) {
                            unWatchedEpisodes.push({
                                id: parseInt(episode.season) * 100 + parseInt(episode.episode),
                                season: episode.season,
                                episode: episode.episode
                            });
                        } else {
                            watchedEpisodes.push({
                                id: parseInt(episode.season) * 100 + parseInt(episode.episode),
                                season: episode.season,
                                episode: episode.episode
                            });
                        }
                        return true;
                    }).then(function () {
                        checkedEpisodes.push({
                            id: parseInt(episode.season) * 100 + parseInt(episode.episode),
                            season: episode.season,
                            episode: episode.episode,
                            tvdb_id: episode.tvdb_id,
                            torrents: episode.torrents,
                            title: episode.title
                        });
                        if (checkedEpisodes.length === episodes.length) {
                            that.selectNextEpisode(checkedEpisodes, unWatchedEpisodes, watchedEpisodes).then(function (rdata) {
                                defer.resolve(rdata);
                            });

                        }
                    });
            });
            return defer.promise;
        },


        selectNextEpisode: function (episodes, unWatchedEpisodes, watchedEpisodes) {
            var defer = Q.defer();
            episodes = _.sortBy(episodes, 'id');
            unWatchedEpisodes = _.sortBy(unWatchedEpisodes, 'id');
            var select;
            switch (Settings.tv_detail_jump_to) {
            case 'info':
                select = false;
                break;
            case 'next':
                if (watchedEpisodes.length === 0) {
                    select = false;
                } else {
                    if (unWatchedEpisodes.length > 0) {
                        select = _.last(unWatchedEpisodes);
                    } else {
                        select = _.last(episodes);
                    }
                }
                break;
            case 'firstUnwatched':
                if (watchedEpisodes.length === 0) {
                    select = false;
                } else {
                    if (unWatchedEpisodes.length > 0) {
                        select = _.first(unWatchedEpisodes);
                    } else {
                        select = _.last(episodes);
                    }
                }
                break;
            case 'first':
                select = _.first(episodes);
                break;
            case 'last':
                select = _.last(episodes);
                break;
            }

            if (select.season) {
                this.setEpisodeStream(select.episode, select.season, episodes).then(function (data) {
                    defer.resolve(data);
                });
            } else {
                var filtered = _(episodes).filter(function (item) {
                    return item.season !== 0
                });
                var select = _.first(filtered);
                this.setEpisodeStream(select.episode, select.season, episodes).then(function (data) {
                    defer.resolve(data);
                });
            }
            return defer.promise;

        },

        setEpisodeStream: function (episode, season, episodes) {
            var episodeData = _.findWhere(episodes, {
                season: season,
                episode: episode
            });
            var torrents = episodeData.torrents;
            var quality = null;
            var fallbackOrder = ['720p', '480p', '1080p'];
            if (torrents[Settings.shows_default_quality]) {
                quality = Settings.shows_default_quality;
            } else {
                $.each(fallbackOrder, function (index, value) {
                    if (quality == null && torrents[value]) {
                        quality = value;
                    }
                });
            }
            var Stream = {
                torrent: torrents[quality].url,
                quality: quality,
                title: episodeData.title,
                tvdb_id: episodeData.tvdb_id,
                season: season,
                episode: episode
            };
            return Q(Stream);
        },


        showDetail: function (e) {
            e.preventDefault();
            var provider = App.Providers.get(this.model.get('provider'));
            var data;
            var type = this.model.get('type');
            this.dummyclosed = true;
            switch (type) {
            case 'bookmarkedmovie':
                var SelectedMovie = new Backbone.Model({
                    imdb_id: this.model.get('imdb_id'),
                    image: this.model.get('image'),
                    cover: this.model.get('cover'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    actors: this.model.get('actors'),
                    directors: this.model.get('directors'),
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
                    
                this.showInk(e, type, function(){
                    App.vent.trigger('movie:showDetail', SelectedMovie);
                });
                
                break;

            case 'bookmarkedshow':
                type = 'show';
                /* falls through */
            case 'show':
            case 'movie':
                var Type = type.charAt(0).toUpperCase() + type.slice(1);
                this.model.set('health', false);
                    
                //this.showInk(function(){
                //    App.vent.trigger('dummy:showDetail', new Backbone.Model(this.model.attributes));
                //});

                var that = this;
                data = provider.detail(this.model.get('imdb_id'), this.model.attributes)
                    .catch(function () {
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
//                            if (!that.dummyclosed) {
//                                console.log('Dummyclosed before model shown aborting')
//                                that.dummyclosed = true;
//                                return;
//                            }
                            var model = new App.Model[Type](data);
                            that.showInk(e, type, model, function(){
                                App.vent.trigger(type + ':showDetail', model);
                            });
                            
                        });

                    });
                break;

            }
        },
        
        showInk: function(e, type, model, cb) {
            var w = $('#main-window'),
                $target = $(e.target).closest('img'),
                cover = model.get('cover') || model.get('images').poster,
                ink, poster, d,x,y,px,py,pw,ph,scale,
                origparams = {
                    width: $target.width(),
                    height: $target.height(),
                    top: $target.offset().top,
                    left: $target.parent().offset().left
                };
            
            $target.closest('.info').addClass('hide');
            
            if ($('#ink-poster').length) {
                $('#ink-poster').remove();
            }
            poster = $('<img id="ink-poster" src="'+cover+'" />');
            poster.css(origparams);
            w.append(poster);
            
            if ($('#ink').length) {
                ink = $('#ink');
            } else {
                ink = $('<div id="ink"></div>');
                w.append(ink);
            }

            ink.on('webkitTransitionEnd', function(e){
                if (ink.css('opacity') === '0') {
                    ink.css('z-index', 0);
                    ink.off('webkitTransitionEnd');
                } else {
                    cb();
                    ink.addClass('fade');
                }
            });

            App.vent.once('ink:close', function(d) {
                ink.css('z-index', 5);
                ink.removeClass('fade');
                App.vent.trigger(d.nextEvent);
                poster.css('transition-duration', '0.7s');
                poster.one('webkitTransitionEnd', function(){
                    poster.remove();
                });
                poster.css('transform', 'none');
                ink.removeClass('animate');
            });
            
            d = Math.max(w.outerWidth(), w.outerHeight());
            ink.css({height: d, width: d});
            x = e.pageX -  ink.width()/2;
            y = e.pageY -  ink.height()/2;
            px = 110 - origparams.left;
            
            switch (type) {
                case 'movie':
                    pw = (w.height() - 160 - 50) * 2 / 3;
                    py = 160 - origparams.top;
                    break;
                default:
                    //show, anime?
                    pw = (w.height() - 240 - 50) * 2 / 3;
                    py = 240 - origparams.top;
                    break;
            }
            
            scale = pw/origparams.width;
            ink.css({top: y+'px', left: x+'px'}).addClass("animate");
            poster.css('transform', 'translate('+px+'px, '+py+'px) scale('+scale+')').addClass('animate');
        },

        getColor: function (fast) {

            var defer = Q.defer();
            var that = this;
            var img = document.createElement('img');
            img.setAttribute('src', this.model.get('image'));
            img.addEventListener('load', function () {

                if (!fast) {
                    var vibrant = new Vibrant(img, 64, 4);
                } else {
                    var vibrant = new Vibrant(img, 64, 6);
                }

                var swatches = vibrant.swatches();
                var color = null;
                var textColor = null;
                var fabColor = null;

                var rgba = function (array, opacity) {
                    if (!opacity || isNaN(opacity)) {
                        opacity = 1;
                    }
                    return 'rgba(' + array.join() + ',' + opacity + ')';
                };

                if (swatches['Vibrant']) {
                    if (swatches['Vibrant'].getPopulation() < 20) {
                        if (swatches['Muted']) {
                            color = rgba(swatches['Muted'].getRgb(), 0.96);
                            textColor = swatches['Muted'].getTitleTextColor();
                        }
                        if (swatches['DarkVibrant']) {
                            fabColor = swatches['DarkVibrant'].getHex();
                        }
                    } else {
                        color = rgba(swatches['Vibrant'].getRgb(), 0.96);
                        textColor = swatches['Vibrant'].getTitleTextColor();
                        if (swatches['DarkMuted']) {
                            fabColor = swatches['DarkMuted'].getHex();
                        }
                    }
                } else if (swatches['Muted']) {
                    color = rgba(swatches['Muted'].getRgb(), 0.96);
                    textColor = swatches['Muted'].getTitleTextColor();
                    if (swatches['DarkVibrant']) {
                        fabColor = swatches['DarkVibrant'].getHex();
                    }
                } else {
                    defer.resolve(null);
                }

                if (textColor === '#000' || textColor === '#000000') {
                    textColor = 'rgba(20,21,23,.9)';
                }

                if (color && textColor) {
                    defer.resolve({
                        color: color,
                        textcolor: textColor,
                        fab: fabColor
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
                defer.resolve({});
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
                                    actors: {},
                                    directors: {},
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
                            actors: this.model.get('actors'),
                            directors: this.model.get('directors'),
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
