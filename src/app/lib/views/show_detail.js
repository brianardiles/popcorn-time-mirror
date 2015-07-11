(function (App) {
    'use strict';

    var torrentHealth = require('torrent-health');

    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        tagName: 'section',
        className: 'show-detail',

        ui: {
            startStreaming: '.watchnow-btn',
            bookmarkedIcon: '.bookmark-toggle'
        },


        events: {
            'click .back': 'closeDetails',
            'click .watched-toggle': 'markShowAsWatched',
            'click .bookmark-toggle': 'toggleBookmarked',
            'click .seasons-container li': 'selectSeason',
            'click .episode-container ul li': 'selectEpisode',
            'click .watched-icon': 'toggleWatched'
        },


        keyboardEvents: {

        },

        initialize: function () {
            this.renameUntitled();
            App.vent.on('watched', _.bind(this.onWatched, this));

            var images = this.model.get('images');
            images.fanart = App.Trakt.resizeImage(images.fanart);
            images.poster = App.Trakt.resizeImage(images.poster, 'thumb');
        },

        onShow: function () {

            if (this.model.get('bookmarked')) {
                this.ui.bookmarkedIcon.removeClass('zmdi-bookmark-outline').addClass('zmdi-bookmark');
            }

            this.playerQualityChooseUI();
            this.seasonsUI();
            this.getSeasonImages();
            this.isShowWatched();

        },

        selectNextEpisode: function (episodes, unWatchedEpisodes) {
            episodes = _.sortBy(episodes, 'id');
            unWatchedEpisodes = _.sortBy(unWatchedEpisodes, 'id');
            var select;

            switch (Settings.tv_detail_jump_to) {
            case 'next':
                if (unWatchedEpisodes.length > 0) {
                    select = _.last(unWatchedEpisodes);
                } else {
                    select = _.last(episodes);
                }
                break;
            case 'firstUnwatched':
                if (unWatchedEpisodes.length > 0) {
                    select = _.first(unWatchedEpisodes);
                } else {
                    select = _.last(episodes);
                }
                break;
            case 'first':
                select = _.first(episodes);
                break;
            case 'last':
                select = _.last(episodes);
                break;
            }


            if (Settings.tv_detail_jump_to === 'next' && unWatchedEpisodes.length > 0) {
                select = _.first(unWatchedEpisodes);
            } else {
                select = _.last(episodes);
            }
            this.selectSeason(null, select.season);
            var episodeUIid = 'S' + this.formatTwoDigit(select.season) + 'E' + this.formatTwoDigit(select.episode);
            this.selectEpisode(null, episodeUIid);
        },

        toggleWatched: function (e) {
            var season = $(e.currentTarget).parent().data('season');
            var episode = $(e.currentTarget).parent().data('episode');

            var episode_id = $(e.currentTarget).parent().data('tvdb');

            var value = {
                tvdb_id: this.model.get('tvdb_id'),
                imdb_id: this.model.get('imdb_id'),
                episode_id: $('#watch-now').attr('data-episodeid'),
                season: season,
                episode: episode
            };
            App.Database.watched('check', 'show', value)
                .then(function (watched) {
                    if (watched) {
                        App.vent.trigger('watched', 'remove', 'show', value);
                    } else {
                        App.vent.trigger('watched', 'add', 'show', value);
                    }
                });

        },
        onWatched: function (method, type, data, ignore) {
            if (ignore) {
                return;
            }
            if (type !== 'show') {
                return;
            }
            if (method === 'add') {
                this.markWatched(data, true);
            } else if (method === 'remove') {
                this.markWatched(data, false);
            }

        },
        renameUntitled: function () {
            var episodes = this.model.get('episodes');
            for (var i = 0; i < episodes.length; i++) {
                if (!episodes[i].title) {
                    episodes[i].title = 'Untitled';
                }
                if (!episodes[i].overview) {
                    episodes[i].overview = 'No overview available.';
                }
                if (!episodes[i].first_aired) {
                    episodes[i].first_aired = 'Unknown';
                }
            }
        },
        toggleBookmarked: function () {
            if (!this.model.get('bookmarked')) {
                this.model.set('bookmarked', true);
                this.ui.bookmarkedIcon.removeClass('zmdi-bookmark-outline').addClass('zmdi-bookmark');
            } else {
                this.model.set('bookmarked', false);
                this.ui.bookmarkedIcon.removeClass('zmdi-bookmark').addClass('zmdi-bookmark-outline');
            }
            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-favorites').click();
        },
        markShowAsWatched: function () {
            var tvdb_id = this.model.get('tvdb_id');
            var imdb_id = this.model.get('imdb_id');

            var episodes = this.model.get('episodes');

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
                            App.vent.trigger('watched', 'add', 'show', value);
                        }
                    });
            });
        },
        isShowWatched: function () {
            var unWatchedEpisodes = [];
            var tvdb_id = this.model.get('tvdb_id');
            var imdb_id = this.model.get('imdb_id');
            var that = this;
            var episodes = this.model.get('episodes');
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
                            $('.show-watched-toggle').show();
                            unWatchedEpisodes.push({
                                id: parseInt(episode.season) * 100 + parseInt(episode.episode),
                                season: episode.season,
                                episode: episode.episode
                            });
                            return true;
                        } else {
                            that.markWatched(value, true);
                            return true;
                        }
                    }).then(function () {
                        checkedEpisodes.push({
                            id: parseInt(episode.season) * 100 + parseInt(episode.episode),
                            season: episode.season,
                            episode: episode.episode
                        });
                        if (checkedEpisodes.length === episodes.length) {
                            that.selectNextEpisode(checkedEpisodes, unWatchedEpisodes);
                        }

                    });

            });

        },
        formatTwoDigit: function (n) {
            return n > 9 ? '' + n : '0' + n;
        },
        markWatched: function (value, state) {
            state = (state === undefined) ? true : state;
            // we should never get any shows that aren't us, but you know, just in case.
            if (value.tvdb_id === this.model.get('tvdb_id')) {
                var episodeUIid = 'S' + this.formatTwoDigit(value.season) + 'E' + this.formatTwoDigit(value.episode);
                $('#episodeTab-' + episodeUIid).toggleClass('watched', state);
            } else {
                win.error('something fishy happened with the watched signal', this.model, value);
            }
        },

        selectEpisode: function (e, episodeUIid) {
            $('.episode-container ul li').removeClass('active');
            if (!episodeUIid) {
                $(e.currentTarget).addClass('active');
            } else {
                $('#episodeTab-' + episodeUIid).addClass('active');
            }
        },
        selectSeason: function (e, season) {
            $('.seasons-container li').removeClass('active');
            if (!season) {
                $(e.currentTarget).addClass('active');
                var seasonId = $(e.currentTarget).data('id');
                var posterURL = $(e.currentTarget).data('poster');
            } else {
                $('#seasonTab-' + season + 1).click();
                var seasonId = $('#seasonTab-' + season + 1).data('id');
                var posterURL = $('#seasonTab-' + season + 1).data('poster');
            }
            $('.poster').attr('src', posterURL);
            $('.episode-list-show').removeClass('episode-list-show');
            $('#season-' + seasonId).addClass('episode-list-show').find('li.active').click();
        },

        playerQualityChooseUI: function () {
            //change option of player, with dropdown
            $('#player-option p').on('click', function (e) {
                $('#player-option ul').addClass('visable');
            });

            $('#player-option ul li').on('click', function (e) {
                $('#player-option ul').removeClass('visable');
                $('#player-option #current-player-name').text($(this).children('p').text());
                $('#player-option #current-player-icon').removeClass().addClass($(this).children('i').attr('class'));
            });
            $('.quality-toggle p').on('click', function (e) {
                e.preventDefault();
                $('.quality-toggle p').removeClass('active');
                $(this).addClass('active');
            });
        },

        getSeasonImages: function () {

            App.Trakt.seasons.summary(this.model.get('imdb_id'))
                .then(function (seasonsinfo) {
                    if (!seasonsinfo) {
                        win.warn('Unable to fetch data from Trakt.tv');
                    } else {
                        seasonsinfo.forEach(function (entry) {
                            console.log(entry);
                            $('#seasonTab-' + entry.number + 1).attr('data-poster', entry.images.poster.full);
                        });
                    }
                }).catch(function (err) {
                    console.log(err);
                });
        },
        seasonsUI: function () {


            //owl.owlCarousel
            var owl = $(".seasons-container");
            owl.owlCarousel({
                pagination: false, //boolean   Show pagination.
                responsive: false,
                autoWidth: true
            });

            function recalcCarouselWidth(carousel) {
                var stage = carousel.find('.owl-stage');
                stage.width(Math.ceil(stage.width()) + 1);
            }

            $(window).on('resize', function (e) {
                recalcCarouselWidth($('.owl-carousel'));
            }).resize();

            $('.seasons-container').on('refreshed.owl.carousel', function (event) {
                recalcCarouselWidth($('.owl-carousel'));
            });


            // Custom Navigation Events
            $(".season-next").click(function (e) {
                e.preventDefault();
                owl.trigger('next.owl.carousel');
            });
            $(".season-prev").click(function (e) {
                e.preventDefault();
                owl.trigger('prev.owl.carousel');
            });
            // possibility of scroll with the scroll wheel
            owl.on('mousewheel', '.owl-stage', function (e) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    owl.trigger('next.owl');
                } else {
                    owl.trigger('prev.owl');
                }
            });

            var seasons_container_width = $('.seasons-wrapper').width();
            var seasons_items_width = $('.seasons-wrapper ul li').width() * $('.seasons-wrapper ul li').length;
            console.log(seasons_container_width, seasons_items_width);
            if (seasons_container_width > seasons_items_width) {
                $(".season-prev").hide();
                $(".season-next").hide();
            } else {
                $(".season-prev").show();
                $(".season-next").show();
            }
            $(window).resize(function () {
                var seasons_container_width = $('.seasons-wrapper').width();
                var seasons_items_width = $('.seasons-wrapper ul li').width() * $('.seasons-wrapper ul li').length;
                if (seasons_container_width > seasons_items_width) {
                    $(".season-prev").hide();
                    $(".season-next").hide();
                } else {
                    $(".season-prev").show();
                    $(".season-next").show();
                }
            });
        },

        closeDetails: function (e) {
            App.vent.trigger('show:closeDetail');
        }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
