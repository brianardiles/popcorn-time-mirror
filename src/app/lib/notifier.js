(function (App) {
    'use strict';

    var Notifier = Backbone.Model.extend({
        check: function () {
            var that = this;
            var timing = 10000;
            this.fetch().then(function (n) {
                _.each(n, function (c, i) {
                    if (!_.contains(Settings.seenNotifications, i)) {
                        _.delay(that.notify, timing, c.title, c.content, c.link);
                        timing = timing + 10000;
                        Settings.seenNotifications.push(i);
                    }
                });
            });
        },
        fetch: function () {
            var defer = Q.defer();
            request('http://update.popcorntime.io/notifications/desktop', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    defer.resolve(JSON.parse(body));
                } else {
                    defer.resolve({});
                }
            });
            return defer.promise;
        },
        notify: function (title, content, link) {
            console.log(title, content, link)
            var options = {
                body: content.toString()
            };
            var notification = new Notification(title.toString(), options);
            notification.onclick = function () {
                if (link) {
                    gui.Shell.openExternal(link.toString());
                }
            }
        }

    });

    App.Notifier = new Notifier();
})(window.App);