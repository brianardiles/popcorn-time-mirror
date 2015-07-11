(function (App) {
    'use strict';

    var torrentHealth = require('torrent-health');

    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        tagName: 'section',
        className: 'show-detail',

        ui: {

        },


        events: {

        },


        keyboardEvents: {

        },

        initialize: function () {

        },


        onShow: function () {


        },


        closeDetails: function (e) {
            App.vent.trigger('show:closeDetail');
        }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
