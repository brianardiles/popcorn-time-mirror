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

        },

        keyboardEvents: {

        },

        initialize: function () {

        },

        onShow: function () {

        }


    });

    App.View.Loading = Loading;
})(window.App);
