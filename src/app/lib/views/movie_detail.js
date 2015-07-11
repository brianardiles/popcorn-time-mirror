(function (App) {
    'use strict';

    App.View.MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',
        tagName: 'section',

        ui: {
            quality: '#quality-toggle',
            subtitles: '#subtitles-selector',
            device: '#device-selector'
        },

        keyboardEvents: {

        },

        events: {
            'click #exit-detail': 'closeDetails',
            'change #quality-toggle': 'qualityChanged',
            'change #subtitles-selector': 'subtitlesChanged',
            'change #device-selector': 'deviceChanged',
            'click .watchnow-btn': 'play'
        },

        initialize: function () {

        },

        onShow: function () {

        },
        closeDetails: function () {
            App.vent.trigger('movie:closeDetail');
        },
        qualityChanged: function (e) {
            console.log('Quality Changed', e.originalEvent.detail);
        },
        subtitlesChanged: function (e) {
            console.log('Subtitles Changed', e.originalEvent.detail);
        },
        deviceChanged: function (e) {
            console.log('Device Changed', e.originalEvent.detail);
        },
        play: function () {
            console.log(this.ui);
            console.log('Options selected:', {
                quality: this.ui.quality.get(0).selected.value,
                subtitles: this.ui.subtitles.get(0).selected.value,
                device: this.ui.device.get(0).selected.value,
            });
        }

    });
})(window.App);
