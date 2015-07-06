(function (App) {
    'use strict';
    var fixer;
    var updaterModal = Backbone.Marionette.ItemView.extend({
        template: '#updater-detail-tpl',
        className: 'updater-detail-container',
        ui: {
            status: '#updateStatus',
            updateinfo: '#update-info'
        },

        events: {
            'click .close-icon': 'closeUpdater',
            'click #startUpdate': 'startupdate',
            'click #dismissUpdate': 'dismissUpdate'
        },

        initialize: function () {

        },

        onShow: function () {
            console.log(this.model);

            Mousetrap.bind(['esc', 'backspace'], function (e) {
                $('#filterbar-update').click();
            });
        },

        startupdate: function () {
            this.ui.status.text('Downloading Update...');
            this.ui.updateinfo.hide();
        },
        dismissUpdate: function () {
            App.vent.trigger('updater:close');
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
