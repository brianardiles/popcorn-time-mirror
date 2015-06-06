(function (App) {
    'use strict';

    var that,
        util = require('util'),
        prettyBytes = require('pretty-bytes');

    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',
        player: null,

        ui: {
            eyeInfo: '.eye-info-player',
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
            activePeers: '.active_peers_player',
            percentCompleted: '.downloaded_player',
            title: '.player-title',
            pause: '.fa-pause',
            play: '.fa-play'
        },

        events: {
            'click .close-info-player': 'closePlayer',
            'click .playnownext': 'playNextNow',
            'click .playnownextNOT': 'playNextNot',
            'click .vjs-text-track': 'moveSubtitles'
        },

        initialize: function () {
            this.video = false;
            this.firstplay = true;
            this.playing = false;
            this.inFullscreen = win.isFullscreen;
        },


        onShow: function () {
            that = this;
            this.prossessType();
            this.setUI();
            this.setPlayerEvents();
            this.bindKeyboardShortcuts();
            this.restoreUserPref();
            this.processNext();
            console.log(this.model.attributes);
        },

        prossessType: function () {
            if (this.model.get('type') === 'trailer') {

                this.video = videojs('video_player', {
                    techOrder: ['youtube'],
                    forceSSL: true,
                    ytcontrols: false,
                    quality: '720p'
                }).ready(function () {
                    this.addClass('vjs-has-started');
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
        },

        setUI: function () {
            this.ui.title.text(this.model.attributes.metadata.title);

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
            console.log(this.model);
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
                }

                if (that.model.get('auto_play')) {
                    that._AutoPlayCheckTimer = setInterval(that.checkAutoPlay(that), 10 * 100 * 1); // every 1 sec
                }

            });

            this.player.on('loadeddata', function () {
                // resume position
                if (AdvSettings.get('lastWatchedTitle') === that.model.get('title') && AdvSettings.get('lastWatchedTime') > 0) {
                    var position = AdvSettings.get('lastWatchedTime');
                    win.debug('Resuming position to', position.toFixed(), 'secs');
                    that.player.currentTime(position);
                } else if (AdvSettings.get('traktPlayback')) {

                    var type = that.model.get('type');

                    if (type === 'tvshow') {
                        type = 'show';
                    }
                    var id = type === 'movie' ? that.model.get('imdb_id') : that.model.get('tvdb_id');

                    App.Trakt.sync.playback(type, id).then(function (position_percent) {
                        var total = that.video.duration();
                        var position = (position_percent / 100) * total | 0;
                        win.debug('Resuming position to', position.toFixed(), 'secs (reported by Trakt)');
                        that.player.currentTime(position);
                    });
                }

                // alert Trakt
                that.sendToTrakt('start');
            });

            this.player.on('play', function () {

                // Trigger a resize so the subtitles are adjusted
                $(window).trigger('resize');

                if (!that.firstplay) {
                    that.ui.pause.hide().dequeue();
                    that.ui.play.appendTo('div#video_player');
                    that.ui.play.show().delay(1500).queue(function () {
                        that.ui.play.hide().dequeue();
                    });
                } else {
                    that.firstplay = false;
                }
            });

            this.player.on('pause', function () {

                that.ui.pause.appendTo('div#video_player');
                that.ui.pause.show().delay(1500).queue(function () {
                    that.ui.pause.hide().dequeue();
                });

            });

            this.player.on('ended', function () {
                if (that.model.get('auto_play')) {
                    that.playNextNow();
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
            if (type === 'tvshow') {
                type = 'show';
            }
            var id = type === 'movie' ? this.model.get('imdb_id') : this.model.get('tvdb_id');
            var progress = this.video.currentTime() / this.video.duration() * 100 | 0;
            App.Trakt.scrobble(method, type, id, progress);
        },

        checkAutoPlay: function () {
            if (this.model.get('type') !== 'movie' && this.next_episode_model) {
                if ((this.video.duration() - this.video.currentTime()) < 60 && this.video.currentTime() > 30) {

                    if (!this.autoplayisshown) {
                        if (!this.precachestarted) {
                            this.precachestarted = true;
                        }

                        win.debug('Showing Auto Play message');
                        this.autoplayisshown = true;
                        $('.playing_next').show();
                        $('.playing_next').appendTo('div#video_player');
                        if (!this.player.userActive()) {
                            this.player.userActive(true);
                        }
                    }

                    var count = Math.round(this.video.duration() - this.video.currentTime());
                    $('.playing_next span').text(count + ' ' + i18n.__('Seconds'));

                } else {
                    if (this.autoplayisshown) {
                        win.debug('Hiding Auto Play message');
                        $('.playing_next').hide();
                        $('.playing_next span').text('');
                        this.autoplayisshown = false;
                    }
                }
            }
        },

        refreshStreamStats: function () {

            var Stream = App.Streamer.client.swarm;
            this.ui.downloadSpeed.text(this.prettySpeed(Stream.downloadSpeed()));
            this.ui.uploadSpeed.text(this.prettySpeed(Stream.uploadSpeed()));
            this.ui.activePeers.text(Stream.wires.length);
            var downloadedsize = Stream.downloaded;
            var totalsize = App.Streamer.client.torrent.files[App.Streamer.fileindex].length;
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
                this.ui.percentCompleted.text(prettyBytes(downloadedsize) + ' / ' + prettyBytes(totalsize) + ' (' + percent.toFixed() + '%)');
            } else {
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
            var Stream = App.Streamer.client.swarm;
            var downloadedsize = Stream.downloaded;
            var totalsize = App.Streamer.client.torrent.files[App.Streamer.fileindex].length;
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
            var Stream = App.Streamer.client.swarm;
            var downloadedsize = Stream.downloaded;
            var totalsize = App.Streamer.client.torrent.files[App.Streamer.fileindex].length;

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

        prettySpeed: function (speed) {
            speed = speed || 0;
            if (speed === 0) {
                return util.format('%s %s', 0, 'B/s');
            }

            var converted = Math.floor(Math.log(speed) / Math.log(1024));
            return util.format('%s %s/s', (speed / Math.pow(1024, converted)).toFixed(2), ['B', 'KB', 'MB', 'GB', 'TB'][converted]);
        },


        processNext: function () {
            if (!this.model.get('auto_play')) {
                return;
            }

            var episodes = this.model.get('episodes');

            if (this.model.get('auto_id') !== episodes[episodes.length - 1]) {

                var auto_play_data = this.model.get('auto_play_data');
                var current_quality = this.model.get('quality');
                var idx;

                _.find(auto_play_data, function (data, dataIdx) {
                    if (data.id === this.model.get('auto_id')) {
                        idx = dataIdx;
                        return true;
                    }
                });
                var next_episode = auto_play_data[idx + 1];

                next_episode.auto_id = parseInt(next_episode.season) * 100 + parseInt(next_episode.episode);
                next_episode.auto_play_data = auto_play_data;
                next_episode.episodes = episodes;
                next_episode.quality = current_quality;

                if (next_episode.torrents[current_quality].url) {
                    next_episode.torrent = next_episode.torrents[current_quality].url;
                } else {
                    next_episode.torrent = next_episode[next_episode.torrents.length - 1].url; //select highest quality available if user selected not found
                }

                this.next_episode_model = new Backbone.Model(next_episode);
            }
        },
        bindKeyboardShortcuts: function () {
            var _this = this;

            // add ESC toggle when full screen, go back when not
            Mousetrap.bind('esc', function (e) {
                _this.nativeWindow = require('nw.gui').Window.get();

                if (_this.nativeWindow.isFullscreen) {
                    _this.leaveFullscreen();
                } else {
                    _this.closePlayer();
                }
            });

            Mousetrap.bind('backspace', function (e) {
                _this.closePlayer();
            });

            Mousetrap.bind(['f', 'F'], function (e) {
                _this.toggleFullscreen();
            });

            Mousetrap.bind('h', function (e) {
                _this.adjustSubtitleOffset(-0.1);
            });

            Mousetrap.bind('g', function (e) {
                _this.adjustSubtitleOffset(0.1);
            });

            Mousetrap.bind('shift+h', function (e) {
                _this.adjustSubtitleOffset(-1);
            });

            Mousetrap.bind('shift+g', function (e) {
                _this.adjustSubtitleOffset(1);
            });

            Mousetrap.bind('ctrl+h', function (e) {
                _this.adjustSubtitleOffset(-5);
            });

            Mousetrap.bind('ctrl+g', function (e) {
                _this.adjustSubtitleOffset(5);
            });

            Mousetrap.bind(['space', 'p'], function (e) {
                $('.vjs-play-control').click();
            });

            Mousetrap.bind('right', function (e) {
                _this.seek(10);
            });

            Mousetrap.bind('shift+right', function (e) {
                _this.seek(60);
            });

            Mousetrap.bind('ctrl+right', function (e) {
                _this.seek(600);
            });

            Mousetrap.bind('left', function (e) {
                _this.seek(-10);
            });

            Mousetrap.bind('shift+left', function (e) {
                _this.seek(-60);
            });

            Mousetrap.bind('ctrl+left', function (e) {
                _this.seek(-600);
            });

            Mousetrap.bind('up', function (e) {
                _this.adjustVolume(0.1);
            });

            Mousetrap.bind('shift+up', function (e) {
                _this.adjustVolume(0.5);
            });

            Mousetrap.bind('ctrl+up', function (e) {
                _this.adjustVolume(1);
            });

            Mousetrap.bind('down', function (e) {
                _this.adjustVolume(-0.1);
            });

            Mousetrap.bind('shift+down', function (e) {
                _this.adjustVolume(-0.5);
            });

            Mousetrap.bind('ctrl+down', function (e) {
                _this.adjustVolume(-1);
            });

            Mousetrap.bind(['m', 'M'], function (e) {
                _this.toggleMute();
            });

            Mousetrap.bind(['u', 'U'], function (e) {
                _this.displayStreamURL();
            });

            Mousetrap.bind('j', function (e) {
                _this.adjustPlaybackRate(-0.1, true);
            });

            Mousetrap.bind(['k', 'shift+k', 'ctrl+k'], function (e) {
                _this.adjustPlaybackRate(1.0, false);
            });

            Mousetrap.bind(['l'], function (e) {
                _this.adjustPlaybackRate(0.1, true);
            });

            Mousetrap.bind(['shift+j', 'ctrl+j'], function (e) {
                _this.adjustPlaybackRate(0.5, false);
            });

            Mousetrap.bind('shift+l', function (e) {
                _this.adjustPlaybackRate(2.0, false);
            });

            Mousetrap.bind('ctrl+l', function (e) {
                _this.adjustPlaybackRate(4.0, false);
            });

            Mousetrap.bind('ctrl+d', function (e) {
                _this.toggleMouseDebug();
            });

            document.addEventListener('mousewheel', _.bind(this.mouseScroll, this));
        },

        unbindKeyboardShortcuts: function () {

            Mousetrap.unbind('esc');

            Mousetrap.unbind('backspace');

            Mousetrap.unbind(['f', 'F']);

            Mousetrap.unbind('h');

            Mousetrap.unbind('g');

            Mousetrap.unbind('shift+h');

            Mousetrap.unbind('shift+g');

            Mousetrap.unbind('ctrl+h');

            Mousetrap.unbind('ctrl+g');

            Mousetrap.unbind(['space', 'p']);

            Mousetrap.unbind('right');

            Mousetrap.unbind('shift+right');

            Mousetrap.unbind('ctrl+right');

            Mousetrap.unbind('left');

            Mousetrap.unbind('shift+left');

            Mousetrap.unbind('ctrl+left');

            Mousetrap.unbind('up');

            Mousetrap.unbind('shift+up');

            Mousetrap.unbind('ctrl+up');

            Mousetrap.unbind('down');

            Mousetrap.unbind('shift+down');

            Mousetrap.unbind('ctrl+down');

            Mousetrap.unbind(['m', 'M']);

            Mousetrap.unbind(['u', 'U']);

            Mousetrap.unbind(['j', 'shift+j', 'ctrl+j']);

            Mousetrap.unbind(['k', 'shift+k', 'ctrl+k']);

            Mousetrap.unbind(['l', 'shift+l', 'ctrl+l']);

            Mousetrap.unbind('ctrl+d');

            document.removeEventListener('mousewheel', this.mouseScroll);
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
                this.adjustVolume(0.1);
            } else { // Scroll down
                this.adjustVolume(-0.1);
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

        closePlayer: function () {
            win.info('Player closed');
            if (this._AutoPlayCheckTimer) {
                clearInterval(this._AutoPlayCheckTimer);
            }

            this.sendToTrakt('stop');
            this.playing = false;

            var type = this.model.get('type');
            var watchObject;
            if (type === 'tvshow') {
                type = 'show';
                watchObject = {
                    imdb_id: this.model.get('metadata').imdb_id,
                    tvdb_id: this.model.get('metadata').tvdb_id,
                    season: this.model.get('metadata').season,
                    episode: this.model.get('metadata').episode
                };
            } else {
                watchObject = {
                    imdbid: this.model.get('metadata').imdb_id,
                };
            }
            if (this.video.currentTime() / this.video.duration() >= 0.8 && type !== 'trailer') {
                App.vent.trigger(type + ':watched', watchObject, 'database');
            }

            // remember position
            if (this.video.currentTime() / this.video.duration() < 0.8) {
                AdvSettings.set('lastWatchedTitle', this.model.get('title'));
                AdvSettings.set('lastWatchedTime', this.video.currentTime() - 5);
            } else {
                AdvSettings.set('lastWatchedTime', false);
            }

            try {
                this.video.dispose();
            } catch (e) {
                // Stop weird Videojs errors
            }

            this.ui.pause.dequeue();
            this.ui.play.dequeue();

            App.Streamer.destroy();

            this.destroy();
        },

        onDestroy: function () {
            if (this.model.get('type') === 'trailer') { // XXX Sammuel86 Trailer UI Show FIX/HACK -START
                $('.trailer_mouse_catch').remove();
                this.closePlayer();
            }
            $('#player_drag').hide();
            $('#header').show();
            if (!this.dontTouchFS && !this.inFullscreen && win.isFullscreen) {
                win.leaveFullscreen();
            }
            if (this.inFullscreen && !win.isFullscreen) {
                $('.btn-os.fullscreen').removeClass('active');
            }
            this.unbindKeyboardShortcuts();
            App.vent.trigger('player:close');
        }
    });
    App.View.Player = Player;
})(window.App);
