(function (App) {
    'use strict';
    var Q = require('q');
    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'loading-view',
        tagName: 'section',

        ui: {

        },

        events: {
            'click .back': 'cancelStreaming',
        },

        keyboardEvents: {

        },

        initialize: function () {},
        onShow: function () {
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
        }

    });

    App.View.Loading = Loading;
})(window.App);
