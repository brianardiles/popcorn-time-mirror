(function (App) {
    'use strict';
    var Q = require('q');
    var crypto = require('crypto'),
        algorithm = 'aes-256-ctr';

    var clientID = Backbone.Model.extend({
        initialize: function () {
            var that = this;
            this.getMac().then(function (mac) {
                that.mac = mac;
            });
        },

        getID: function () {
            return this.encrypt(Settings.UUID);
        },
        checkID: function (id) {
            if (this.getID() === this.decrypt(id)) {
                return true;
            } else {
                return false;
            }
        },

        encrypt: function (text) {
            var cipher = crypto.createCipher(algorithm, this.mac);
            var crypted = cipher.update(text, 'utf8', 'hex');
            crypted += cipher.final('hex');
            return crypted;
        },
        decrypt: function (text) {
            var decipher = crypto.createDecipher(algorithm, this.mac);
            var dec = decipher.update(text, 'hex', 'utf8');
            dec += decipher.final('utf8');
            return dec;
        },

        getMac: function () {
            var defer = Q.defer();
            require('getmac').getMac(function (err, macAddress) {
                if (err) {
                    throw err;
                }
                defer.resolve(macAddress);
            });
            return defer.promise;
        }
    });

    App.clientID = new clientID();
})(window.App);
