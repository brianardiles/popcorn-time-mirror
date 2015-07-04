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

            switch (this.model.attributes.data.type) {
            case 'show':
                this.fetchTVSubtitles({
                    imdbid: this.model.attributes.data.metadata.imdb_id,
                    season: this.model.attributes.data.metadata.season,
                    episode: this.model.attributes.data.metadata.episode
                });
                var tvshowname = $.trim(this.model.attributes.data.metadata.showName.replace(/[\.]/g, ' '))
                    .replace(/^\[.*\]/, '') // starts with brackets
                    .replace(/[^\w ]+/g, '') // remove brackets
                    .replace(/ +/g, '-') // has spaces
                    .replace(/_/g, '-') // has '_'
                    .replace(/\-$/, '') // ends with '-'
                    .replace(/^\./, '') // starts with '.'
                    .replace(/^\-/, ''); // starts with '-'

                console.log(tvshowname, formatTwoDigit(this.model.attributes.data.metadata.season), formatTwoDigit(this.model.attributes.data.metadata.episode));

                App.Trakt.episodes.summary(tvshowname, formatTwoDigit(this.model.attributes.data.metadata.season), formatTwoDigit(this.model.attributes.data.metadata.episode))
                    .then(function (episodeSummary) {
                        if (!episodeSummary) {
                            win.warn('Unable to fetch data from Trakt.tv');
                        } else {
                            var data = episodeSummary;
                            console.log(data);
                            that.model.attributes.data.metadata.backdrop = data.images.screenshot.full;
                            that.loadBackground(data.images.screenshot.full, true);
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
                break;
            case 'movie':
                console.log(this.model.attributes.data);
                var subtitles = this.model.attributes.data.subtitles;
                var defaultSubtitle = this.model.attributes.data.defaultSubtitle;
                if (defaultSubtitle !== 'none' && subtitles) {
                    var watchFileSelected = function () {
                        console.log(subtitles[defaultSubtitle]);
                        require('watchjs').unwatch(App.Streamer, 'streamDir', watchFileSelected);
                        App.vent.trigger('subtitle:download', {
                            url: subtitles[defaultSubtitle],
                            path: path.join(App.Streamer.streamDir, App.Streamer.client.torrent.files[App.Streamer.fileindex].name)
                        });
                    };
                    require('watchjs').watch(App.Streamer, 'streamDir', watchFileSelected);
                }
                break;
            default: //this is a dropped selection
                this.waitForSelection();
            }

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
        removeExtension: function (filename) {
            var lastDotPosition = filename.lastIndexOf('.');
            if (lastDotPosition === -1) {
                return filename;
            } else {
                return filename.substr(0, lastDotPosition);
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

            var Stream = App.Streamer.client.swarm;
            if (App.Streamer.fileindex !== null) {
                this.ui.stateTextDownload.text(i18n.__('Connecting'));

                this.ui.seedStatus.css('visibility', 'visible');
                if (!this.initializedLoadingPlayer && Stream.downloadSpeed() > 10) {
                    this.initializedLoadingPlayer = true;
                    this.initializeLoadingPlayer();
                    this.backupCountdown();
                    this.checkFreeSpace(App.Streamer.client.torrent.files[App.Streamer.fileindex].length);
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
                    this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 1000);
                }
                if (!this.playing) {
                    this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 1000);
                }
            } else {
                this.updateInfo = _.delay(_.bind(this.StateUpdate, this), 100);
            }

        },
        prettySpeed: function (speed) {
            speed = speed || 0;
            if (speed === 0) {
                return util.format('%s %s', 0, 'B/s');
            }

            var converted = Math.floor(Math.log(speed) / Math.log(1024));
            return util.format('%s %s/s', (speed / Math.pow(1024, converted)).toFixed(2), ['B', 'KB', 'MB', 'GB', 'TB'][converted]);
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
        loadBackground: function (data, change) {
            var backgroundUrl = data;
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
                that.model.attributes.data.metadata.title = that.removeExtension(App.Streamer.updatedInfo.fileSelectorIndexName);
                that.augmentDropModel(that.model.attributes.data); // olny call if droped torrent/magnet
            };
            require('watchjs').watch(App.Streamer.updatedInfo, 'fileSelectorIndexName', watchFileSelected);

        },

        fetchTVSubtitles: function (data) {
            var that = this;

            // fix for anime
            if (data.imdbid.indexOf('mal') !== -1) {
                data.imdbid = null;
            }
            console.log(data);
            win.debug('Subtitles data request:', data);

            var subtitleProvider = App.Config.getProvider('tvshowsubtitle');

            subtitleProvider.fetch(data).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    var subtitles = subs;
                    that.model.attributes.data.subtitles = subtitles;

                    win.info(Object.keys(subs).length + ' subtitles found');
                } else {
                    win.warn('No subtitles returned');
                }
            }).catch(function (err) {
                console.log('subtitleProvider.fetch()', err);
            });
        },


        fetchMovieSubtitles: function (data) {

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
                                that.ui.title.text(that.model.attributes.data.metadata.title);
                                that.loadBackground(that.model.attributes.data.metadata.backdrop);
                            }

                        }).catch(function (err) {
                            // Ok then, it's not a tv show, it's not a movie. I give up, deal with it.
                            win.error('An error occured while trying to get subtitles', err);
                        });
                };

                // we're going to start by assuming it's a TV Series
                var tvshowname = $.trim(se_re[1].replace(/[\.]/g, ' '))
                    .replace(/^\[.*\]/, '') // starts with brackets
                    .replace(/[^\w ]+/g, '') // remove brackets
                    .replace(/ +/g, '-') // has spaces
                    .replace(/_/g, '-') // has '_'
                    .replace(/\-$/, '') // ends with '-'
                    .replace(/^\./, ''); // starts with '.'
                App.Trakt.shows.summary(tvshowname)
                    .then(function (summary) {
                        if (!summary) {
                            win.warn('Unable to fetch data from Trakt.tv');
                        } else {
                            that.model.attributes.data.metadata.showName = summary.title;
                            App.Trakt.episodes.summary(tvshowname, se_re[2], se_re[3])
                                .then(function (episodeSummary) {
                                    if (!episodeSummary) {
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
                                        that.ui.title.text(that.model.attributes.data.metadata.title);

                                        that.loadBackground(that.model.attributes.data.metadata.backdrop, true);

                                        that.fetchTVSubtitles({
                                            imdbid: summary.ids.imdb,
                                            season: data.season.toString(),
                                            episode: data.number.toString()
                                        });
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

        checkFreeSpace: function (size) {
            size = size / (1024 * 1024 * 1024);
            var reserved = size * 20 / 100;
            reserved = reserved > 0.25 ? 0.25 : reserved;
            var minspace = size + reserved;
            var exec = require('child_process').exec;
            var cmd;
            if (process.platform === 'win32') {
                var drive = Settings.tmpLocation.substr(0, 2);


                cmd = 'wmic logicaldisk "' + drive + '" get freespace';

                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        return;
                    }

                    var stdoutObj = stdout.split('\n');
                    var freespace = stdoutObj[1].replace(/\D/g, '') / (1024 * 1024 * 1024);
                    if (freespace < minspace) {
                        $('#player .warning-nospace').css('display', 'block');
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
