(function (App) {
    'use strict';

    /**
     * Manage browsing:
     *  * Create filter views
     *  * Create movie list
     *  * Fetch new movie collection and pass them to the movie list view
     *  * Show movie detail
     *  * Start playing a movie
     */
    var PCTBrowser = Backbone.Marionette.LayoutView.extend({
        template: '#browser-tpl',

        //tagName: 'core-scroll-header-panel',
        id: 'main-list-content',


        regions: {
            FilterBar: '#filterbar-toolbar',
            ItemList: '.content'
        },
        events: {
            'click .retry-button': 'onFilterChange',
            'click .online-search': 'onlineSearch'
        },

        initialize: function () {
            console.log(this.filters);
            this.filter = new App.Model.Filter(this.filters);

            this.collection = new this.collectionModel([], {
                filter: this.filter
            });

            this.collection.fetch();

            this.listenTo(this.filter, 'change', this.onFilterChange);

            this.scrollActions = [];
        },

        onClose: function () {
            App.vent.trigger('nav:hide');
        },

        onShow: function () {
            this.bar = new App.View.FilterBar({
                model: this.filter
            });

            this.FilterBar.show(this.bar);

            this.ItemList.show(new App.View.List({
                collection: this.collection
            }));


            if (Settings.bigPicture) {
                var zoom = ScreenResolution.HD ? 2 : 3;
                win.zoomLevel = zoom;
            }
            App.vent.trigger('app:started');
            App.vent.trigger('nav:show');

            switch (App.currentview) {
            case 'movies':
                $('#section-title').text(i18n.__('Movies'));
                break;
            case 'shows':
                $('#section-title').text(i18n.__('TV Series'));
                break;
            case 'anime':
                $('#section-title').text(i18n.__('Anime'));
                break;
            }


            var positionTop = function () {
                    var padding = $('.item').eq(0).offset().left - $('#list-content').offset().left;
                    $('.top-tools').css('padding', '0px ' + padding + 'px');
                },
                filterTop = $('.filter-bar').offset().top,
                scrollFilters = function () {
                    if ($('#content').scrollTop() + 35 > filterTop && !$('.filter-bar').hasClass('fixed')) {
                        $('.filter-bar')
                            .addClass('fixed')
                            .css('padding-left', $('#section-title').offset().left - 100);
                    }

                    if ($('#content').scrollTop() + 35 < filterTop && $('.filter-bar').hasClass('fixed')) {
                        $('.filter-bar')
                            .removeClass('fixed')
                            .css('padding-left', 0);
                    }
                };

            this.scrollActions.push(scrollFilters);


            $('#content').scroll(_.bind(this.scrollHandler, this));

        },


        scrollHandler: function () {
            this.scrollActions.forEach(function (action) {
                action.apply();
            });
        },
        onFilterChange: function () {

            this.collection = new this.collectionModel([], {
                filter: this.filter
            });
            App.vent.trigger('show:closeDetail');
            this.collection.fetch();

            this.ItemList.show(new App.View.List({
                collection: this.collection
            }));
        },
        onlineSearch: function () {
            switch (App.currentview) {
            case 'movies':
                Settings.OnlineSearchCategory = 'Movies';
                break;
            case 'shows':
                Settings.OnlineSearchCategory = 'TV Series';
                break;
            case 'anime':
                Settings.OnlineSearchCategory = 'Anime';
                break;
            }
            $('#section-title').text(Settings.OnlineSearchCategory);

            if (!Settings.activateTorrentCollection) {
                AdvSettings.set('activateTorrentCollection', true);
                $('#torrent_col').css('display', 'block');
            }

            $('#filterbar-torrent-collection').click();
        },

        focusSearch: function (e) {
            this.bar.focusSearch();
        }
    });

    App.View.PCTBrowser = PCTBrowser;
})(window.App);
