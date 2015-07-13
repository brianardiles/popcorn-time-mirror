(function (App) {
    'use strict';

    var torrentHealth = require('torrent-health');

    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        tagName: 'section',
        className: 'show-detail',

        ui: {
            qualitytoggles: '#quality-toggle',
            poster: '.poster',
            background: '.bg-backdrop',
            startStreamingUI: '.watchnow-btn span',
            bookmarkedIcon: '.bookmark-toggle',
            seasonsTabs: 'paper-tabs',
            SubtitlesDropdown: '.subtitles-dropdown',
            episodeContainer: '.episode-container'
        },


        events: {
            'click .back': 'closeDetails',
            'click .watched-toggle': 'markShowAsWatched',
            'click .bookmark-toggle': 'toggleBookmarked',
            'change #quality-toggle': 'qualityChanged',
            'change #subtitles-selector': 'toggleShowQuality',
            'change #device-selector': 'deviceChanged',
            'click .seasons-container paper-tab': 'selectSeason',
            'click .episode-container ul li': 'selectEpisode',
            'click .watched-icon': 'toggleWatched',
            'click #imdb-link': 'openIMDb',
            'click .person': 'openPerson',
            'click .epsiode-tab': 'setStream',
            'click .watchnow-btn': 'startStreaming'
        },


        keyboardEvents: {

        },

        initialize: function () {
            this.renameUntitled();
            var images = this.model.get('images');
            images.fanart = App.Trakt.resizeImage(images.fanart);
            images.poster = App.Trakt.resizeImage(images.poster);
            this.getEpisodeSubs = _.throttle(this.getEpisodeSubs, 500);

        },

        onShow: function () {
            App.vent.on('watched', _.bind(this.onWatched, this));
            if (this.model.get('bookmarked')) {
                this.ui.bookmarkedIcon.removeClass('zmdi-bookmark-outline').addClass('zmdi-bookmark');
            }
            console.log(this.model)
            this.loadbackground();
            this.playerQualityChooseUI();
            this.isShowWatched();

        },
        startStreaming: function (e) {
            var that = this;
            var title = that.model.get('title');
            var episode = this.Stream.episode;
            var episode_id = this.Stream.tvdb_id;
            var season = this.Stream.season;
            var name = this.Stream.title;

            var episodes = [];
            var episodes_data = [];
            var selected_quality = this.Stream.quality;

            if (AdvSettings.get('playNextEpisodeAuto') && this.model.get('imdb_id').indexOf('mal') === -1) {
                _.each(this.model.get('episodes'), function (value) {
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
                torrent: this.Stream.torrent,
                type: 'show',
                metadata: {
                    title: title + ' - ' + i18n.__('Season') + ' ' + season + ', ' + i18n.__('Episode') + ' ' + episode + ' - ' + name,
                    showName: title,
                    season: season,
                    episode: episode,
                    cover: this.model.get('images').poster,
                    tvdb_id: this.model.get('tvdb_id'),
                    episode_id: episode_id,
                    imdb_id: this.model.get('imdb_id'),
                    backdrop: this.model.get('images').fanart,
                    quality: selected_quality
                },
                autoPlayData: {
                    episodes: episodes,
                    streamer: 'main',
                    episodes_data: episodes_data
                },
                defaultSubtitle: Settings.subtitle_language,
                status: that.model.get('status'),
                device: App.Device.Collection.selected
            };

            App.Streamer.start(torrentStart);
        },
        loadbackground: function () {
            var that = this;
            var background = this.ui.background.data('bgr');
            var bgCache = new Image();
            bgCache.src = background;
            bgCache.onload = function () {
                try {
                    that.ui.background.css('background-image', 'url(' + background + ')').addClass('fadein');
                } catch (e) {
                    console.log(e);
                }
                bgCache = null;
            };
            bgCache.onerror = function () {
                try {
                    that.ui.background.css('background-image', 'url("images/bg-header.jpg")').addClass('fadein');
                } catch (e) {
                    console.log(e);
                }
                bgCache = null;
            };
        },
        selectNextEpisode: function (episodes, unWatchedEpisodes, watchedEpisodes) {
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
            var season;
            if (select.season) {
                season = select.season + 1;
                this.selectSeason(null, season);
                var episodeUIid = 'S' + this.formatTwoDigit(select.season) + 'E' + this.formatTwoDigit(select.episode);
                console.log(episodeUIid);
                this.selectEpisode(null, episodeUIid);
                this.ui.episodeContainer.scrollTop($('#episodeTab-' + episodeUIid).offset().top);
            } else {
                this.loadCover();
                if ($('paper-tabs paper-tab:nth-child(2)').data('type') !== 'special') {
                    season = parseInt($('paper-tabs paper-tab:nth-child(2)').data('id'));
                } else {
                    season = parseInt($('paper-tabs paper-tab:nth-child(3)').data('id'));
                }
                $('#season-' + season + ' li:first').click();
            }
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
            var watchedEpisodes = [];
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
                            watchedEpisodes.push({
                                id: parseInt(episode.season) * 100 + parseInt(episode.episode),
                                season: episode.season,
                                episode: episode.episode
                            });
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
                            that.selectNextEpisode(checkedEpisodes, unWatchedEpisodes, watchedEpisodes);
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
        loadCover: function (url) {
            var that = this;
            this.ui.poster.removeClass('fadein');
            if (!url) {
                url = this.ui.poster.data('bgr');
            }
            var cbackground = url;
            var coverCache = new Image();
            coverCache.src = cbackground;
            coverCache.onload = function () {
                try {
                    that.ui.poster.attr('src', url);
                    that.ui.poster.addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };
            coverCache.onerror = function () {
                try {
                    that.ui.poster.attr('src', 'url("images/posterholder.png")').addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };
        },
        subtitlesChanged: function (e) {
            console.log('Subtitles Changed', e.originalEvent.detail);
        },
        toggleShowQuality: function (e) {
            var quality = $(e.currentTarget).val();
            var episodeData = _.findWhere(this.model.get('episodes'), {
                season: this.Stream.season,
                episode: this.Stream.episode
            });
            this.Stream.torrent = episodeData.torrents[quality + 'p'].url;
            this.Stream.quality = quality + 'p';

            AdvSettings.set('shows_default_quality', quality + 'p');
        },
        setQualityUI: function (torrents, quality) {
            this.ui.qualitytoggles.children().removeClass('selected');
            this.ui.qualitytoggles.children().removeAttr('selected');


            if (!torrents['1080p']) {
                this.ui.qualitytoggles.children('[value="1080"]').hide();
            } else {
                this.ui.qualitytoggles.children('[value="1080"]').show();
            }
            if (!torrents['720p']) {
                this.ui.qualitytoggles.children('[value="720"]').hide();
            } else {
                this.ui.qualitytoggles.children('[value="720"]').show();
            }
            if (!torrents['480p']) {
                this.ui.qualitytoggles.children('[value="480"]').hide();
            } else {
                this.ui.qualitytoggles.children('[value="480"]').show();
            }

            this.ui.qualitytoggles.children('[value="' + quality + '"]').addClass('selected');
        },
        setStream: function (e) {

            var season = $(e.currentTarget).data('season');
            var episode = $(e.currentTarget).data('episode');

            var episodeData = _.findWhere(this.model.get('episodes'), {
                season: season,
                episode: episode
            });

            var torrents = episodeData.torrents,
                quality;

            switch (Settings.shows_default_quality) {
            case '1080p':
                if (torrents['1080p']) {
                    quality = '1080';
                } else if (torrents['720p']) {
                    quality = '720';
                } else if (torrents['480p']) {
                    quality = '480';
                }
                break;
            case '720p':
                if (torrents['720p']) {
                    quality = '720';
                } else if (torrents['480p']) {
                    quality = '480';
                } else if (torrents['1080p']) {
                    quality = '1080';
                }
                break;
            case '480p':
                if (torrents['480p']) {
                    quality = '480';
                } else if (torrents['720p']) {
                    quality = '720';
                } else if (torrents['1080p']) {
                    quality = '1080';
                }
                break;
            }

            var torrent = torrents[quality + 'p'].url;

            this.setQualityUI(torrents, quality);

            this.Stream = {
                torrent: torrent,
                quality: quality + 'p',
                title: episodeData.title,
                tvdb_id: episodeData.tvdb_id,
                season: season,
                episode: episode
            };
            var episodeUIid = 'S' + this.formatTwoDigit(season) + 'E' + this.formatTwoDigit(episode);
            this.ui.startStreamingUI.text(episodeUIid);

            this.ui.SubtitlesDropdown.html('<pt-dropdown id="subtitles-selector" openDir="up" icon="av:subtitles"><pt-selectable-element value="" selected label="' + i18n.__("Loading") + '..."></pt-selectable-element></pt-dropdown>')
            this.getEpisodeSubs(season, episode);


        },
        getEpisodeSubs: function (season, episode) {

            var that = this;
            var oldStream = this.Stream;

            this.fetchTVSubtitles({
                imdbid: this.model.get('imdb_id'),
                season: season,
                episode: episode
            }).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    if (_.isEqual(oldStream, that.Stream)) {
                        var index = 0;
                        var maxlength = 0;
                        var dropdowncon = '';
                        _.each(subs, function (sub, id) {
                            var subi = {
                                value: id,
                                label: (App.Localization.langcodes[id] !== undefined ? App.Localization.langcodes[id].nativeName : id)
                            };
                            if (subi.label.length > maxlength) {
                                maxlength = subi.label.length;
                            }
                            var selected = (Settings.subtitle_language === id ? 'selected="true"' : '');
                            dropdowncon = dropdowncon + '<pt-selectable-element index="' + index + '" ' + selected + ' data-url="' + sub + '" value="' + subi.value + '" label="' + subi.label + '"></pt-selectable-element>';
                            index++;
                        });
                        var toAdd = 0;
                        if ((maxlength - parseInt(i18n.__('Disabled').length)) > 0) {
                            toAdd = maxlength - parseInt(i18n.__('Disabled').length);
                        }
                        that.ui.SubtitlesDropdown.html('<pt-dropdown id="subtitles-selector" openDir="up" icon="av:subtitles"><pt-selectable-element value="none" label="' + i18n.__("Disabled") + '&nbsp;'.repeat(toAdd) + '"></pt-selectable-element>' + dropdowncon + '</pt-dropdown>');
                    }
                } else {
                    that.ui.SubtitlesDropdown.html('<pt-dropdown id="subtitles-selector" openDir="up" icon="av:subtitles"><pt-selectable-element value="" selected label="' + i18n.__("Subtitles Not Available") + '"></pt-selectable-element></pt-dropdown>');
                }
            });
        },
        fetchTVSubtitles: function (data) {
            var that = this;
            var defer = Q.defer();

            win.debug('Subtitles data request:', data);

            var subtitleProvider = App.Config.getProvider('tvshowsubtitle');

            subtitleProvider.fetch(data).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    var subtitles = subs;
                    defer.resolve(subs);
                    win.info(Object.keys(subs).length + ' subtitles found');
                } else {
                    win.warn('No subtitles returned');
                    defer.resolve({});
                }
            }).catch(function (err) {
                defer.resolve({});
                console.log('subtitleProvider.fetch()', err);
            });
            return defer.promise;
        },
        deviceChanged: function (e) {
            console.log('Device Changed', e.originalEvent.detail);
            var player = e.originalEvent.detail.value;
            this.model.set('device', player);
            App.Device.Collection.setDevice(player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        },
        selectEpisode: function (e, episodeUIid) {
            $('.episode-container ul li').removeClass('active');
            if (!episodeUIid) {
                $(e.currentTarget).addClass('active');
            } else {
                $('#episodeTab-' + episodeUIid).click();
            }
        },
        selectSeason: function (e, season) {
            if (!season) {
                var seasonId = $(e.currentTarget).data('id');
                var posterURL = $(e.currentTarget).data('poster');
                $('#season-' + seasonId + ' li:first').click();
                this.ui.episodeContainer.animate({
                    scrollTop: 0
                }, 'fast');
            } else {
                var seasonID = parseInt(season);
                var seasontabID = $('#seasonTab-' + seasonID).data('index');
                this.ui.seasonsTabs.prop('selected', seasontabID);
                var seasonId = $('#seasonTab-' + seasonID).data('id');
                var posterURL = $('#seasonTab-' + seasonId).data('poster');
            }
            var that = this;
            this.selectedSeason = seasonId;

            this.loadCover(posterURL);

            $('.episode-list-show').removeClass('episode-list-show');
            $('#season-' + seasonId).addClass('episode-list-show');
        },
        openPerson: function (e) {
            var personid = $(e.currentTarget).parent().data('id');
            console.log(personid);
            gui.Shell.openExternal('http://trakt.tv/people/' + personid);
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


        openIMDb: function () {
            gui.Shell.openExternal('http://www.imdb.com/title/' + this.model.get('imdb_id'));
        },
        closeDetails: function (e) {
            App.vent.trigger('show:closeDetail');
        }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
