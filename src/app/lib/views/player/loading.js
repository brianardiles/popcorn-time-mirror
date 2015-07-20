(function (App) {
    'use strict';
    var Q = require('q');
    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'loading-view',
        tagName: 'section',

        ui: {
            title: '.title',
            episodeInfo: '.episode-info',
            status: '.status',
            stats: '.stats',
            backdrop: '.bg-backdrop',
            progressStyle: '#loadingStyle',
            progressbar: '.progressbar'
        },

        events: {
            'click .back': 'cancelStreaming',
        },

        keyboardEvents: {

        },

        initialize: function () {
            this.loadingStopped = false;
            this.SubtitlesRetrieved = false;
            this.WaitingForSubs = false;
            this.setupSubs();
            if (this.model.get('player').get('id')) {
                this.player = this.model.get('player').get('id');
            } else {
                this.player = 'local';
            }
            if (this.model.attributes.data.type !== ('show' || 'movie')) {
                this.waitForSelection();
            }
        },

        onShow: function () {
            if (this.model.attributes.data.type === 'show') {
                this.getEpisodeDetails();
            } else {
                this.stateUpdate();
            }
        },


        setupSubs: function () {

            var defaultSubtitle = this.model.get('defaultSubtitle');
            var subtitles = this.model.get('subtitles');

            var subrequest = {
                type: this.model.attributes.data.type,
                defaultSubtitle: this.model.attributes.data.defaultSubtitle,
                subtitles: this.model.attributes.data.subtitles,
                imdbid: this.model.attributes.data.metadata.imdb_id,
                season: this.model.attributes.data.metadata.season,
                episode: this.model.attributes.data.metadata.episode
            };

            if (!App.Streamer.streamDir) {
                var watchstreamDir = function () {
                    require('watchjs').unwatch(App.Streamer, 'streamDir', watchstreamDir);
                    App.Subtitlesv2.get(subrequest);
                };
                require('watchjs').watch(App.Streamer, 'streamDir', watchstreamDir);
            } else {
                App.Subtitlesv2.get(subrequest);
            }
        },

        stateUpdate: function () {
            if (this.loadingStopped) {
                return;
            }
            var Stream = App.Streamer.client.swarm;
            if (App.Streamer.fileindex !== null) {
                this.ui.status.text(i18n.__('Connecting'));
                if (Stream.downloadSpeed()) {
                    if (!this.initializedLoadingPlayer) {
                        this.initializedLoadingPlayer = true;
                        this.initializeLoadingPlayer();
                        this.backupCountdown();
                    }
                    if (this.BufferingStarted) {
                        this.ui.status.text(i18n.__('Buffering'));
                    } else if (this.WaitingForSubs) {
                        this.ui.status.text(i18n.__('Waiting For Subtitles'));
                    } else {
                        this.ui.status.text(i18n.__('Downloading'));
                    }
                    this.updateStatsUI(Common.fileSize(Stream.downloadSpeed()) + '/s', Common.fileSize(Stream.uploadSpeed()) + '/s', Stream.wires.length)
                }
                if (!this.loadingStopped) {
                    _.delay(_.bind(this.stateUpdate, this), 1000);
                }
            } else {
                _.delay(_.bind(this.stateUpdate, this), 1000);
            }
        },

        backupCountdown: function () {
            var that = this;
            var count = 30;
            win.debug('Backup ' + this.count + ' Second timeout started for:', this.model.get('data').metadata.title);
            var backupCountdown = setInterval(function () {
                if (that.loadingStopped) {
                    clearInterval(backupCountdown);
                    return;
                }
                if (count === 0) {
                    win.debug('Smart Loading timeout reached for :', that.model.get('data').metadata.title, 'Starting Playback Arbitrarily');
                    var loadingPlayer = document.getElementById('loading_player');
                    loadingPlayer.pause();
                    loadingPlayer.src = ''; // empty source
                    loadingPlayer.load();
                    that.backupCountdownDone = true;
                    that.initMainplayer();
                    clearInterval(backupCountdown);
                }
                count--;
            }, 1000);
        },

        initializeLoadingPlayer: function () {
            var that = this;
            var loadingPlayer = document.getElementById('loading_player');
            loadingPlayer.setAttribute('src', App.Streamer.src);
            win.debug('Requesting Initial Meta Chunks For', this.model.get('data').metadata.title, '(Smart Loader)');
            loadingPlayer.muted = true;
            loadingPlayer.load();
            loadingPlayer.play();
            var debugmetachunks = false;
            loadingPlayer.ontimeupdate = function () {
                if (that.loadingStopped || that.backupCountdownDone) {
                    loadingPlayer.pause();
                    loadingPlayer.src = ''; // empty source
                    loadingPlayer.load();
                    return;
                }
                if (loadingPlayer.currentTime > 0 && !debugmetachunks) {
                    win.info('Initial Meta Chunks Received! Starting Playback in 4 seconds.');
                    debugmetachunks = true;
                    that.BufferingStarted = true;
                    that.ui.progressbar.removeAttr('indeterminate');
                }
                var percent = loadingPlayer.currentTime / 4 * 100;
                that.ui.progressbar.prop('value', percent);

                if (loadingPlayer.currentTime > 4) {
                    loadingPlayer.pause();
                    loadingPlayer.src = ''; // empty source
                    loadingPlayer.load();
                    that.initMainplayer();
                }

            };
        },

        initMainplayer: function () {

            if (this.player === 'local') {
                var playerModel = new Backbone.Model(this.model.get('data'));
                App.vent.trigger('stream:local', playerModel);
            } else {
                var externalPlayerModel = this.model.get('player');
                externalPlayerModel.set('src', App.Streamer.src);
                externalPlayerModel.set('subtitle', this.extsubs); //set subs if we have them; if not? well that boat has sailed.
                App.vent.trigger('stream:ready', externalPlayerModel);
                this.playingExternally = true;
                this.stateUpdate();
            }
        },

        updateStatsUI: function (download, upload, peers) {
            this.ui.stats.text(i18n.__('Download') + ': ' + download + ' • ' + i18n.__('Upload') + ': ' + upload + ' • ' + i18n.__('Peers') + ': ' + peers);
        },

        cancelStreaming: function () {
            App.vent.trigger('streamer:stop');
            App.vent.trigger('player:close');
        },

        getEpisodeDetails: function () {
            var that = this;
            App.Trakt.episodes.summary(this.model.attributes.data.metadata.imdb_id, this.model.attributes.data.metadata.season, this.model.attributes.data.metadata.episode)
                .then(function (episodeSummary) {
                    that.loadbackground(episodeSummary.images.screenshot.full);
                });
        },

        loadbackground: function (url) {
            var that = this;
            var img = document.createElement('img');
            img.setAttribute('src', url);
            console.log(url);
            img.addEventListener('error', function () {
                that.stateUpdate();
                img.remove();
            })
            img.addEventListener('load', function () {
                if (this.width >= 1280 && this.height >= 720) {
                    that.ui.backdrop.removeClass('fadein');
                    _.delay(function () {
                        that.ui.backdrop.css('background-image', 'url(' + url + ')').addClass('fadein');
                        that.stateUpdate();
                    }, 300);
                } else {
                    that.stateUpdate();
                }
                img.remove();
            });
        },
        onDestroy: function () {
            this.loadingStopped = true;
        },
        waitForSelection: function () {
            var that = this;
            var watchFileSelected = function () {
                require('watchjs').unwatch(App.Streamer.updatedInfo, 'fileSelectorIndexName', watchFileSelected);
                that.model.attributes.data.metadata.title = that.removeExtension(App.Streamer.updatedInfo.fileSelectorIndexName);
                that.augmentDropModel(that.model.attributes.data); // olny call if droped torrent/magnet
            };
            require('watchjs').watch(App.Streamer.updatedInfo, 'fileSelectorIndexName', watchFileSelected);
        },
        augmentDropModel: function (data) {
            var metadata = data.metadata;
            var that = this;
            console.log(metadata);
            var title = $.trim(metadata.title.replace('[rartv]', '').replace('[PublicHD]', '').replace('[ettv]', '').replace('[eztv]', '')).replace(/[\s]/g, '.');

            var se_re = title.match(/(.*)S(\d\d)E(\d\d)/i); // regex try (ex: title.s01e01)
            if (se_re === null) { // if fails
                se_re = title.match(/(.*)(\d\d\d\d)+\W/i); // try another regex (ex: title.0101)
                if (se_re !== null) {
                    se_re[3] = se_re[2].substr(2, 4);
                    se_re[2] = se_re[2].substr(0, 2);
                } else {
                    se_re = title.match(/(.*)(\d\d\d)+\W/i); // try a last one (ex: title.101)
                    if (se_re !== null) {
                        se_re[3] = se_re[2].substr(1, 2);
                        se_re[2] = se_re[2].substr(0, 1);
                    }
                }
            }
            if (se_re != null) {
                // function in case it's a movie (or not, it also handles errors)
                var tryMovie = function (moviename) {
                    App.Trakt.search(moviename, 'movie')
                        .then(function (summary) {
                            if (!summary || summary.length === 0) {
                                win.warn('Unable to fetch data from Trakt.tv');
                            } else {
                                var data = summary[0].movie;
                                that.model.attributes.data.type = 'movie';
                                that.model.attributes.data.metadata.title = data.title;
                                that.model.attributes.data.metadata.cover = data.images.poster;
                                that.model.attributes.data.metadata.imdb_id = data.imdb_id;
                                that.model.attributes.data.metadata.backdrop = data.images.fanart.full;
                                that.ui.title.text(data.title);
                                that.loadbackground(data.images.fanart.full);
                            }

                        }).catch(function (err) {
                            // Ok then, it's not a tv show, it's not a movie. I give up, deal with it.
                        });
                };

                // we're going to start by assuming it's a TV Series
                var tvshowname = $.trim(se_re[1].replace(/[\.]/g, ' '))
                    .replace(/^\[.*\]/, '') // starts with brackets
                    .replace(/[^\w ]+/g, '') // remove brackets
                    .replace(/ +/g, '-') // has spaces
                    .replace(/_/g, '-') // has '_'
                    .replace(/\-$/, '') // ends with '-'
                    .replace(/^\./, '') // starts with '.'
                    .replace(/^\-/, ''); // starts with '-'
                App.Trakt.shows.summary(tvshowname)
                    .then(function (summary) {
                        if (!summary) {
                            win.warn('Unable to fetch data from Trakt.tv');
                        } else {
                            that.loadbackground(summary.images.fanart.full);
                            that.model.attributes.data.metadata.showName = summary.title;
                            App.Trakt.episodes.summary(tvshowname, se_re[2], se_re[3])
                                .then(function (episodeSummary) {
                                    if (!episodeSummary) {
                                        that.loadbackground(summary.images.fanart.full);
                                        win.warn('Unable to fetch data from Trakt.tv');
                                    } else {
                                        var data = episodeSummary;

                                        that.model.attributes.data.type = 'show';
                                        that.model.attributes.data.metadata.title = summary.title + ' - ' + i18n.__('Season') + ' ' + data.season + ', ' + i18n.__('Episode') + ' ' + data.number + ' - ' + data.title;
                                        that.model.attributes.data.metadata.season = data.season.toString();
                                        that.model.attributes.data.metadata.episode = data.number.toString();
                                        that.model.attributes.data.metadata.tvdb_id = summary.ids.tvdb;
                                        that.model.attributes.data.metadata.episode_id = data.ids.tvdb;
                                        that.model.attributes.data.metadata.imdb_id = summary.ids.imdb;
                                        that.model.attributes.data.metadata.backdrop = data.images.screenshot.full;

                                        that.ui.title.text(summary.title);
                                        var episode = 'S' + that.formatTwoDigit(data.season) + 'E' + that.formatTwoDigit(data.number) + ' ' + data.title;
                                        that.ui.episodeInfo.text(episode);

                                        that.loadbackground(data.images.screenshot.full);

                                        // that.getSubtitles();
                                    }
                                }).catch(function (err) {
                                    tryMovie(tvshowname);
                                });
                        }

                    }).catch(function (err) {
                        tryMovie(tvshowname);
                    });
            }
        },
        formatTwoDigit: function (n) {
            return n > 9 ? '' + n : '0' + n;
        },
        removeExtension: function (filename) {
            var lastDotPosition = filename.lastIndexOf('.');
            if (lastDotPosition === -1) {
                return filename;
            } else {
                return filename.substr(0, lastDotPosition);
            }
        }

    });

    App.View.Loading = Loading;
})(window.App);
