(function (App) {
    'use strict';
    var Q = require('q');
    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'loading-view',
        tagName: 'section',

        ui: {
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
            this.getSubtitles();
            if (this.model.get('player').get('id')) {
                this.player = this.model.get('player').get('id');
            } else {
                this.player = 'local';
            }
        },

        onShow: function () {
            if (this.model.attributes.data.type === 'show') {
                this.getEpisodeDetails();
            } else {
                this.StateUpdate();
            }
        },

        getSubtitles: function () {
            switch (this.model.attributes.data.type) {
            case 'show':
                this.fetchTVSubtitles({
                    imdbid: this.model.attributes.data.metadata.imdb_id,
                    season: this.model.attributes.data.metadata.season,
                    episode: this.model.attributes.data.metadata.episode
                }).then(function (subs) {
                    if (subs && subs[that.model.attributes.data.defaultSubtitle]) {
                        that.setupLocalSubs(that.model.attributes.data.defaultSubtitle, subs);
                    } else {
                        that.SubtitlesRetrieved = true; //no subs could be found so we have done all we can
                    }
                });
                break;
            case 'movie':
                this.setupLocalSubs(this.model.attributes.data.defaultSubtitle, this.model.attributes.data.subtitles);
                break;
            }
        },

        setupLocalSubs: function (defaultSubtitle, subtitles) {
            var that = this;

            if (subtitles[defaultSubtitle]) {
                if (!App.Streamer.streamDir) {
                    var watchstreamDir = function () {
                        require('watchjs').unwatch(App.Streamer, 'streamDir', watchstreamDir);
                        that.initsubs(defaultSubtitle, subtitles);
                    };
                    require('watchjs').watch(App.Streamer, 'streamDir', watchstreamDir);
                } else {
                    this.initsubs(defaultSubtitle, subtitles);
                }
            } else {
                this.SubtitlesRetrieved = true;
            }

        },

        fetchTVSubtitles: function (data) {
            var that = this;
            var defer = Q.defer();
            // fix for anime
            if (data.imdbid.indexOf('mal') !== -1) {
                data.imdbid = null;
            }
            win.debug('Subtitles data request:', data);

            var subtitleProvider = App.Config.getProvider('tvshowsubtitle');

            subtitleProvider.fetch(data).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    var subtitles = subs;
                    that.model.attributes.data.subtitles = subs;
                    defer.resolve(subs);
                    win.info(Object.keys(subs).length + ' subtitles found');
                } else {
                    win.warn('No subtitles returned');
                    defer.resolve(false);
                }
            }).catch(function (err) {
                defer.resolve(false);
                console.log('subtitleProvider.fetch()', err);
            });
            return defer.promise;
        },

        initsubs: function (defaultSubtitle, subtitles) {
            var that = this;
            App.vent.on('subtitle:downloaded', function (sub) {
                if (sub) {
                    that.extsubs = sub;
                    App.vent.trigger('subtitle:convert', {
                        path: sub,
                        language: defaultSubtitle
                    }, function (err, res) {
                        if (err) {
                            that.extsubs = null;
                            win.error('error converting subtitles', err);
                        } else {
                            App.Subtitles.Server.start(res);
                        }
                        that.SubtitlesRetrieved = true;
                    });
                } else {
                    that.SubtitlesRetrieved = true;
                }
            });
            App.vent.trigger('subtitle:download', {
                url: subtitles[defaultSubtitle],
                path: path.join(App.Streamer.streamDir, App.Streamer.client.torrent.files[App.Streamer.fileindex].name)
            });
        },

        StateUpdate: function () {
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
                    } else {
                        this.ui.status.text(i18n.__('Downloading'));
                    }
                    this.updateStatsUI(Common.fileSize(Stream.downloadSpeed()) + '/s', Common.fileSize(Stream.uploadSpeed()) + '/s', Stream.wires.length)
                }
                if (!this.loadingStopped) {
                    _.delay(_.bind(this.StateUpdate, this), 1000);
                }
            } else {
                _.delay(_.bind(this.StateUpdate, this), 1000);
            }
        },

        backupCountdown: function () {
            if (this.loadingStopped) {
                return;
            }
            if (!this.count) {
                this.count = 60;
                win.debug('Backup ' + this.count + ' Second timeout started for:', this.model.get('data').metadata.title);
            }
            if (this.count === 0) {
                win.debug('Smart Loading timeout reached for :', this.model.get('data').metadata.title, 'Starting Playback Arbitrarily');
                var loadingPlayer = document.getElementById('loading_player');
                this.loadingStopped = true;
                loadingPlayer.pause();
                loadingPlayer.src = ''; // empty source
                loadingPlayer.load();
                this.initMainplayer();
                return;
            }
            this.count--;
            _.delay(_.bind(this.backupCountdown, this), 1000);
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
                if (that.loadingStopped) {
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
            var that = this;

            function begin() {
                if (that.player === 'local') {
                    var playerModel = new Backbone.Model(that.model.get('data'));
                    App.vent.trigger('stream:local', playerModel);
                } else {
                    var externalPlayerModel = that.model.get('player');
                    externalPlayerModel.set('src', App.Streamer.src);
                    externalPlayerModel.set('subtitle', that.extsubs); //set subs if we have them; if not? well that boat has sailed.
                    App.vent.trigger('stream:ready', externalPlayerModel);
                    that.playingExternally = true;
                    that.StateUpdate();
                }
            }
            if (this.SubtitlesRetrieved || this.model.attributes.data.defaultSubtitle === 'none') {
                begin();
            } else {
                win.info('Subtitles Not Yet Loaded, Waiting for them');
                var watchSubsLoaded = function (forced) {
                    require('watchjs').unwatch(this, 'SubtitlesLoaded', watchSubsLoaded);
                    if (!forced) {
                        win.info('Subtitles Retrived! Starting playback');
                    }
                    begin();
                };
                require('watchjs').watch(this, 'SubtitlesLoaded', watchSubsLoaded);
                this.ui.stateTextDownload.text(i18n.__('Waiting For Subtitles'));
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
        }

    });

    App.View.Loading = Loading;
})(window.App);
