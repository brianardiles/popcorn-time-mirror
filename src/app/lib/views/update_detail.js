(function (App) {
    'use strict';
    var fixer;
    var updaterModal = Backbone.Marionette.ItemView.extend({
        template: '#updater-detail-tpl',
        className: 'updater-detail-container',
        ui: {
            status: '#updateStatus',
            updateinfo: '#update-info',
            progressbarprogress: '#update-contents',
            updateProgressContainer: '#update-progress-contain',
            updateProgressStatus: '#update-progress-status'
        },

        events: {
            'click .close-icon': 'closeUpdater',
            'click #startUpdate': 'startupdate',
            'click #dismissUpdate': 'dismissUpdate'
        },

        initialize: function () {},

        onShow: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                $('#filterbar-update').click();
            });
        },

        startupdate: function () {
            App.Updaterv2.downloadUpdate();
            this.ui.updateinfo.hide();
            this.ui.updateProgressContainer.show();
            this.updating = true;
            this.StateUpdate();
            this.ui.updateProgressStatus.text(0 + '%' + ' (' + Common.fileSize(0) + '/' + Common.fileSize(0) + ')');
        },

        StateUpdate: function () {
            if (!this.updating) {
                return;
            }
            var that = this;
            var updateInfo = App.Updaterv2.information.download;
            this.ui.status.text(updateInfo.status + ' Update...');
            if (updateInfo.status === 'Downloading') {
                this.ui.updateProgressStatus.text(updateInfo.percentDone + '%' + ' (' + Common.fileSize(updateInfo.downloaded) + '/' + Common.fileSize(updateInfo.totalSize) + ')');
                this.ui.progressbarprogress.animate({
                    width: updateInfo.percentDone + '%'
                }, 100, 'swing');
                _.delay(_.bind(this.StateUpdate, this), 100);
            } else if (updateInfo.status === 'Installing') {
                this.ui.updateProgressStatus.text('');
                this.ui.progressbarprogress.hide();
                _.delay(_.bind(this.StateUpdate, this), 100);
            } else if (updateInfo.status === 'Done') {
                win.debug('Update completed');
            } else {
                _.delay(_.bind(this.StateUpdate, this), 500);
            }

        },

        dismissUpdate: function () {
            App.vent.trigger('updater:close');
        },
        onDestroy: function () {
            this.updating = false;
            Mousetrap.unbind(['esc', 'backspace']);
        },
        closeUpdater: function () {
            App.vent.trigger('updater:close');
        }

    });

    App.View.updaterModal = updaterModal;
})(window.App);
