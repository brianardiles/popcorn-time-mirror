(function (App) {
    'use strict';
    var clipboard = gui.Clipboard.get();

    App.View.FilterBar = Backbone.Marionette.ItemView.extend({

        attributes: {
            class: 'bottom filter-bar'
        },

        ui: {
            typeValue: '.types .value',
            genreValue: '.genres  .value'
        },
        events: {
            'change #filter-sorter': 'sortBy',
            'change #filter-genre': 'changeGenre',
            'change #filter-type': 'changeType',
            'change #filterbar-search': 'search'

        },

        initialize: function () {


        },

        setactive: function (set) {
            $('.sorters .dropdown-menu a:nth(0)').addClass('active');
            $('.genres .dropdown-menu a:nth(0)').addClass('active');
            $('.types .dropdown-menu a:nth(0)').addClass('active');
        },
        rightclick_search: function (e) {
            e.stopPropagation();
            var search_menu = new this.context_Menu(i18n.__('Cut'), i18n.__('Copy'), i18n.__('Paste'));
            search_menu.popup(e.originalEvent.x, e.originalEvent.y);
        },

        context_Menu: function (cutLabel, copyLabel, pasteLabel) {
            var gui = require('nw.gui'),
                menu = new gui.Menu(),

                cut = new gui.MenuItem({
                    label: cutLabel || 'Cut',
                    click: function () {
                        document.execCommand('cut');
                    }
                }),

                copy = new gui.MenuItem({
                    label: copyLabel || 'Copy',
                    click: function () {
                        document.execCommand('copy');
                    }
                }),

                paste = new gui.MenuItem({
                    label: pasteLabel || 'Paste',
                    click: function () {
                        var text = clipboard.get('text');
                        $('#searchbox').val(text);
                    }
                });

            menu.append(cut);
            menu.append(copy);
            menu.append(paste);

            return menu;
        },
        onShow: function () {
            this.$('.tooltipped').tooltip({
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });
            this.$('.providerinfo').tooltip({
                delay: {
                    'show': 50,
                    'hide': 50
                }
            });
        },

        search: function (e) {
            e.preventDefault();

            var that = this;
            clearTimeout(search);
            var search;
            search = setTimeout(function () {
                App.vent.trigger('about:close');
                App.vent.trigger('torrentCollection:close');
                var searchvalue = $(e.target).val();
                that.model.set({
                    keywords: searchvalue,
                    genre: ''
                });
            }, 500);
        },


        sortBy: function (e) {
            App.vent.trigger('about:close');
            App.vent.trigger('torrentCollection:close');

            var sorter = $(e.target).val();

            if (this.previousSort === sorter) {
                this.model.set('order', this.model.get('order') * -1);
            } else if (this.previousSort !== sorter && sorter === 'title') {
                this.model.set('order', this.model.get('order') * -1);
            } else {
                this.model.set('order', -1);
            }

            this.model.set({
                keyword: '',
                sorter: sorter
            });
            this.previousSort = sorter;
        },

        changeType: function (e) {
            App.vent.trigger('about:close');
            App.vent.trigger('torrentCollection:close');

            var type = $(e.target).val();

            this.model.set({
                keyword: '',
                type: type
            });
        },

        changeGenre: function (e) {
            App.vent.trigger('about:close');

            var genres = $(e.target).val().split(',');

            console.log('GEnre', genres);;

            this.model.set({
                keyword: '',
                genres: genres
            });
        }
    });

    App.View.FilterBar = App.View.FilterBar.extend({
        template: '#filter-bar-tpl'
    });

})(window.App);
