(function (App) {
    'use strict';

    var Settings = Backbone.Marionette.ItemView.extend({
        template: '#settings-container-tpl',
        className: 'settings-view',
        tagName: 'section',

        ui: {
          
        },

        events: {
            'click .back': 'closeSettings'
        },

        onShow: function () {
          
        },

        closeSettings: function () {
            App.vent.trigger('settings:close');
        },

        onDestroy: function () {

        }

    });

    App.View.Settings = Settings;
})(window.App);
