(function (App) {
    'use strict';

    var that,
        util = require('util'),
        Q = require('q');


    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',

        ui: {
            eyeInfo: '.eye-info-player',
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
            activePeers: '.active_peers_player',
            percentCompleted: '.downloaded_player',
            title: '.player-title',
            pause: '.fa-pause',
            play: '.fa-play',
            quality: '.quality-info-player',
            nextShow: '.media-title',
            nextPhoto: '.media-poster',
            nextTitle: '.media-subtitle-1',
            nextSE: '.media-subtitle-2',
            nextDiscription: '.media-subtitle-3',
            nextUI: '.item-next'
        },

        events: {
            'click .close-info-player': 'closePlayer',
            'click .playnownext': 'playNextNow',
            'click .playnownextNOT': 'playNextNot',
            'click .vjs-text-track': 'moveSubtitles'
        },

        keyboardEvents: {
            'esc': function (e) {
                this.nativeWindow = require('nw.gui').Window.get();

                if (this.nativeWindow.isFullscreen) {
                    this.leaveFullscreen();
                } else {
                    this.closePlayer();
                }
            },
            'backspace': 'closePlayer',
            'f': 'toggleFullscreen',
            'ctrl+d': 'toggleMouseDebug',
            'h': function () {
                this.adjustSubtitleOffset(-0.1);
            },
            'g': function () {
                this.adjustSubtitleOffset(0.1);
            },
            'shift+h': function () {
                this.adjustSubtitleOffset(-1);
            },
            'shift+g': function () {
                this.adjustSubtitleOffset(1);
            },
            'ctrl+h': function () {
                this.adjustSubtitleOffset(-5);
            },
            'ctrl+g': function () {
                this.adjustSubtitleOffset(5);
            },
            'space': function () {
                $('.vjs-play-control').click();
            },
            'p': function () {
                $('.vjs-play-control').click();
            },
            'right': function () {
                this.seek(10);
            },
            'shift+right': function () {
                this.seek(60);
            },
            'ctrl+right': function () {
                this.seek(600);
            },
            'left': function () {
                this.seek(-10);
            },
            'shift+left': function () {
                this.seek(-60);
            },
            'ctrl+left': function () {
                this.seek(-600);
            },
            'up': function () {
                this.adjustVolume(0.1);
            },
            'shift+up': function () {
                this.adjustVolume(0.5);
            },
            'ctrl+up': function () {
                this.adjustVolume(1);
            },
            'down': function () {
                this.adjustVolume(-0.1);
            },
            'shift+down': function () {
                this.adjustVolume(-0.5);
            },
            'ctrl+down': function () {
                this.adjustVolume(-1);
            },
            'm': 'toggleMute',
            'u': 'displayStreamURL',
            'j': function () {
                this.adjustPlaybackRate(-0.1, true);
            },
            'k': function () {
                this.adjustPlaybackRate(1.0, false);
            },
            'shift+k': function () {
                this.adjustPlaybackRate(1.0, false);
            },
            'ctrl+k': function () {
                this.adjustPlaybackRate(1.0, false);
            },
            'l': function () {
                this.adjustPlaybackRate(0.1, true);
            },
            'shift+j': function () {
                this.adjustPlaybackRate(0.5, false);
            },
            'ctrl+j': function () {
                this.adjustPlaybackRate(0.5, false);
            },
            'shift+l': function () {
                this.adjustPlaybackRate(2.0, false);
            },
            'ctrl+l': function () {
                this.adjustPlaybackRate(4.0, false);
            }

        },
        initialize: function () {
            this.video = false;
            this.firstplay = true;
            this.playing = false;
            this.NextEpisode = false;
            this.inFullscreen = win.isFullscreen;
        },


        onShow: function () {
            that = this;
            this.prossessType();
            this.setUI();
            this.setPlayerEvents();
            this.restoreUserPref();

        },
        detectscrubbing: function () {
            var that = this;
            this.scrubbing = false;
            $('.vjs-control-bar').mousedown(function () {
                that.scrubbing = true;
            }).bind('mouseup mouseleave', function () {
                _.delay(function () {
                    that.scrubbing = false;
                }, 200);
            });
        },
        prossessType: function () {
            if (this.model.get('type') === 'trailer') {

                this.video = videojs('video_player', {
                    techOrder: ['youtube'],
                    forceSSL: true,
                    forceHTML5: true,
                    ytcontrols: false,
                    quality: '720p'
                }).ready(function () {
                    this.addClass('vjs-has-started');
                    this.play();
                });
                this.ui.eyeInfo.hide();

                $('.trailer_mouse_catch')
                    .show()
                    .appendTo('div#video_player')
                    .mousemove(function (event) {
                        if (!that.player.userActive()) {
                            that.player.userActive(true);
                        }
                    })
                    .click(function (e) {
                        e.preventDefault();
                        $('.vjs-play-control').click();
                    })
                    .dblclick(function (e) {
                        e.preventDefault();
                        that.toggleFullscreen();
                    });

            } else {

                this.video = videojs('video_player', {
                    nativeControlsForTouch: false,
                    trackTimeOffset: 0,
                    plugins: {
                        biggerSubtitle: {},
                        smallerSubtitle: {},
                        customSubtitles: {},
                        progressTips: {}
                    }
                }).ready(function () {
                    this.play();
                });

            }
            this.player = this.video.player();
            App.PlayerView = this;

            this.player.tech.off('mousedown');
            this.player.tech.on('mouseup', function (event) {
                if (event.target.origEvent) {
                    if (!event.target.origEvent.originalEvent.defaultPrevented) {
                        that.player.tech.onClick(event);
                    }
                    // clean up after ourselves
                    delete event.target.origEvent;
                } else {
                    that.player.tech.onClick(event);
                }
            });

            // Force custom controls
            this.player.usingNativeControls(false);
            $('#player').bind('mousewheel', _.bind(this.mouseScroll, this)); //volume wheel control
            this.detectscrubbing();
        },

        setUI: function () {
            this.ui.title.text(this.model.attributes.metadata.title);

            if (this.model.attributes.metadata.quality) {
                this.ui.quality.text(this.model.attributes.metadata.quality);
            }

            $('.player-header-background').appendTo('div#video_player');


            $('li:contains("subtitles off")').text(i18n.__('Disabled'));

            $('#header').removeClass('header-shadow').hide();
            // Test to make sure we have title

            $('.filter-bar').show();
            $('#player_drag').show();

            App.vent.trigger('player:ready', {});

        },

        restoreUserPref: function () {

            if (AdvSettings.get('alwaysFullscreen') && !this.inFullscreen) {
                this.toggleFullscreen();
            }
            if (this.inFullscreen) {
                win.leaveFullscreen();
                this.toggleFullscreen();
            }

            this.player.volume(AdvSettings.get('playerVolume'));
        },

        setPlayerEvents: function () {
            var type = this.model.get('type');
            var that = this;
            this.player.one('play', function () {

                if (that.model.get('type') === 'trailer') {
                    // XXX quality fix
                    $('.vjs-quality-button .vjs-menu-content').remove();
                    $('.vjs-quality-button').css('cursor', 'default');

                    // XXX hide ads
                    try {
                        document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('video-ads')[0].style.display = 'none';
                    } catch (e) {}

                    // XXX hide watermark
                    try {
                        document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('html5-watermark')[0].style.opacity = 0;
                    } catch (e) {}

                } else {
                    that.playing = true;
                    that.progressDoneUI();
                    that.processNext();
                }
            });

            this.player.on('loadeddata', function () {
                // resume position
                if (AdvSettings.get('lastWatchedTitle') === that.model.attributes.metadata.title && AdvSettings.get('lastWatchedTime') > 0) {
                    var position = AdvSettings.get('lastWatchedTime');
                    win.debug('Resuming position to', position.toFixed(), 'secs');
                    that.player.currentTime(position);
                } else if (AdvSettings.get('traktPlayback')) {

                    var type = that.model.get('type');
                    if (type === 'show') {
                        type = 'episode';
                    }

                    var id = type === 'movie' ? that.model.attributes.metadata.imdb_id : that.model.attributes.metadata.episode_id;

                    App.Trakt.sync.playback(type, id).then(function (position_percent) {
                        var total = that.video.duration();
                        var position = (position_percent / 100) * total | 0;

                        if (position > 0) {
                            win.debug('Resuming position to', position.toFixed(), 'secs (reported by Trakt)');
                            that.player.currentTime(position);
                        }
                    });
                }

                // alert Trakt
                that.sendToTrakt('start');
            });

            this.player.on('play', function () {

                // Trigger a resize so the subtitles are adjusted
                $(window).trigger('resize');
                console.log(that.scrubbing);
                if (!that.scrubbing) {
                    if (!that.firstplay) {
                        that.ui.pause.hide().dequeue();
                        that.ui.play.appendTo('div#video_player');
                        that.ui.play.show().delay(1500).queue(function () {
                            that.ui.play.hide().dequeue();
                        });
                    } else {
                        that.firstplay = false;
                    }
                }
                that.sendToTrakt('start');
            });

            this.player.on('pause', function () {
                if (!that.scrubbing) {
                    that.ui.play.hide().dequeue();
                    that.ui.pause.appendTo('div#video_player');
                    that.ui.pause.show().delay(1500).queue(function () {
                        that.ui.pause.hide().dequeue();
                    });
                    that.sendToTrakt('pause');
                }
            });

            this.player.on('ended', function () {
                if (that.NextEpisode) {
                    that.closePlayer(true);
                } else {
                    that.closePlayer();
                }
            });

            this.player.on('error', function (error) {
                that.sendToTrakt('stop');
                // TODO: user errors
                if (that.model.get('type') === 'trailer') {
                    setTimeout(function () {
                        App.vent.trigger('player:close');
                    }, 2000);
                }
                win.error('video.js error code: ' + $('#video_player').get(0).player.error().code, $('#video_player').get(0).player.error());
            });


            // Double Click to toggle Fullscreen
            $('#video_player').dblclick(function (event) {
                that.toggleFullscreen();
                // Stop any mouseup events pausing video
                event.preventDefault();
            });

            if (this.model.get('type') !== 'trailer') {

                $('.eye-info-player, .vjs-subtitles-button').on('mouseenter', function () {
                    this.iid = setInterval(function () {
                        that.refreshStreamStats();
                    }, 500);
                    this.iid_ = setInterval(function () {
                        if (!that.player.userActive()) {
                            that.player.userActive(true);
                        }
                    }, 100);
                }).on('mouseleave', function () {
                    this.iid && clearInterval(this.iid);
                    clearInterval(this.iid_);
                });
                this.refreshStreamStats();
            }


        },
        toggleFullscreen: function () {
            $('.vjs-fullscreen-control').click();
        },

        sendToTrakt: function (method) {
            var type = this.model.get('type');
            var id = type === 'movie' ? this.model.attributes.metadata.imdb_id : this.model.attributes.metadata.episode_id;
            var progress = this.video.currentTime() / this.video.duration() * 100 | 0;
            App.Trakt.scrobble(method, type, id, progress);
        },

        checkAutoPlay: function () {
            if (!this.playing || !this.NextEpisode) {
                return;
            }
            var timeLeft = this.video.duration() - this.video.currentTime();

            if ((this.video.duration() - this.video.currentTime()) < 60 && this.video.currentTime() > 30) {

                if (!this.autoplayisshown) {
                    this.autoplayisshown = true;

                    if (!this.precachestarted) {
                        this.precachestarted = true;
                        console.log('Preload Streamer Started');
                        if (this.model.attributes.autoPlayData.streamer === 'preload') {
                            App.PreloadStreamer.start(this.NextEpisode);
                        } else {
                            App.Streamer.start(this.NextEpisode, true);
                        }
                        $('.item-next').appendTo('div#video_player');
                        $('.dial').each(function () {

                            var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

                            //Function to convert hex format to a rgb color
                            function rgb2hex(rgb) {
                                rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
                            }

                            function hex(x) {
                                return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
                            }
                            var elm = $(this);

                            var perc = 0;
                            var color = rgb2hex($('.circular-bar').css('color'));
                            elm.knob({
                                'value': 0,
                                'min': 0,
                                'max': 60,
                                "skin": "tron",
                                "readOnly": true,
                                "bgColor": "rgba(23, 24, 27, 0.75)",
                                "thickness": .17,
                                "fgColor": color,
                                'dynamicDraw': true,
                                "displayInput": false
                            });

                        });
                    }
                    win.debug('Showing Auto Play message');
                    if (!this.player.userActive()) {
                        this.player.userActive(true);
                    }
                }
                if (!this.autoplaypercent) {
                    this.autoplaypercent = 0;
                }
                var oldpercent = this.autoplaypercent;
                this.autoplaypercent = 60 - timeLeft;

                if (oldpercent !== this.autoplaypercent) {
                    var percent = this.autoplaypercent;
                    var count = Math.round(this.video.duration() - this.video.currentTime());
                    $('#playnextcountdown').text(count);

                    $('.dial').each(function () {
                        var elm = $(this);
                        $({
                            value: oldpercent
                        }).animate({
                            value: percent
                        }, {
                            duration: 0,
                            progress: function () {
                                elm.val(Math.ceil(this.value)).trigger('change')
                            }
                        });

                    });
                }
            } else {
                if (this.autoplayisshown) {
                    win.debug('Hiding Auto Play message');
                    $('.playing_next').hide();
                    $('.playing_next span').text('');
                    this.autoplayisshown = false;
                }
            }

            if (this.playing) {
                this.checkAutoPlayTimer = _.delay(_.bind(this.checkAutoPlay, this), 1000);
            }
        },


        playNextNow: function () {
            this.closePlayer(true);
        },
        refreshStreamStats: function () {
            var Streamer;
            if (App.Streamer.src) {
                Streamer = App.Streamer;
            } else {
                Streamer = App.PreloadStreamer;
            }
            var Stream = Streamer.client.swarm;

            if (!Stream) {
                return;
            }

            this.ui.downloadSpeed.text(Common.fileSize(Stream.downloadSpeed()) + '/s');
            this.ui.uploadSpeed.text(Common.fileSize(Stream.uploadSpeed()) + '/s');
            this.ui.activePeers.text(Stream.wires.length);
            var downloadedsize = Stream.downloaded;
            var totalsize = Streamer.client.torrent.files[Streamer.fileindex].length;
            var percent = downloadedsize / totalsize * 100;
            if (percent.toFixed() === 0) {
                percent = 1;
            }
            if (percent.toFixed(0) < 100) {
                if (!this.createdRemaining) { //we create it
                    this.createdRemaining = true;
                    $('.details-info-player').append('<br><span class="remaining">' + this.remainingTime() + '</span>');
                } else { //we just update
                    $('.remaining').html(this.remainingTime());
                }
                this.ui.percentCompleted.text(Common.fileSize(downloadedsize) + ' / ' + Common.fileSize(totalsize) + ' (' + percent.toFixed() + '%)');
            } else {
                if (!this.PreloadStarted) { //we create it
                    this.PreloadStarted = true;

                }
                this.ui.percentCompleted.text(i18n.__('Done'));
                if ($('.remaining').length) {
                    $('.remaining').remove();
                }
            }

        },

        progressDoneUI: function () {
            if (!this.playing) {
                return;
            }
            var Streamer;
            if (App.Streamer.src) {
                Streamer = App.Streamer;
            } else {
                Streamer = App.PreloadStreamer;
            }

            var Stream = Streamer.client.swarm;
            if (!Stream) {
                if (this.playing) {
                    this.updateInfo = _.delay(_.bind(this.progressDoneUI, this), 100);
                }
                return;
            }
            var downloadedsize = Stream.downloaded;

            var totalsize = Streamer.client.torrent.files[Streamer.fileindex].length;
            var percent = downloadedsize / totalsize * 100;
            if (percent.toFixed() === 0) {
                percent = 1;
            }
            if (percent.toFixed(0) < 100) {
                $('.vjs-load-progress').css('width', percent.toFixed(0) + '%');
            } else {
                $('.vjs-load-progress').css('width', '100%');
            }
            if (this.playing) {
                this.updateInfo = _.delay(_.bind(this.progressDoneUI, this), 100);
            }
        },


        remainingTime: function () {

            var Streamer;
            if (App.Streamer.src) {
                Streamer = App.Streamer;
            } else {
                Streamer = App.PreloadStreamer;
            }
            var Stream = Streamer.client.swarm;

            var downloadedsize = Stream.downloaded;
            var totalsize = Streamer.client.torrent.files[Streamer.fileindex].length;

            var downloadTimeLeft = Math.round((totalsize - downloadedsize) / Stream.downloadSpeed()); // time to wait before download complete
            if (isNaN(downloadTimeLeft) || downloadTimeLeft < 0) {
                downloadTimeLeft = 0;
            } else if (!isFinite(downloadTimeLeft)) { // infinite
                downloadTimeLeft = undefined;
            }
            var timeLeft = downloadTimeLeft;

            if (timeLeft === undefined) {
                return i18n.__('Unknown time remaining');
            } else if (timeLeft > 3600) {
                return i18n.__('%s hour(s) remaining', Math.round(timeLeft / 3600));
            } else if (timeLeft > 60) {
                return i18n.__('%s minute(s) remaining', Math.round(timeLeft / 60));
            } else if (timeLeft <= 60) {
                return i18n.__('%s second(s) remaining', timeLeft);
            }
        },

        processNext: function () {
            var that = this;
            if (!this.model.get('autoPlayData')) {
                return;
            }

            var episodes = this.model.attributes.autoPlayData.episodes;
            var episodesData = this.model.attributes.autoPlayData.episodes_data;
            var episodeID = parseInt(this.model.attributes.metadata.season) * 100 + parseInt(this.model.attributes.metadata.episode);

            var nextEpisodeID = episodes.indexOf(episodeID) + 1;

            var nextEpisodeData,
                nextEpisodeTorrent;

            var nextEpisodeDetails = _.find(episodesData, function (data, dataIdx) {
                if (data.id === episodes[nextEpisodeID]) {
                    nextEpisodeData = data;
                    return true;
                }
            });
            if (!nextEpisodeData) {
                return;
            }
            var quality;
            if (nextEpisodeData.torrents[this.model.attributes.metadata.quality]) {
                quality = this.model.attributes.metadata.quality;
                nextEpisodeTorrent = nextEpisodeData.torrents[this.model.attributes.metadata.quality].url;
            } else {

                var torrents = nextEpisodeData.torrents;

                switch (Settings.shows_default_quality) {
                case '1080p':
                    if (torrents['1080p']) {
                        quality = '1080p';
                    } else if (torrents['720p']) {
                        quality = '720p';
                    } else if (torrents['480p']) {
                        quality = '480p';
                    }
                    break;
                case '720p':
                    if (torrents['1080p']) {
                        quality = '720p';
                    } else if (torrents['480p']) {
                        quality = '480p';
                    } else if (torrents['1080p']) {
                        quality = '1080p';
                    }
                    break;
                case '480p':
                    if (torrents['480p']) {
                        quality = '480p';
                    } else if (torrents['720p']) {
                        quality = '720p';
                    } else if (torrents['1080p']) {
                        quality = '1080p';
                    }
                    break;
                }
                nextEpisodeTorrent = nextEpisodeData.torrents[quality].url;
            }

            var autoPlayDataNext = this.model.attributes.autoPlayData;

            if (autoPlayDataNext.streamer === 'main') {
                autoPlayDataNext.streamer = 'preload';
            } else {
                autoPlayDataNext.streamer = 'main';
            }
            var metadata = {
                title: this.model.attributes.metadata.showName + ' - ' + i18n.__('Season') + ' ' + nextEpisodeData.season + ', ' + i18n.__('Episode') + ' ' + nextEpisodeData.episode + ' - ' + nextEpisodeData.title,
                showName: this.model.attributes.metadata.showName,
                season: nextEpisodeData.season,
                episode: nextEpisodeData.episode,
                cover: this.model.attributes.metadata.cover,
                tvdb_id: this.model.attributes.metadata.tvdb_id,
                episode_id: nextEpisodeData.episode_id,
                imdb_id: this.model.attributes.metadata.imdb_id,
                backdrop: this.model.attributes.metadata.backdrop,
                quality: quality
            };
            var torrentStartNext = {
                torrent: nextEpisodeTorrent,
                type: 'show',
                metadata: metadata,
                autoPlayData: autoPlayDataNext,
                status: this.model.attributes.status,
                device: App.Device.Collection.selected
            };
            this.NextEpisode = torrentStartNext;

            this.fetchTVSubtitles({
                imdbid: this.model.attributes.metadata.imdb_id,
                season: nextEpisodeData.season,
                episode: nextEpisodeData.episode
            }).then(function (subs) {
                that.NextEpisode.subtitles = subs;
            });
            this.checkAutoPlay();
            this.loadPlayNextUI(metadata);
        },
        loadPlayNextUI: function (metadata) {
            var nextEpisode = metadata;
            var that = this;

            function formatTwoDigit(n) {
                return n > 9 ? '' + n : '0' + n;
            }
            var tvshowname = $.trim(this.model.attributes.metadata.showName.replace(/[\.]/g, ' '))
                .replace(/^\[.*\]/, '') // starts with brackets
                .replace(/[^\w ]+/g, '') // remove brackets
                .replace(/ +/g, '-') // has spaces
                .replace(/_/g, '-') // has '_'
                .replace(/\-$/, '') // ends with '-'
                .replace(/^\./, '') // starts with '.'
                .replace(/^\-/, ''); // starts with '-'
            console.log(tvshowname)
            App.Trakt.episodes.summary(tvshowname, formatTwoDigit(nextEpisode.season), formatTwoDigit(nextEpisode.episode))
                .then(function (episodeSummary) {
                    if (!episodeSummary) {
                        win.warn('Unable to fetch data from Trakt.tv');
                    } else {
                        var data = episodeSummary;
                        console.log(data);
                        that.ui.nextShow.text(that.model.attributes.metadata.showName);
                        that.ui.nextTitle.text(data.title);
                        that.loadBackground(data.images.screenshot.full);
                        that.ui.nextDiscription.text(data.overview);
                        that.ui.nextSE.text('S' + data.season + ' · E' + data.number);
                    }
                }).catch(function (err) {
                    console.log(err);
                });
        },
        loadBackground: function (data) {
            var backgroundUrl = data;
            var that = this;
            var bgError = false;
            var bgCache = new Image();
            bgCache.src = backgroundUrl;
            bgCache.onload = function () {
                try {
                    that.ui.nextPhoto.css('background-image', 'url(' + backgroundUrl + ')').addClass('fadein');

                } catch (e) {}
                bgCache = null;
            };
            bgCache.onerror = function () {
                bgError = true;
                bgCache = null;
            };

        },
        fetchTVSubtitles: function (data) {
            var deferred = Q.defer();
            var that = this;
            win.debug('Subtitles data request:', data);

            var subtitleProvider = App.Config.getProvider('tvshowsubtitle');

            subtitleProvider.fetch(data).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    var subtitles = subs;
                    deferred.resolve(subtitles);
                    win.info(Object.keys(subs).length + ' subtitles found');
                } else {
                    deferred.reject({});
                    win.warn('No subtitles returned');
                }
            }).catch(function (err) {
                deferred.reject({});
                console.log('subtitleProvider.fetch()', err);
            });
            return deferred.promise;
        },
        playNextNot: function () {
            win.debug('Hiding Auto Play message');
            $('.playing_next').hide();
            $('.playing_next span').text('');
            this.autoplayisshown = false;
            this.NextEpisode = false;
        },
        toggleMouseDebug: function () {
            if (this.player.debugMouse_) {
                this.player.debugMouse_ = false;
                this.displayOverlayMsg('Mouse debug disabled');
            } else {
                this.player.debugMouse_ = true;
                this.displayOverlayMsg('Mouse debug enabled. Dont touch the mouse until disabled.');
            }
        },
        seek: function (s) {
            var t = this.player.currentTime();
            this.player.currentTime(t + s);
            if (!this.player.userActive()) {
                this.player.userActive(true);
            }
        },
        mouseScroll: function (e) {
            if ($(e.target).parents('.vjs-subtitles-button').length) {
                return;
            }
            var mult = (Settings.os === 'mac') ? -1 : 1; // up/down invert
            if ((event.wheelDelta * mult) > 0) { // Scroll up
                this.adjustVolume(0.05);
            } else { // Scroll down
                this.adjustVolume(-0.05);
            }
        },

        adjustVolume: function (i) {
            var v = this.player.volume();
            this.player.volume(v + i);
            this.displayOverlayMsg(i18n.__('Volume') + ': ' + this.player.volume().toFixed(1) * 100 + '%');
        },

        toggleMute: function () {
            this.player.muted(!this.player.muted());
        },

        displayStreamURL: function () {
            var clipboard = require('nw.gui').Clipboard.get();
            clipboard.set($('#video_player video').attr('src'), 'text');
            this.displayOverlayMsg(i18n.__('URL of this stream was copied to the clipboard'));
        },

        adjustSubtitleOffset: function (s) {
            var o = this.player.options()['trackTimeOffset'];
            this.player.options()['trackTimeOffset'] = (o + s);
            this.displayOverlayMsg(i18n.__('Subtitles Offset') + ': ' + (-this.player.options()['trackTimeOffset'].toFixed(1)) + ' ' + i18n.__('secs'));
        },

        adjustPlaybackRate: function (rate, delta) {
            var nRate = delta ? this.player.playbackRate() + rate : rate;
            if (nRate > 0.49 && nRate < 4.01) {
                this.player.playbackRate(nRate);
                if (this.player.playbackRate() !== nRate) {
                    this.displayOverlayMsg(i18n.__('Playback rate adjustment is not available for this video!'));
                } else {
                    this.displayOverlayMsg(i18n.__('Playback rate') + ': ' + parseFloat(nRate.toFixed(1)) + 'x');
                }
            }
        },

        displayOverlayMsg: function (message) {
            if ($('.vjs-overlay').length > 0) {
                $('.vjs-overlay').text(message);
                clearTimeout($.data(this, 'overlayTimer'));
                $.data(this, 'overlayTimer', setTimeout(function () {
                    $('.vjs-overlay').fadeOut('normal', function () {
                        $(this).remove();
                    });
                }, 3000));
            } else {
                $(this.player.el()).append('<div class =\'vjs-overlay vjs-overlay-top-left\'>' + message + '</div>');
                $.data(this, 'overlayTimer', setTimeout(function () {
                    $('.vjs-overlay').fadeOut('normal', function () {
                        $(this).remove();
                    });
                }, 3000));
            }
        },

        closePlayer: function (next) {
            next = next === true ? true : false; // undefined|event trap
            $('#player').unbind('mousewheel', _.bind(this.mouseScroll, this));

            this.playing = false;
            win.info('Player closed');

            var type = this.model.get('type');

            if (type !== 'trailer') {
                if (this.checkAutoPlayTimer) {
                    clearInterval(this.checkAutoPlayTimer);
                }
                AdvSettings.set('lastWatchedTitle', this.model.attributes.metadata.title);
                AdvSettings.set('lastWatchedTime', this.video.currentTime() - 3);
            }

            this.sendToTrakt('stop');

            if (this.video.currentTime() / this.video.duration() >= 0.8 && type !== 'trailer') {
                this.sendToTrakt('stop');
                var watchObject = this.model.get('metadata');
                App.vent.trigger('watched', 'add', type, watchObject);
                AdvSettings.set('lastWatchedTime', false); // clear last pos
            }

            this.ui.pause.dequeue();
            this.ui.play.dequeue();

            this.destroy(next);
        },

        onDestroy: function (next) {
            if (this.model.get('type') === 'trailer') { // XXX Sammuel86 Trailer UI Show FIX/HACK -START
                $('.trailer_mouse_catch').remove();
            }
            $('#player_drag').hide();
            $('#header').show();
            if (!this.dontTouchFS && !this.inFullscreen && win.isFullscreen) {
                win.leaveFullscreen();
            }
            if (this.inFullscreen && !win.isFullscreen) {
                $('.btn-os.fullscreen').removeClass('active');
            }

            var vjsPlayer = document.getElementById('video_player');
            videojs(vjsPlayer).dispose();
            App.vent.trigger('player:close');
            if (this.model.get('type') !== 'trailer') {
                if (!next) {
                    App.vent.trigger('streamer:stop');
                    App.vent.trigger('preloadStreamer:stop');
                } else {
                    if (this.model.attributes.autoPlayData.streamer === 'preload') {
                        App.vent.trigger('streamer:stop');
                    } else {
                        console.log('DESTROYING PRELOAD STREAMER');
                        App.vent.trigger('preloadStreamer:stop');
                    }
                    var playerModel = new Backbone.Model(this.NextEpisode);

                    App.vent.trigger('stream:local', playerModel);
                }
            }

        }
    });
    App.View.Player = Player;
})(window.App);
