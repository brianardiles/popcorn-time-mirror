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

            title: '.player-title',

        },

        events: {
            'click .close-player': 'closePlayer',
        },

        initialize: function () {

        },


        onShow: function () {
            this.initplayer(this.model.get('type'));
            this.setUI();
        },

        initplayer: function (type) {

            this.player = new wjs("#internal_player").addPlayer({
                autoplay: true
            });
            if (type === 'trailer') {
                this.player.addPlaylist(this.model.get('src'));
            } else {
                this.player.addPlaylist(App.Streamer.src);
            }

        },

        setUI: function () {
            this.ui.title.text(this.model.attributes.metadata.title);
        },

        closePlayer: function (next) {
            App.vent.trigger('streamer:stop');
            App.vent.trigger('preloadStreamer:stop');
            App.vent.trigger('player:close');
        },

        onDestroy: function () {
            this.player.close();
        }
    });
    App.View.Player = Player;
})(window.App);
