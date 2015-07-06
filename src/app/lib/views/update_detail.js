(function (App) {
    'use strict';
    var fixer;
    var updaterModal = Backbone.Marionette.ItemView.extend({
        template: '#updater-detail-tpl',
        className: 'updater-detail-container',
        ui: {
            title: '#updateName',
            description: '#updateDescription',
            changelog: '#updateChangeLog'
        },

        events: {
            'click .close-icon': 'closeUpdater',
        },

        initialize: function () {

        },

        onShow: function () {
            this.ui.title.html(this.model.get('version') + '<span style="font-size: 13px;"> - ' + this.model.get('version_name') + '</span>');
            this.ui.description.text(this.model.get('description'));


            console.log(this.model);

            Mousetrap.bind(['esc', 'backspace'], function (e) {
                $('#filterbar-update').click();
            });
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
