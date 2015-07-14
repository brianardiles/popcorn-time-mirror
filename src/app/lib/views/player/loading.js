(function (App) {
    'use strict';
    var Q = require('q');
    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'loading-view',
        tagName: 'section',

        ui: {
            status: '.status',
            backdrop: '.bg-backdrop'
        },

        events: {
            'click .back': 'cancelStreaming',
        },

        keyboardEvents: {

        },

        initialize: function () {},
        onShow: function () {
            this.getEpisodeDetails();
            this.animateLoadingbar();
        },
        animateLoadingbar: function () {
            var intObj = {
                template: 3,
                parent: '.progressbar' // to other position
            };
            var queryProgress = new Mprogress(intObj);
            queryProgress.start();
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
            var background = url;
            var bgCache = new Image();
            bgCache.src = background;
            bgCache.onload = function () {
                try {
                    if (this.width >= 1920 && this.height >= 1080) { //ensure hd backdrop
                        that.ui.backdrop.removeClass('fadein');
                        _.delay(function () {
                            that.ui.backdrop.css('background-image', 'url(' + background + ')').addClass('fadein');
                        }, 300);
                    }
                } catch (e) {
                    console.log(e);
                }
                bgCache = null;
            };
        }

    });

    App.View.Loading = Loading;
})(window.App);
