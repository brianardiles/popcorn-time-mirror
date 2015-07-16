(function (App) {
    'use strict';

    var Settings = Backbone.Marionette.ItemView.extend({
        template: '#settings-container-tpl',
        className: 'settings-view',
        tagName: 'section',

        ui: {
          
        },

        events: {
         
        },

        onShow: function () {
          
        },

        onDestroy: function () {

        }

    });

    App.View.Settings = Settings;
})(window.App);
