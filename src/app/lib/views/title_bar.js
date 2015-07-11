var os = require('os');

(function (App) {
    'use strict';

    // use of darwin string instead of mac (mac os x returns darwin as platform)
    var ButtonOrder = {
        'win32': ['min', 'max', 'close'],
        'darwin': ['close', 'min', 'max'],
        'linux': ['min', 'max', 'close']
    };

    var TitleBar = Backbone.Marionette.ItemView.extend({
        template: '#header-tpl',
        events: {
            'click .max': 'maximize',
            'click .min': 'minimize',
            'click .close': 'closeWindow',
            'click .btn-os.fullscreen': 'toggleFullscreen'
        },

        initialize: function () {
            this.nativeWindow = require('nw.gui').Window.get();
        },

        templateHelpers: {
            getButtons: function () {
                return ButtonOrder[App.Config.platform];
            },

            fsTooltipPos: function () {
                return App.Config.platform === 'darwin' ? 'left' : 'right';
            }


        },

        maximize: function () {
            if (this.nativeWindow.isFullscreen) {
                this.nativeWindow.toggleFullscreen();
            } else {
                if (window.screen.availHeight <= this.nativeWindow.height) {
                    this.nativeWindow.unmaximize();
                    if (process.platform === 'win32') {
                        $('.os-max').removeClass('os-is-max');
                    }
                } else {
                    this.nativeWindow.maximize();
                    if (process.platform === 'win32') {
                        $('.os-max').addClass('os-is-max');
                    }
                }
            }
        },

        minimize: function () {
            var that = this.nativeWindow;
            if (AdvSettings.get('minimizeToTray')) {
                minimizeToTray();
            } else {
                that.minimize();
            }
        },

        closeWindow: function () {
            this.nativeWindow.close();
        },

        toggleFullscreen: function () {
            win.toggleFullscreen();
        },

        onShow: function () {

        }

    });

    App.View.TitleBar = TitleBar;
})(window.App);
