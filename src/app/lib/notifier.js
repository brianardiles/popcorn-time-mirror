(function (App) {
    'use strict';
    var Q = require('q');
    var Notifier = Backbone.Model.extend({
        initialize: function () {
            App.vent.on('notification', _.bind(this.notify, this)); //we can notify now via app trigger! ||  App.vent.trigger('notification', 'title', 'content', 'linkurl', 'iconurl', 'customiconurl');
            var notification = new Notification('', {
                body: ''
            });
            notification.onshow = function () {
                notification.close(); //we are initing the notifications so we close as soon as open
            };
        },
        check: function (devtest) {
            win.info('Checking for new notifications');
            var that = this;
            var nid = 0;
            this.notifications = {};
            this.fetch().then(function (n) {
                _.each(n, function (c, i) {
                    if (_.contains(c.targets, App.git.commit) || _.contains(c.targets, 'all')) {
                        if (!_.contains(Settings.seenNotifications, i)) {
                            that.notifications[nid] = {
                                title: c.title,
                                content: c.content,
                                link: c.link,
                                icon: c.icon,
                                id: nid
                            };
                            nid++;
                            Settings.seenNotifications.push(i);
                        }
                    } else if (devtest) {
                        that.notifications[nid] = {
                            title: c.title,
                            content: c.content,
                            link: c.link,
                            icon: c.icon,
                            id: nid
                        };
                        nid++;
                    }
                });
                var notify = that.notifications[0];
                that.notify(notify.title, notify.content, notify.link, notify.icon, 0);
                if (!devtest) { //not setting these as seen again becouse we are doing a dev test
                    AdvSettings.set('seenNotifications', Settings.seenNotifications);
                }
            });
        },
        fetch: function () {
            var defer = Q.defer();
            var url = 'http://update.popcorntime.io/notifications/desktop/' + App.installDate + '/' + App.clientID.getID();
            request(url, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    defer.resolve(JSON.parse(body));
                } else {
                    defer.resolve({});
                }
            });
            return defer.promise;
        },
        notify: function (title, content, link, icon, id) {
            if (!title || !content) {
                return;
            }
            var that = this;
            var notification = new Notification(title, {
                icon: icon,
                body: content
            });
            notification.onclick = function () {
                if (link) {
                    if (link === 'update') { //this a update notification
                        if (App.currentview !== 'Updater') {
                            $('#filterbar-update').click();
                        }
                    } else {
                        try {
                            gui.Shell.openExternal(link);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
            };
            notification.onerror = function (e) {
                console.log(e);
            };
            notification.onshow = function () {
                win.info('Showing Notification:', title);
            };
            notification.onclose = function () {
                if (id) {
                    var nid = id + 1;
                    if (that.notifications[nid]) { //if there is a new notification show it
                        var notify = that.notifications[nid];
                        that.notify(notify.title, notify.content, notify.link, nid);
                    }
                }
            };
        }

    });

    App.Notifier = new Notifier();
})(window.App);
