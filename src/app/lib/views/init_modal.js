(function (App) {
    'use strict';
    var fixer;
    var InitModal = Backbone.Marionette.ItemView.extend({
        template: '#initializing-tpl',
        className: 'init-container',
        ui: {
            waitingblock: '#waiting-block'
        },

        events: {

        },

        initialize: function () {
            win.info('Loading Database & checking API fingerprints');
        },

        onShow: function () {
            var self = this;
        },

        onDestroy: function () {

        },

        fixApp: function (e) {


        },

    });

    App.View.InitModal = InitModal;
})(window.App);