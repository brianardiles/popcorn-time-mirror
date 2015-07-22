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
            background: '.bg-backdrop',
            bookmarkedIcon: '.bookmark-toggle',
            watchedIcon: '.watched-toggle'
        },

        events: {
            'click .back': 'closeDetails',
            'click .bookmark-toggle': 'toggleBookmarked',
            'click .watched-toggle': 'toggleWatched',
            'change #quality-toggle': 'qualityChanged',
            'change #subtitles-selector': 'subtitlesChanged',
            'change #device-selector': 'deviceChanged',
            'click .watchnow-btn': 'play',
            'click #play-trailer': 'playTrailer',
            'click #trakt-link': 'openTrakt',
            'click .person': 'openPerson'
        },

        keyboardEvents: {
            'esc': 'closeDetails', 
            'backspace': 'closeDetails', 
            'space': 'play', 
            'enter': 'play', 
            'q': 'toggleQualityKey',
            'f': 'toggleBookmarked',
            'w': 'toggleWatched',
            'd': 'toggleDevice',
            's': 'toggleSubs'
        },

        initialize: function () {

        },

        onShow: function () {
            if (this.model.get('bookmarked')) {
                this.ui.bookmarkedIcon.prop('icon', 'bookmark');
            }
            if (this.model.get('watched')) {
                this.ui.watchedIcon.prop('icon', 'visibility');
            }
            this.loadCover();
            this.loadBackground();
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

        toggleDevice: function (e) {
            var newIndex = parseInt($('#device-selector pt-selectable-element[selected=true]').attr('index')) + 1;
            var newElement = $('#device-selector pt-selectable-element[index=' + newIndex + ']');
            if(newElement.length === 0) {
                newIndex = 0;
                newElement = $('#device-selector pt-selectable-element[index=' + newIndex + ']');
            }
            newElement.click();
            $('#device-selector').get(0).toggle();
        },

        deviceChanged: function (e) {
            console.log('Device Changed', e.originalEvent.detail);
            var player = e.originalEvent.detail.value;
            this.model.set('device', player);
            App.Device.Collection.setDevice(player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        },

        openTrakt: function () {
            gui.Shell.openExternal('http://trakt.tv/movies/' + this.model.get('imdb_id'));
        },

        openPerson: function (e) {
            var personid = $(e.currentTarget).parent().data('id');
            gui.Shell.openExternal('http://trakt.tv/people/' + personid);
        },

        toggleWatched: function () {
            if (!this.model.get('watched')) {
                this.model.set('watched', true);
                this.ui.watchedIcon.prop('icon', 'visibility');
            } else {
                this.model.set('watched', false);
                this.ui.watchedIcon.prop('icon', 'visibility-off');
            }
            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-watched').click();

        },

        toggleBookmarked: function () {
            if (!this.model.get('bookmarked')) {
                this.model.set('bookmarked', true);
                this.ui.bookmarkedIcon.prop('icon', 'bookmark');
            } else {
                this.model.set('bookmarked', false);
                this.ui.bookmarkedIcon.prop('icon', 'bookmark-outline');
            }
            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-favorites').click();
        },

        toggleQualityKey: function (e) {
            var newIndex = parseInt($('#quality-toggle pt-selectable-element[selected=true]').attr('index')) + 1;
            var newElement = $('#quality-toggle pt-selectable-element[index=' + newIndex + ']');
            if(newElement.length === 0) {
                newIndex = 0;
                newElement = $('#quality-toggle pt-selectable-element[index=' + newIndex + ']');
            }
            newElement.click();
        },

        toggleSubs: function (e) {
            var newIndex = parseInt($('#subtitles-selector pt-selectable-element[selected=true]').attr('index')) + 1;
            var newElement = $('#subtitles-selector pt-selectable-element[index=' + newIndex + ']');
            if(newElement.length === 0) {
                newIndex = 0;
                newElement = $('#subtitles-selector pt-selectable-element[index=' + newIndex + ']');
            }
            newElement.click();
            $("#subtitles-selector").get(0).toggle();
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

        loadBackground: function (url) {
            var that = this;
            var url = this.ui.background.data('bgr');
            var img = document.createElement('img');
            img.setAttribute('src', url);
            img.addEventListener('error', function () {
                that.ui.background.css('background-image', 'url("images/bg-header.jpg")').addClass('fadein');
                img.remove();
            });
            img.addEventListener('load', function () {
                that.ui.background.css('background-image', 'url(' + url + ')').addClass('fadein');
                img.remove();
            });
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
                    color: this.model.get('color'),
                    quality: this.ui.quality.get(0).selected.value
                },
                subtitles: this.model.get('subtitle'),
                defaultSubtitle: this.ui.subtitles.get(0).selected.value,
                type: 'movie',
                device: App.Device.Collection.selected
            };
            App.Streamer.start(torrentStart);
        }

    });
})(window.App);
