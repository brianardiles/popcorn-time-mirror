(function (App) {
    'use strict';

    App.View.MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',
        tagName: 'section',

        ui: {
            quality: '#quality-toggle',
            subtitles: '#subtitles-selector',
            device: '#device-selector',
            poster: '.poster',
            background: '.bg-backdrop'
        },

        keyboardEvents: {

        },

        events: {
            'click .back': 'closeDetails',
            'change #quality-toggle': 'qualityChanged',
            'change #subtitles-selector': 'subtitlesChanged',
            'change #device-selector': 'deviceChanged',
            'click .watchnow-btn': 'play',
            'click #play-trailer': 'playTrailer',
            'click #imdb-link': 'openIMDb'
        },

        initialize: function () {

        },

        onShow: function () {
            this.loadCover();
            this.loadbackground();
        },
        closeDetails: function () {
            App.vent.trigger('movie:closeDetail');
        },
        qualityChanged: function (e) {
            console.log('Quality Changed', e.originalEvent.detail);
            this.model.set('quality', e.originalEvent.detail.value);
        },
        subtitlesChanged: function (e) {
            console.log('Subtitles Changed', e.originalEvent.detail);
        },
        deviceChanged: function (e) {
            console.log('Device Changed', e.originalEvent.detail);
        },
        openIMDb: function () {
            gui.Shell.openExternal('http://www.imdb.com/title/' + this.model.get('imdb_id'));
        },
        loadCover: function () {
            var that = this;

            var url = this.ui.poster.prop('src');

            var cbackground = url;
            var coverCache = new Image();
            coverCache.src = cbackground;
            coverCache.onload = function () {
                try {
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
        playTrailer: function () {
            var trailer = new Backbone.Model({
                src: this.model.get('trailer'),
                metadata: {
                    title: this.model.get('title') + ' - ' + i18n.__('Trailer')
                },
                type: 'trailer'
            });
            var tmpPlayer = App.Device.Collection.selected.attributes.id;
            App.Device.Collection.setDevice('local');
            App.vent.trigger('stream:ready', trailer);
            App.Device.Collection.setDevice(tmpPlayer);
        },

        play: function () {

            var torrentStart = {
                torrent: this.model.get('torrents')[this.ui.quality.get(0).selected.value].magnet,
                metadata: {
                    backdrop: this.model.get('backdrop'),
                    title: this.model.get('title'),
                    cover: this.model.get('image'),
                    imdb_id: this.model.get('imdb_id'),
                    quality: this.ui.quality.get(0).selected.value
                },
                subtitles: this.ui.subtitles.get(0).selected.value,
                defaultSubtitle: this.subtitle_selected,
                type: 'movie',
                device: this.ui.device.get(0).selected.value
            };
            App.Streamer.start(torrentStart);

        }

    });
})(window.App);
