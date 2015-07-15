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
        },
        onShow: function () {
            if (this.model.attributes.data.type === 'show') {
                this.getEpisodeDetails();
            }
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
            if (this.SubtitlesLoaded || this.model.attributes.data.defaultSubtitle === 'none') {
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
                that.StateUpdate();
                img.remove();
            })
            img.addEventListener('load', function () {
                if (this.width >= 1920 && this.height >= 1080) {
                    that.ui.backdrop.removeClass('fadein');
                    var vibrant = new Vibrant(img, 64, 4);
                    var swatches = vibrant.swatches();
                    var color = null;
                    if (swatches['Vibrant']) {
                        if (swatches['Vibrant'].getPopulation() < 20) {
                            color = swatches['Muted'].getHex();
                        } else {
                            color = swatches['Vibrant'].getHex();
                        }
                    } else if (swatches['Muted']) {
                        color = swatches['Muted'].getHex();
                    }
                    if (color) {
                        that.model.set('color', color);
                        _.delay(function () {
                            that.ui.backdrop.css('background-image', 'url(' + url + ')').addClass('fadein');
                            that.ui.progressStyle.html('paper-progress::shadow #activeProgress {  background-color: ' + color + '; }');
                            that.StateUpdate();
                        }, 300);
                    } else {
                        that.StateUpdate();
                    }
                } else {
                    that.StateUpdate();
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
