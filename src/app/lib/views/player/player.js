(function (App) {
    'use strict';

    var that,
        util = require('util'),
        Q = require('q');
    var wjs = require('wcjs-player');


    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',

        ui: {

        },

        events: {

        },

        initialize: function () {

        },


        onShow: function () {

            this.player = new wjs("#player").addPlayer({
                autoplay: true
            });

            this.player.addPlaylist(App.Streamer.src);
        },


        closePlayer: function (next) {
            this.player.close();

        },

        onDestroy: function () {

        }
    });
    App.View.Player = Player;
})(window.App);
