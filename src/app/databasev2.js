// Global App skeleton for backbone
var App = new Backbone.Marionette.Application();
App.startupTime = window.performance.now();
(function (App) {
    'use strict';
    var Q = require('q');

    var Database = Backbone.Model.extend({
        initialize: function () {

        },
        setting: function (action, data) {
            var toreturn;
            switch (action) {
            case 'get':
                toreturn = JSON.parse(localStorage.getItem('setting-' + data.key));
                break;
            case 'set':
                localStorage.setItem('setting-' + data.key, JSON.stringify(data.value));
                toreturn = true;
                break;
            case 'remove':
                localStorage.removeItem('setting-' + data.key);
                toreturn = true;
                break;
            }
            return Q(toreturn);
        },
        delete: function (db) {


            for (var s in localStorage) {
                if (s.includes('setting')) {
                    localStorage.removeItem(s);
                }
            }


            return Q(true);
        }

    });

    App.Database = new Database();
})(window.App);
