(function (App) {
    'use strict';

    App.View.MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',
        tagName: 'section',

        ui: {

        },

        keyboardEvents: {

        },

        events: {
            'click #exit-detail': 'closeDetails'
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
