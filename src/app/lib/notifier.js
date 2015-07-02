(function (App) {
    'use strict';

    var Notifier = Backbone.Model.extend({

        initialize: function () {
            this.notificationUrl = 'popcorntime.io/notifications/desktop';
        },
        check: function () {
            request
                .get(this.notificationUrl)
                .on('response', function (response) {

                }).on('error', function (err) {
                    console.log(err)
                });
        },
        notify: function () {
            var options = {
                icon: 'file://images/icon.png',
                body: "YTS (Movies) is currently unavailable for Popcorn Time release 0.3.7-2, but is still working for the experimental builds. We're looking into what the issue could be and why it's only affecting release 0.3.7-2"
            };

            var notification = new Notification('PCT broadcast: YTS issues for Release 0.3.7-2', options);
            notification.onclick = function () {
                console.log('Notification clicked');
            }
            /*
            notification.onshow = function () {
                // play sound on show
                myAud = document.getElementById("audio1");
                myAud.play();

                // auto close after 1 second
                setTimeout(function () {
                    notification.close();
                }, 1000);
            }*/
        }

    });

    App.Notifier = new Notifier();
})(window.App);