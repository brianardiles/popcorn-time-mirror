(function (App) {
    'use strict';
    var Q = require('q');
    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'loading-view',
        tagName: 'section',

        ui: {
            status: '.status',
            backdrop: '.bg-backdrop',
            progressStyle: '#loadingStyle'
        },

        events: {
            'click .back': 'cancelStreaming',
        },

        keyboardEvents: {

        },

        initialize: function () {},
        onShow: function () {
            this.getEpisodeDetails();
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
            img.addEventListener('load', function () {
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
                        that.ui.progressStyle.html('paper-progress::shadow #activeProgress {  background-color: ' + color + '; }');
                        that.ui.backdrop.css('background-image', 'url(' + url + ')').addClass('fadein');
                    }, 300);
                }
                img.remove();
            });
        }


    });

    App.View.Loading = Loading;
})(window.App);
