(function (App) {
    'use strict';

    var torrentHealth = require('torrent-health');
    var cancelTorrentHealth = function () {};
    var torrentHealthRestarted = null;

    var _this, bookmarked;
    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        ui: {
            startStreaming: '#watch-now',
            q1080p: '#q1080',
            q720p: '#q720',
            q480p: '#q480',
            qinfo: '.quality-info',
            bookmarkIcon: '.favourites-toggle'
        },


        events: {
            'click .favourites-toggle': 'toggleFavorite',
            'click .show-watched-toggle': 'markShowAsWatched',
            'click .watched': 'toggleWatched',
            'click #watch-now': 'startStreaming',
            'click .close-icon': 'closeDetails',
            'click .tab-season': 'clickSeason',
            'click .tab-episode': 'clickEpisode',
            'click .show-imdb-link': 'openIMDb',
            'mousedown .show-magnet-link': 'openMagnet',
            'dblclick .tab-episode': 'dblclickEpisode',
            'click .q1080': 'toggleShowQuality',
            'click .q720': 'toggleShowQuality',
            'click .q480': 'toggleShowQuality',
            'click .playerchoicemenu li a': 'selectPlayer',
            'click .rating-container-tv': 'switchRating',
            'click .health-icon': 'resetHealth'
        },


        keyboardEvents: {
            'esc': 'closeDetails',
            'backspace': 'closeDetails',
            'q': 'toggleQuality',
            'enter': 'playEpisode',
            'space': 'playEpisode',
            'ctrl+up': 'previousSeason',
            'command+up': 'previousSeason',
            'ctrl+down': 'nextSeason',
            'command+down': 'nextSeason',
            'up': 'previousEpisode',
            'down': 'nextEpisode',
            'w': 'toggleEpisodeWatched',
            'f': 'toggleFavorite'
        },

        initialize: function () {
            _this = this;
            this.renameUntitled();


            var images = this.model.get('images');
            images.fanart = App.Trakt.resizeImage(images.fanart);
            images.poster = App.Trakt.resizeImage(images.poster, 'thumb');


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

        onShow: function () {
            App.vent.on('watched', _.bind(this.onWatched, this));
            if (this.model.get('bookmarked')) {
                this.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
            } else {
                this.ui.bookmarkIcon.removeClass('selected');
            }

            $('.star-container-tv,.show-imdb-link,.show-magnet-link').tooltip();

            var cbackground = $('.tv-cover').attr('data-bgr');
            var coverCache = new Image();
            coverCache.src = cbackground;
            coverCache.onload = function () {
                try {
                    $('.tv-cover')
                        .css('background-image', 'url(' + cbackground + ')')
                        .addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };
            coverCache.onerror = function () {
                try {
                    $('.tv-cover')
                        .css('background-image', 'url("images/posterholder.png")')
                        .addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };

            var background = $('.tv-poster-background').attr('data-bgr');
            var bgCache = new Image();
            bgCache.src = background;
            bgCache.onload = function () {
                try {
                    $('.tv-poster-background')
                        .css('background-image', 'url(' + background + ')')
                        .addClass('fadein');
                } catch (e) {}
                bgCache = null;
            };
            bgCache.onerror = function () {
                try {
                    $('.tv-poster-background')
                        .css('background-image', 'url("images/bg-header.jpg")')
                        .addClass('fadein');
                } catch (e) {}
                bgCache = null;
            };

            if (!AdvSettings.get('ratingStars')) {
                $('.star-container-tv').addClass('hidden');
                $('.number-container-tv').removeClass('hidden');
            }

            this.isShowWatched();

            App.Device.Collection.setDevice(AdvSettings.get('chosenPlayer'));
            App.Device.ChooserView('#player-chooser').render();


        },
        toggleFavorite: function (e) {

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            var that = this;

            if (bookmarked !== true) {
                bookmarked = true;

                var provider = App.Providers.get(this.model.get('provider'));
                var data = provider.detail(this.model.get('imdb_id'), this.model.attributes)
                    .then(function (data) {
                            data.provider = that.model.get('provider');

                            App.Database.show('add', data)
                                .then(function (d) {
                                    return App.Database.bookmark('add', 'show', that.model.get('imdb_id'));
                                })
                                .then(function () {
                                    win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                                    that.model.set('bookmarked', true);
                                    that.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
                                });
                        },
                        function (err) {
                            $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                        });

            } else {
                that.ui.bookmarkIcon.removeClass('selected').text(i18n.__('Add to bookmarks'));
                bookmarked = false;
                App.Database.bookmark('remove', 'show', this.model.get('imdb_id'))
                    .then(function () {
                        win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                        App.Database.show('remove', that.model.get('imdb_id'));
                        if (App.currentview === 'Favorites') {
                            App.vent.trigger('favorites:render');
                        }
                    });
            }
        },
        selectNextEpisode: function (episodes, unWatchedEpisodes) {
            episodes = _.sortBy(episodes, 'id');
            unWatchedEpisodes = _.sortBy(unWatchedEpisodes, 'id');
            var select;
            if (Settings.tv_detail_jump_to !== 'next' && unWatchedEpisodes.length > 0) {
                select = _.first(unWatchedEpisodes);
            } else {
                select = _.last(episodes);
            }
            this.selectSeason($('li[data-tab="season-' + select.season + '"]'));
            var epselect = $('#watched-' + select.season + '-' + select.episode).parent();
            this.selectEpisode(epselect);
        },

        openIMDb: function () {
            gui.Shell.openExternal('http://www.imdb.com/title/' + this.model.get('imdb_id'));
        },

        openMagnet: function (e) {
            var torrentUrl = $('.startStreaming').attr('data-torrent');
            if (e.button === 2) { //if right click on magnet link
                var clipboard = gui.Clipboard.get();
                clipboard.set(torrentUrl, 'text'); //copy link to clipboard
                $('.notification_alert').text(i18n.__('The magnet link was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            } else {
                gui.Shell.openExternal(torrentUrl);
            }
        },

        switchRating: function () {
            if ($('.number-container-tv').hasClass('hidden')) {
                $('.number-container-tv').removeClass('hidden');
                $('.star-container-tv').addClass('hidden');
                AdvSettings.set('ratingStars', false);
            } else {
                $('.number-container-tv').addClass('hidden');
                $('.star-container-tv').removeClass('hidden');
                AdvSettings.set('ratingStars', true);
            }
        },

        toggleWatched: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            var edata = e.currentTarget.id.split('-');
            setTimeout(function () {
                var value = {
                    tvdb_id: _this.model.get('tvdb_id'),
                    imdb_id: _this.model.get('imdb_id'),
                    episode_id: $('#watch-now').attr('data-episodeid'),
                    season: edata[1],
                    episode: edata[2]
                };
                App.Database.watched('check', 'show', value)
                    .then(function (watched) {
                        if (watched) {
                            App.vent.trigger('watched', 'remove', 'show', value);
                        } else {
                            App.vent.trigger('watched', 'add', 'show', value);
                        }
                    });
            }, 100);
        },

        isShowWatched: function () {
            var unWatchedEpisodes = [];
            var tvdb_id = _this.model.get('tvdb_id');
            var imdb_id = _this.model.get('imdb_id');
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

        markShowAsWatched: function () {
            $('.show-watched-toggle').addClass('selected');

            var tvdb_id = _this.model.get('tvdb_id');
            var imdb_id = _this.model.get('imdb_id');

            var episodes = _this.model.get('episodes');

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
                            $('.show-watched-toggle').hide();
                        }
                    });
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

        markWatched: function (value, state) {

            state = (state === undefined) ? true : state;
            // we should never get any shows that aren't us, but you know, just in case.
            if (value.tvdb_id === _this.model.get('tvdb_id')) {
                $('#watched-' + value.season + '-' + value.episode).toggleClass('true', state);
            } else {
                win.error('something fishy happened with the watched signal', this.model, value);
            }
        },

        startStreaming: function (e) {

            if (e.type) {
                e.preventDefault();
            }
            var that = this;
            var title = that.model.get('title');
            var episode = this.selectedTorrent.episode;
            var episode_id = this.selectedTorrent.episodeid;
            var season = this.selectedTorrent.season;
            var name = this.selectedTorrent.title;

            var episodes = [];
            var episodes_data = [];
            var selected_quality = this.selectedTorrent.quality;

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
                torrent: this.selectedTorrent.def,
                type: 'show',
                metadata: {
                    title: title + ' - ' + i18n.__('Season') + ' ' + season + ', ' + i18n.__('Episode') + ' ' + episode + ' - ' + name,
                    showName: title,
                    season: season,
                    episode: episode,
                    cover: that.model.get('images').poster,
                    tvdb_id: that.model.get('tvdb_id'),
                    episode_id: episode_id,
                    imdb_id: that.model.get('imdb_id'),
                    backdrop: that.model.get('images').fanart,
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
        closeDetails: function (e) {
            App.vent.trigger('show:closeDetail');
        },

        clickSeason: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectSeason($(e.currentTarget));
        },

        clickEpisode: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectEpisode($(e.currentTarget));
        },

        dblclickEpisode: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectEpisode($(e.currentTarget));
            $('.startStreaming').trigger('click');
        },
        // Helper Function
        selectSeason: function ($elem) {
            $('.tab-season.active').removeClass('active');
            $elem.addClass('active');
            $('.tab-episodes').hide();
            $('.tab-episodes.current').removeClass('current');
            $('.tab-episode.active').removeClass('active');
            $('.tab-episodes.' + $elem.attr('data-tab')).addClass('current').scrollTop(0).show(); //pull the scroll always to top to
            this.selectEpisode($('.tab-episodes.' + $elem.attr('data-tab') + ' li:first'));
        },

        selectEpisode: function ($elem) {
            if ($elem.length === 0) {
                return;
            }
            var tvdbid = $elem.attr('data-id');
            var torrents = {};
            var quality;
            torrents.q480 = $('.template-' + tvdbid + ' .q480').text();

            torrents.q720 = $('.template-' + tvdbid + ' .q720').text();
            torrents.q1080 = $('.template-' + tvdbid + ' .q1080').text();
            this.ui.q1080p.removeClass('active');
            this.ui.q720p.removeClass('active');
            this.ui.q480p.removeClass('active');

            if (!torrents.q480) {
                this.ui.q480p.addClass('disabled');
            } else {
                this.ui.q480p.removeClass('disabled');
            }
            if (!torrents.q720) {
                this.ui.q720p.addClass('disabled');
            } else {
                this.ui.q720p.removeClass('disabled');
            }
            if (!torrents.q1080) {
                this.ui.q1080p.addClass('disabled');
            } else {
                this.ui.q1080p.removeClass('disabled');
            }

            switch (Settings.shows_default_quality) {
            case '1080p':
                if (torrents.q1080) {
                    quality = '1080p';
                } else if (torrents.q720) {
                    quality = '720p';
                } else if (torrents.q480) {
                    quality = '480p';
                }
                break;
            case '720p':
                if (torrents.q720) {
                    quality = '720p';
                } else if (torrents.q480) {
                    quality = '480p';
                } else if (torrents.q1080) {
                    quality = '1080p';
                }
                break;
            case '480p':
                if (torrents.q480) {
                    quality = '480p';
                } else if (torrents.q720) {
                    quality = '720p';
                } else if (torrents.q1080) {
                    quality = '1080p';
                }
                break;
            }


            // Select quality
            if (quality === '1080p') {
                torrents.def = torrents.q1080;
                torrents.quality = '1080p';
                this.ui.q1080p.addClass('active');
            } else if (quality === '720p') {
                torrents.def = torrents.q720;
                torrents.quality = '720p';
                this.ui.q720p.addClass('active');
            } else {
                torrents.def = torrents.q480;
                torrents.quality = '480p';
                this.ui.q480p.addClass('active');
            }


            $('.tab-episode.active').removeClass('active');
            $elem.addClass('active');
            $('.episode-info-number').text(i18n.__('Season %s', $('.template-' + tvdbid + ' .season').html()) + ', ' + i18n.__('Episode %s', $('.template-' + tvdbid + ' .episode').html()));
            $('.episode-info-title').text($('.template-' + tvdbid + ' .title').text());
            $('.episode-info-date').text(i18n.__('Aired Date') + ': ' + $('.template-' + tvdbid + ' .date').html());
            $('.episode-info-description').text($('.template-' + tvdbid + ' .overview').text());

            //pull the scroll always to top
            $('.episode-info-description').scrollTop(0);

            this.selectedTorrent = torrents;

            this.selectedTorrent.episodeid = tvdbid;
            this.selectedTorrent.season = $('.template-' + tvdbid + ' .season').html();
            this.selectedTorrent.episode = $('.template-' + tvdbid + ' .episode').html();
            this.selectedTorrent.title = $('.template-' + tvdbid + ' .title').html();

            this.ui.startStreaming.show();
            this.resetHealth();


        },
        toggleShowQuality: function (e) {
            if ($(e.currentTarget).hasClass('disabled')) {
                return;
            }
            var quality = $(e.currentTarget);

            this.ui.q1080p.removeClass('active');
            this.ui.q720p.removeClass('active');
            this.ui.q480p.removeClass('active');
            $(e.currentTarget).addClass('active');

            var tvdbid = $('.startStreaming').attr('data-episodeid'),
                torrent = $('.template-' + tvdbid + ' .' + quality.attr('id')).text();
            $('.startStreaming').attr('data-torrent', torrent);
            $('.startStreaming').attr('data-quality', quality.text());
            AdvSettings.set('shows_default_quality', quality.text());
            this.resetHealth();
        },

        nextEpisode: function (e) {
            var index = $('.tab-episode.active').index();
            if (index === $('.tab-episode:visible').length - 1) {
                return;
            }
            var $nextEpisode = $('.tab-episode:visible').eq(++index);
            _this.selectEpisode($nextEpisode);
            if (!_this.isElementVisible($nextEpisode[0])) {
                $nextEpisode[0].scrollIntoView(false);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }

        },

        previousEpisode: function (e) {
            var index = $('.tab-episode.active').index();
            if (index === 0) {
                return;
            }
            var $prevEpisode = $('.tab-episode:visible').eq(--index);
            _this.selectEpisode($prevEpisode);
            if (!_this.isElementVisible($prevEpisode[0])) {
                $prevEpisode[0].scrollIntoView(true);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }

        },

        nextSeason: function (e) {
            var index = $('.tab-season.active').index();
            if (index === $('.tab-season').length - 1) {
                return;
            }
            var $nextSeason = $('.tab-season').eq(++index);
            _this.selectSeason($nextSeason);
            if (!_this.isElementVisible($nextSeason[0])) {
                $nextSeason[0].scrollIntoView(false);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
        },

        previousSeason: function (e) {
            var index = $('.tab-season.active').index();
            if (index === 0) {
                return;
            }
            var $prevSeason = $('.tab-season').eq(--index);
            _this.selectSeason($prevSeason);
            if (!_this.isElementVisible($prevSeason[0])) {
                $prevSeason[0].scrollIntoView(true);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }

        },

        playEpisode: function (e) {
            $('.startStreaming').trigger('click');

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
        },

        toggleQuality: function (e) {

            if ($('.quality').is(':visible')) {
                if ($('#switch-hd-off').is(':checked')) {
                    $('#switch-hd-on').trigger('click');
                } else {
                    $('#switch-hd-off').trigger('click');
                }
                this.resetHealth();
            }

        },

        toggleEpisodeWatched: function (e) {
            var data = {};
            data.currentTarget = $('.tab-episode.active .watched')[0];
            _this.toggleWatched(data);
        },


        isElementVisible: function (el) {
            var eap,
                rect = el.getBoundingClientRect(),
                docEl = document.documentElement,
                vWidth = window.innerWidth || docEl.clientWidth,
                vHeight = window.innerHeight || docEl.clientHeight,
                efp = function (x, y) {
                    return document.elementFromPoint(x, y);
                },
                contains = 'contains' in el ? 'contains' : 'compareDocumentPosition',
                has = contains === 'contains' ? 1 : 0x14;

            // Return false if it's not in the viewport
            if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
                return false;
            }

            // Return true if any of its four corners are visible
            return (
                (eap = efp(rect.left, rect.top)) === el || el[contains](eap) === has || (eap = efp(rect.right, rect.top)) === el || el[contains](eap) === has || (eap = efp(rect.right, rect.bottom)) === el || el[contains](eap) === has || (eap = efp(rect.left, rect.bottom)) === el || el[contains](eap) === has
            );
        },

        getTorrentHealth: function (e) {
            var torrent = this.selectedTorrent.def;

            cancelTorrentHealth();

            // Use fancy coding to cancel
            // pending torrent-health's
            var cancelled = false;
            cancelTorrentHealth = function () {
                cancelled = true;
            };

            if (torrent.substring(0, 8) === 'magnet:?') {
                // if 'magnet:?' is because eztv sends back links, not magnets

                torrent = torrent.split('&tr')[0] + '&tr=udp://tracker.openbittorrent.com:80/announce' + '&tr=udp://open.demonii.com:1337/announce' + '&tr=udp://tracker.coppersurfer.tk:6969';

                torrentHealth(torrent, {timeout: 1000}).then(function (res) {

                    if (cancelled) {
                        return;
                    }
                    if (res.seeds === 0 && torrentHealthRestarted < 5) {
                        torrentHealthRestarted++;
                        $('.health-icon').click();
                    } else {
                        torrentHealthRestarted = 0;
                        var h = Common.calcHealth({
                            seed: res.seeds,
                            peer: res.peers
                        });
                        var health = Common.healthMap[h].capitalize();
                        var ratio = res.peers > 0 ? res.seeds / res.peers : +res.seeds;

                        $('.health-icon').tooltip({
                                html: true
                            })
                            .removeClass('Bad Medium Good Excellent')
                            .addClass(health)
                            .attr('data-original-title', i18n.__('Health ' + health) + ' - ' + i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + ' <br> ' + i18n.__('Seeds:') + ' ' + res.seeds + ' - ' + i18n.__('Peers:') + ' ' + res.peers)
                            .tooltip('fixTitle');
                    }
                });
            }
        },

        resetHealth: function () {
            $('.health-icon').tooltip({
                    html: true
                })
                .removeClass('Bad Medium Good Excellent')
                .attr('data-original-title', i18n.__('Health Unknown'))
                .tooltip('fixTitle');
            this.getTorrentHealth();
        },

        selectPlayer: function (e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            _this.model.set('device', player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
