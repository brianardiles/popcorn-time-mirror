(function (App) {
    'use strict';

    App.View.MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',
        tagName: 'section',

        ui: {
            'click .back': 'closeDetails'
        },

        keyboardEvents: {

        },

        events: {

        },

        initialize: function () {

        },

        onShow: function () {

        },
        closeDetails: function () {
            App.vent.trigger('movie:closeDetail');
        }

    });
})(window.App);
