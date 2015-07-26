(function (App) {
    'use strict';

    var dummyDetail = Backbone.Marionette.ItemView.extend({
        template: '#dummy-detail-tpl',
        tagName: 'section',
        className: 'movie-detail',


        events: {
            'click .back': 'closeDetails',
        },


        keyboardEvents: {
            'esc': 'closeDetails',
            'backspace': 'closeDetails',
            'alt+left': 'closeDetails'
        },

        initialize: function () {

        },
        onRender: function () {

        },

        onShow: function () {

        },

        onDestroy: function () {
            console.log('dummuy detail closed')
        },

        closeDetails: function (e) {
            App.vent.trigger('dummy:closeDetail');
        }

    });

    App.View.DummyDetail = dummyDetail;
})(window.App);
