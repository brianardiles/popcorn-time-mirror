(function (App) {
    'use strict';

    var that,
        util = require('util'),
        Q = require('q');


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

            var wjs = require("wcjs-player");
            var player = new wjs("#player").addPlayer({
                autoplay: true
            });

            player.addPlaylist(App.Streamer.src);
        },


        closePlayer: function (next) {


        },

        onDestroy: function () {

        }
    });
    App.View.Player = Player;
})(window.App);
