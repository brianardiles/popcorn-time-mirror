(function(App) {
    'use strict';
    var util = require('util');
    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'app-overlay',

        ui: {
            stateTextDownload: '.text_download',
            progressTextDownload: '.value_download',

            stateTextPeers: '.text_peers',
            progressTextPeers: '.value_peers',

            stateTextSeeds: '.text_seeds',
            progressTextSeeds: '.value_seeds',

            seedStatus: '.seed_status',
            downloadPercent: '.download_percent',

            downloadSpeed: '.download_speed',
            uploadSpeed: '.upload_speed',
            progressbar: '#loadingbar-contents',

            player: '.player-name',
            streaming: '.external-play',
            controls: '.player-controls',
            cancel_button: '.cancel-button',

            title: '.title',
            backdrop: '.loading-background'
        },

        events: {
            'click .cancel-button': 'cancelStreaming',
            'click .pause': 'pauseStreaming',
            'click .stop': 'cancelStreaming',
            'click .play': 'resumeStreaming'
        },
        initialize: function() {
            var that = this;

            //If a child was removed from above this view
            App.vent.on('viewstack:pop', function() {
                if (_.last(App.ViewStack) === that.className) {
                    that.initKeyboardShortcuts();
                }
            });

            //If a child was added above this view
            App.vent.on('viewstack:push', function() {
                if (_.last(App.ViewStack) !== that.className) {
                    that.unbindKeyboardShortcuts();
                }
            });

            win.info('Loading torrent');

            if (this.model.attributes.data.type.indexOf('dropped') > -1) {
                this.augmentDropModel(this.model.attributes.data); // olny call if droped torrent/magnet
            }

        },

        initKeyboardShortcuts: function() {
            var that = this;
            Mousetrap.bind(['esc', 'backspace'], function(e) {
                that.cancelStreaming();
            });
        },

        unbindKeyboardShortcuts: function() {
            Mousetrap.unbind(['esc', 'backspace']);
        },

        onShow: function() {
            this.ui.stateTextDownload.text(i18n.__('Loading'));
            win.debug('Initializing Torrent Loader For', this.model.get('data').metadata.title);
            $('#header').addClass('header-shadow');
            $('.filter-bar').hide();
            this.initKeyboardShortcuts();
            this.player = this.model.get('player').get('id');
            this.StateUpdate();
            if (this.model.get('data').metadata.backdrop) {
                this.loadBackground(this.model.get('data').metadata.backdrop);
            }

        },

        initializeLoadingPlayer: function() {
            var that = this;
            var loadingPlayer = document.getElementById('loading_player');
            loadingPlayer.setAttribute('src', App.Streamer.src);
            win.debug('Requesting Initial Meta Chunks For', this.model.get('data').metadata.title);
            loadingPlayer.muted = true;
            loadingPlayer.load();
            loadingPlayer.play();
            var debugmetachunks = false;
            loadingPlayer.ontimeupdate = function() {
                if (loadingPlayer.currentTime > 0 && !debugmetachunks) {
                    win.info('Initial Meta Chunks Received! Starting Playback in 5 seconds.');
                    debugmetachunks = true;
                }
                if (loadingPlayer.currentTime > 5) {
                    that.playing = true;
                    loadingPlayer.pause();
                    loadingPlayer.src = ""; // empty source
                    loadingPlayer.load();
                    that.initMainplayer();
                }

            };
        },
        initMainplayer: function() {
            if (this.player === 'local') {
                var playerModel = new Backbone.Model(this.model.get('data'));
                App.vent.trigger('stream:local', playerModel);
            } else {
                var externalPlayerModel = this.model.get('player');
                externalPlayerModel.set('src', App.Streamer.src);
                App.vent.trigger('stream:ready', externalPlayerModel);

                this.ui.player.text(this.model.get('player').get('name'));
                this.ui.streaming.css('visibility', 'visible');
                this.playingExternally = true;
                this.StateUpdate();
            }

        },
        StateUpdate: function() {
            if (this.playing && !this.playingExternally)
                return;
            var that = this;

            var Stream = App.Streamer.client.swarm;
            if (App.Streamer.fileindex !== null && !App.FileSelectorIsOpen) {
                this.ui.stateTextDownload.text(i18n.__('Connecting'));

                this.ui.seedStatus.css('visibility', 'visible');
                //var downloaded = streamInfo.downloaded / (1024 * 1024);
                if (!this.initializedLoadingPlayer && Stream.downloadSpeed() > 10) {
                    this.initializedLoadingPlayer = true;
                    this.initializeLoadingPlayer();
                }
                if (Stream.downloadSpeed()) {
                    if (!this.initializedLoadingPlayer) {
                        this.initializedLoadingPlayer = true;
                        this.initializeLoadingPlayer();
                    }
                    if (!this.playingExternally) {
                        this.ui.stateTextDownload.text(i18n.__('Downloading'));
                    }
                    this.ui.progressTextPeers.text(Stream.wires.length);
                    this.ui.downloadSpeed.text(this.prettySpeed(Stream.downloadSpeed()));
                    this.ui.uploadSpeed.text(this.prettySpeed(Stream.uploadSpeed()));
                }
                if (this.playingExternally) {
                    this.ui.stateTextDownload.text(i18n.__('Downloaded'));
                    this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 500);
                }
                if (!this.playing) {
                    this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 500);
                }
            } else {
                this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 100);
            }


        },
        prettySpeed: function(speed) {
            speed = speed || 0;
            if (speed == 0) return util.format("%s %s", 0, "B/s");

            var converted = Math.floor(Math.log(speed) / Math.log(1024));
            return util.format("%s %s/s", (speed / Math.pow(1024, converted)).toFixed(2), ['B', 'KB', 'MB', 'GB', 'TB'][converted]);
        },
        cancelStreaming: function() {
            this.playing = true; // stop text update
            this.playingExternally = false;
            clearInterval(this.updateInfo);

            $('.filter-bar').show();
            $('#header').removeClass('header-shadow');

            if (this.player !== 'local') {
                App.vent.trigger('device:stop');
            }

            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('show:closeDetail');
                App.vent.trigger('movie:closeDetail');
            });
            _.defer(function() {
                App.Streamer.destroy();
                App.vent.trigger('player:close');
            });

        },
        loadBackground: function(data) {
            var backgroundUrl = data;
            var that = this;
            var bgError = false;
            var bgCache = new Image();
            bgCache.src = backgroundUrl;
            bgCache.onload = function() {
                try {
                    that.ui.backdrop.css('background-image', 'url(' + backgroundUrl + ')').addClass('fadein');
                } catch (e) {}
                bgCache = null;
            };
            bgCache.onerror = function() {
                bgError = true;
                bgCache = null;
            };

        },

        augmentDropModel: function(data) {
            var metadata = data.metadata;
            var that = this;

            switch (data.type) {
                case 'dropped-tvshow':
                    // @TODO: REMOVE THAT AND MIGRATE IT TO A PACKAGE !!!

                    var showTitle = metadata.showName.replace(/\w\S*/g, function(txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    });
                    App.Trakt.shows.summary(showTitle)
                        .then(function(summary) {
                            if (!summary) {
                                win.warn('Unable to fetch data from Trakt.tv');
                            } else {
                                App.Trakt.episodes.summary(showTitle, metadata.season, metadata.episode)
                                    .then(function(episodeSummary) {
                                        if (!episodeSummary) {
                                            win.warn('Unable to fetch data from Trakt.tv');
                                        } else {
                                            var data = episodeSummary[0];
                                            that.model.attributes.data.type = 'tvshow';
                                            console.log(data);
                                            that.model.attributes.data.metadata.title = showTitle + ' - ' + i18n.__('Season') + ' ' + data.season + ', ' + i18n.__('Episode') + ' ' + data.number + ' - ' + data.title;
                                            that.model.attributes.data.metadata.showName = showTitle;
                                            that.model.attributes.data.metadata.season = data.season;
                                            that.model.attributes.data.metadata.episode = data.number;
                                            that.model.attributes.data.metadata.tvdb_id = data.ids.tvdb;
                                            that.model.attributes.data.metadata.imdb_id = data.ids.imdb;
                                            that.model.attributes.data.metadata.backdrop = data.images.screenshot.full;

                                            that.ui.title.text(that.model.attributes.data.metadata.title);

                                            that.loadBackground(that.model.attributes.data.metadata.backdrop);
                                        }
                                    }).catch(function(err) {
                                        // It might be a movie with the name of a TV Series ? Messy hollywood !
                                    });
                            }
                        }).catch(function(err) {
                            win.error('An error occured while trying to get metadata', err);
                        });

                    break;
                case 'dropped-movie':

                    console.log(metadata.title);

                    App.Trakt.search(metadata.title, 'movie')
                        .then(function(summary) {
                            if (!summary || summary.length === 0) {
                                win.warn('Unable to fetch data from Trakt.tv');
                            } else {
                                console.log(summary);
                                var data = summary[0].movie;
                                that.model.attributes.data.type = 'movie';
                                that.model.attributes.data.metadata.title = data.title;
                                that.model.attributes.data.metadata.cover = data.images.poster;
                                that.model.attributes.data.metadata.imdb_id = data.imdb_id;
                                that.model.attributes.data.metadata.backdrop = data.images.fanart.full;

                                that.ui.title.text(that.model.attributes.data.metadata.title);

                                that.loadBackground(that.model.attributes.data.metadata.backdrop);

                            }
                        }).catch(function(err) {
                            win.error('An error occured while trying to get metadata', err);
                        });

                    break;
                default:
                    //defualt none?
            }

        }

    });

    App.View.Loading = Loading;
})(window.App);