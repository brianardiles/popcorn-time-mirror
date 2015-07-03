(function (App) {
    'use strict';

    var Notifier = Backbone.Model.extend({
        initialize: function () {
            App.vent.on('notifications', _.bind(this.check, this));
            var notification = new Notification('initingnotifications', {
                body: 'init'
            });
            notification.onshow = function () {
                notification.close(); //we are initing the notifications so we close as soon as open
            }
        },
        check: function () {
            var that = this;
            var nid = 0;
            this.notifications = {};
            this.fetch().then(function (n) {
                _.each(n, function (c, i) {
                    if (!_.contains(Settings.seenNotifications, i)) {
                        that.notifications[nid] = {
                            title: c.title,
                            content: c.content,
                            link: c.link,
                            id: nid
                        };
                        nid++;
                        Settings.seenNotifications.push(i);
                    }
                });
                that.notify(that.notifications[0]);
                AdvSettings.set('seenNotifications', Settings.seenNotifications);
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
        notify: function (notification) {
            if (!notification) {
                return;
            }
            var that = this;
            var content = notification.content;
            var title = notification.title;
            var id = notification.id;
            var link = notification.link;
            var options = {
                body: content
            };
            var notification = new Notification(title, options);
            notification.onclick = function () {
                if (link) {
                    try {
                        gui.Shell.openExternal(link);
                    } catch (err) {
                        console.log(err)
                    }

                }
            }
            notification.onerror = function (e) {
                console.log(e);
            }
            notification.onshow = function () {
                console.log('Showing Notification:', title);
            }
            notification.onclose = function () {
                var nid = id + 1;
                if (that.notifications[nid]) { //if there is a new notification show it
                    that.notify(that.notifications[nid]);
                }
            }
        }

    });

    App.Notifier = new Notifier();
})(window.App);