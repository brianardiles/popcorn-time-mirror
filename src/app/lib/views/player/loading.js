(function (App) {
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
            backdrop: '.loading-background',
            backdrop2: '.loading-background-crossfade'
        },

        events: {
            'click .cancel-button': 'cancelStreaming',
            'click .pause': 'pauseStreaming',
            'click .stop': 'cancelStreaming',
            'click .play': 'resumeStreaming'
        },

        keyboardEvents: {
            'esc': 'cancelStreaming',
            'backspace': 'cancelStreaming'
        },

        initialize: function () {
            var that = this;

            win.info('Loading torrent');

            function formatTwoDigit(n) {
                return n > 9 ? '' + n : '0' + n;
            }

            if (this.model.get('data').metadata.backdrop) {
                this.loadBackground(this.model.get('data').metadata.backdrop);
            }
            var type = this.model.attributes.data.type;
            switch (type) {
            case 'show':
                App.Trakt.episodes.summary(this.model.get('data').metadata.imdb_id, formatTwoDigit(this.model.attributes.data.metadata.season), formatTwoDigit(this.model.attributes.data.metadata.episode))
                    .then(function (episodeSummary) {
                        if (!episodeSummary) {
                            win.warn('Unable to fetch data from Trakt.tv');
                        } else {
                            var data = episodeSummary;
                            that.model.attributes.data.metadata.backdrop = data.images.screenshot.full;
                            that.loadBackground(data.images.screenshot.full, true);
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
                break;
            case 'movie':
                break;
            default: //this is a dropped selection
                this.waitForSelection();
            }

            this.listenTo(App.vent, 'subtitlev2:done', function (info) {
                console.log(info);
                switch (type) {
                case 'show':
                    that.model.attributes.data.subtitles = info.subs;
                    that.extsubs = info.extpath;
                    break;
                case 'movie':
                    that.extsubs = info;
                    break;
                }
            });

            this.setupSubs();
        },

        onShow: function () {
            this.ui.stateTextDownload.text(i18n.__('Loading'));
            win.debug('Initializing Torrent Loader For', this.model.get('data').metadata.title);
            this.ui.title.text(this.model.get('data').metadata.title);
            $('#header').addClass('header-shadow');
            $('.filter-bar').hide();
            if (this.model.get('player').get('id')) {
                this.player = this.model.get('player').get('id');
            } else {
                this.player = 'local';
            }
            this.StateUpdate();
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
        backupCountdown: function () {
            if (this.playing) {
                return;
            }
            if (!this.count) {
                this.count = 60;
                win.debug('Backup ' + this.count + ' Second timeout started for:', this.model.get('data').metadata.title);
            }
            if (this.count === 1) {
                win.debug('Smart Loading timeout reached for :', this.model.get('data').metadata.title, 'Starting Playback Arbitrarily in 3 seconds');
                var loadingPlayer = document.getElementById('loading_player');
                this.playing = true;
                loadingPlayer.pause();
                loadingPlayer.src = ''; // empty source
                loadingPlayer.load();
                _.delay(_.bind(this.initMainplayer, this), 3000);
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
                if (loadingPlayer.currentTime > 0 && !debugmetachunks) {
                    win.info('Initial Meta Chunks Received! Starting Playback in 3 seconds.');
                    debugmetachunks = true;
                }
                if (loadingPlayer.currentTime > 3) {
                    that.playing = true;
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

                this.ui.player.text(this.model.get('player').get('name'));
                this.ui.streaming.css('visibility', 'visible');
                this.playingExternally = true;
                this.StateUpdate();
            }

        },
        StateUpdate: function () {
            if (this.playing && !this.playingExternally) {
                return;
            }
            var that = this;

            var Swarm = App.Streamer.client.swarm;
            if (App.Streamer.fileindex !== null) {
                this.ui.stateTextDownload.text(i18n.__('Connecting'));

                this.ui.seedStatus.css('visibility', 'visible');
                if (!this.initializedLoadingPlayer && Swarm.downloadSpeed() > 10) {
                    this.initializedLoadingPlayer = true;
                    this.initializeLoadingPlayer();
                    this.backupCountdown();
                }
                if (Swarm.downloadSpeed()) {
                    if (App.Streamer && App.Streamer.client && !this.freeSpaceChecked) {
                        var totalsize = App.Streamer.client.torrent.files[App.Streamer.fileindex].length;
                        this.checkFreeSpace(totalsize);
                    }
                    if (!this.initializedLoadingPlayer) {
                        this.initializedLoadingPlayer = true;
                        this.initializeLoadingPlayer();
                    }
                    if (!this.playingExternally) {
                        this.ui.stateTextDownload.text(i18n.__('Downloading'));
                    }
                    this.ui.progressTextPeers.text(Swarm.wires.length);
                    this.ui.downloadSpeed.text(Common.fileSize(Swarm.downloadSpeed()) + '/s');
                    this.ui.uploadSpeed.text(Common.fileSize(Swarm.uploadSpeed()) + '/s');
                }
                if (this.playingExternally) {
                    this.ui.stateTextDownload.text(i18n.__('Downloaded'));
                    this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 1000);
                }
                if (!this.playing) {
                    this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 1000);
                }
            } else {
                this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 100);
            }


        },

        cancelStreaming: function () {
            this.playing = true; // stop text update
            this.playingExternally = false;
            clearInterval(this.updateInfo);

            $('.filter-bar').show();
            $('#header').removeClass('header-shadow');

            if (this.player !== 'local') {
                App.vent.trigger('device:stop');
            }

            Mousetrap.bind('esc', function (e) {
                App.vent.trigger('show:closeDetail');
                App.vent.trigger('movie:closeDetail');
            });
            _.defer(function () {
                App.vent.trigger('streamer:stop');
                App.vent.trigger('player:close');
            });

        },
        loadBackground: function (backgroundUrl, change) {
            console.log('loadBackground', backgroundUrl, change)
            var that = this;
            var bgError = false;
            var bgCache = new Image();
            bgCache.src = backgroundUrl;
            bgCache.onload = function () {
                try {
                    if (change) {
                        if (this.width >= 1920 && this.height >= 1080) {
                            that.ui.backdrop.addClass('fadeout');
                            that.ui.backdrop2.css('background-image', 'url(' + backgroundUrl + ')').addClass('fadein');
                        }
                    } else {
                        that.ui.backdrop.css('background-image', 'url(' + backgroundUrl + ')').addClass('fadein');
                    }
                } catch (e) {}
                bgCache = null;
            };
            bgCache.onerror = function () {
                bgError = true;
                bgCache = null;
            };

        },
        waitForSelection: function () {
            var that = this;

            var watchFileSelected = function () {
                require('watchjs').unwatch(App.Streamer.updatedInfo, 'fileSelectorIndexName', watchFileSelected);
                that.model.attributes.data.metadata.title = App.Streamer.updatedInfo.fileSelectorIndexName;
                that.augmentDropModel(that.model.attributes.data); // olny call if droped torrent/magnet
            };
            require('watchjs').watch(App.Streamer.updatedInfo, 'fileSelectorIndexName', watchFileSelected);

        },


        augmentDropModel: function (data) {
            var metadata = data.metadata;
            var that = this;

            // TODO
            /*var torrentMetadata;
            if (torrent.info && torrent.info.name) {
                torrentMetadata = torrent.info.name.toString();
            }*/
            var torrentMetadata;
            if (App.Streamer && App.Streamer.client) {
                torrentMetadata = App.Streamer.client.torrent.info.name.toString();
            }

            Common.matchTorrent(metadata.title, torrentMetadata)
                .then(function (res) {
                    if (res.error) {
                        win.warn('Common.matchTorrent()', res.error);
                        that.ui.title.text(res.filename);
                    } else {
                        switch (res.type) {
                        case 'movie':
                            that.model.attributes.data.type = 'movie';
                            that.model.attributes.data.metadata.title = res.movie.title;
                            //that.model.attributes.data.metadata.cover = data.images.poster;
                            that.model.attributes.data.metadata.imdb_id = res.movie.imdbid;
                            that.model.attributes.data.metadata.backdrop = res.movie.image;
                            // QUALITY??
                            that.ui.title.text(that.model.attributes.data.metadata.title);
                            that.loadBackground(that.model.attributes.data.metadata.backdrop);
                            break;
                        case 'episode':
                            that.model.attributes.data.type = 'show';
                            that.model.attributes.data.metadata.title = res.show.title + ' - ' + i18n.__('Season') + ' ' + res.show.episode.season + ', ' + i18n.__('Episode') + ' ' + res.show.episode.episode + ' - ' + res.show.episode.title;
                            that.model.attributes.data.metadata.season = res.show.episode.season;
                            that.model.attributes.data.metadata.episode = res.show.episode.episode;
                            that.model.attributes.data.metadata.tvdb_id = res.show.tvdbid;
                            // QUALITY???
                            that.model.attributes.data.metadata.episode_id = res.show.episode.tvdbid;
                            that.model.attributes.data.metadata.imdb_id = res.show.imdbid;
                            that.model.attributes.data.metadata.backdrop = res.show.episode.image;
                            that.ui.title.text(that.model.attributes.data.metadata.title);
                            that.loadBackground(that.model.attributes.data.metadata.backdrop);
                            break;
                        default:
                        }
                    }
                })
                .catch(function (err) {
                    that.ui.title.text($.trim(metadata.title.replace('[rartv]', '').replace('[PublicHD]', '').replace('[ettv]', '').replace('[eztv]', '')).replace(/[\s]/g, '.'));
                    win.error('An error occured while trying to get metadata and subtitles', err);
                });
        },

        checkFreeSpace: function (size) {
            if (!size) {
                return;
            }
            this.freeSpaceChecked = true;
            size = size / (1024 * 1024 * 1024);
            var reserved = size * 20 / 100;
            reserved = reserved > 0.25 ? 0.25 : reserved;
            var minspace = size + reserved;

            var exec = require('child_process').exec,
                cmd;

            if (process.platform === 'win32') {
                var drive = Settings.tmpLocation.substr(0, 2);

                cmd = 'dir /-C ' + drive;

                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        return;
                    }
                    var stdoutParse = stdout.split('\n');
                    stdoutParse = stdoutParse[stdoutParse.length - 1] !== '' ? stdoutParse[stdoutParse.length - 1] : stdoutParse[stdoutParse.length - 2];
                    var regx = stdoutParse.match(/(\d+)/g);
                    if (regx !== null) {
                        var freespace = regx[regx.length - 1] / (1024 * 1024 * 1024);
                        if (freespace < minspace) {
                            $('#player .warning-nospace').css('display', 'block');
                        }
                    }
                });
            } else {
                var path = Settings.tmpLocation;

                cmd = 'df -Pk "' + path + '" | awk \'NR==2 {print $4}\'';

                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        return;
                    }

                    var freespace = stdout.replace(/\D/g, '') / (1024 * 1024);
                    if (freespace < minspace) {
                        $('#player .warning-nospace').css('display', 'block');
                    }
                });
            }
        }

    });

    App.View.Loading = Loading;
})(window.App);
