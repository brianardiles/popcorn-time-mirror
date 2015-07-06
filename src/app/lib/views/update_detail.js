(function (App) {
    'use strict';
    var fixer;
    var updaterModal = Backbone.Marionette.ItemView.extend({
        template: '#updater-detail-tpl',
        className: 'updater-detail-container',
        ui: {

        },

        events: {
            'click .close-icon': 'closeUpdater',
        },

        initialize: function () {

        },

        onShow: function () {

        },
        onClose: function () {

        },

        closeUpdater: function () {
            App.vent.trigger('updater:close');
        }

    });

    App.View.updaterModal = updaterModal;
})(window.App);
