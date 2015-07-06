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
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                $('#filterbar-update').click();
            });
        },

        onShow: function () {

        },
        onClose: function () {

        },
        onDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
        },
        closeUpdater: function () {
            App.vent.trigger('updater:close');
        }

    });

    App.View.updaterModal = updaterModal;
})(window.App);
