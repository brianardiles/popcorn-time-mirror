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
                this.player.addPlaylist({
                    url: App.Streamer.src,
                    vlcArgs: [],
                    subtitles: {
                        "Hungarian": "http://my.subtitle.server/hungarian.srt",
                        "Polish": "http://my.subtitle.server/polish.sub"
                    }
                });
            }

        },

        setUI: function () {
            this.ui.title.text(this.model.attributes.metadata.title);
        },

        closePlayer: function (next) {
            this.player.stop();
            App.vent.trigger('streamer:stop');
            App.vent.trigger('preloadStreamer:stop');
            App.vent.trigger('player:close');
        },

        onDestroy: function () {

        }
    });
    App.View.Player = Player;
})(window.App);
