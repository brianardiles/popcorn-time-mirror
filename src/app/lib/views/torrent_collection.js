(function (App) {
    'use strict';

    var clipboard = gui.Clipboard.get(),
        readTorrent = require('read-torrent'),
        collection = path.join(require('nw.gui').App.dataPath + '/TorrentCollection/'),
        files;

    var strike = require('strike-api');
    var kat = require('kat-api');
    var TorrentCollection = Backbone.Marionette.ItemView.extend({
        template: '#torrent-collection-tpl',
        className: 'torrent-collection',

        events: {
            'click .file-item': 'openFileSelector',
            'click .result-item': 'onlineOpen',
            'click .item-delete': 'deleteItem',
            'click .item-rename': 'renameItem',
            'click .collection-delete': 'clearCollection',
            'click .collection-open': 'openCollection',
            'click .collection-import': 'importItem',
            'click .notorrents-frame': 'importItem',
            'click .online-search': 'onlineSearch',
            'click .engine-icon': 'changeEngine',
            'submit #online-form': 'onlineSearch',
            'click .online-back': 'onlineClose',
            'contextmenu #online-input': 'rightclick_search'
        },

        initialize: function () {
            if (!fs.existsSync(collection)) {
                fs.mkdirSync(collection);
                win.debug('TorrentCollection: data directory created');
            }
            this.files = fs.readdirSync(collection);
            this.searchEngine = Settings.onlineSearchEngine;
        },

        onShow: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                $('#filterbar-torrent-collection').click();
            });

            $('#movie-detail').hide();
            $('#nav-filters').hide();

            this.render();
        },

        onRender: function () {
            $('#online-input').focus();
            if (this.files[0]) {
                $('.notorrents-info').css('display', 'none');
                $('.collection-actions').css('display', 'block');
                $('.torrents-info').css('display', 'block');
            }

            this.$('.tooltipped').tooltip({
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });
        },

        onlineSearch: function (e) {
            if (e) {
                e.preventDefault();
            }
            var that = this;
            var input = $('#online-input').val();
            var category = $('.online-categories > select').val();
            AdvSettings.set('OnlineSearchCategory', category);
            if (category === 'TV Series') {
                category = 'TV';
            }
            var current = $('.onlinesearch-info > ul.file-list').html();

            if (input === '' && current === '') {
                return;
            } else if (input === '' && current !== '') {
                this.onlineClose();
                return;
            }

            $('.onlinesearch-info>ul.file-list').html('');
            $('.online-search').removeClass('fa-search').addClass('fa-spin fa-spinner');
            Q.all([
                this.strikeSearch(input, category),
                this.katsearch(input, category)
            ]).spread(function (strike, kat) {
                var defer = Q.defer();

                var strikes = function (strike) {
                    var items = [];
                    _.each(strike, function (item) {
                        var itemModel = {
                            title: item.torrent_title,
                            magnet: item.magnet_uri,
                            seeds: item.seeds,
                            peers: item.leeches,
                            size: require('pretty-bytes')(parseInt(item.size))
                        };
                        items.push(itemModel);
                    });
                    return Q(items);
                };
                var kats = function (kat) {
                    var items = [];
                    _.each(kat, function (item) {
                        var itemModel = {
                            title: item.title,
                            magnet: item.magnet,
                            seeds: item.seeds,
                            peers: item.peers,
                            size: require('pretty-bytes')(parseInt(item.size))
                        };
                        items.push(itemModel);
                    });
                    return Q(items);
                };

                Q.all([strikes(strike), kats(kat)]).spread(function (s, k) {
                    defer.resolve(s.concat(k));
                });

                return defer.promise;
            }).then(function (items) {
                console.log(items);
                items.forEach(function (item) {
                    that.onlineAddItem(item);
                });
                $('.notorrents-info,.torrents-info').hide();
                $('.online-search').removeClass('fa-spin fa-spinner').addClass('fa-search');
                $('.onlinesearch-info').show();
                that.$('.tooltipped').tooltip({
                    html: true,
                    delay: {
                        'show': 50,
                        'hide': 50
                    }
                });
            });

        },

        strikeSearch: function (input, category) {
            var defer = Q.defer();
            strike.search(input, category).then(function (result) {
                win.debug('Strike search: %s results', result.results);
                defer.resolve(result.torrents);
            }).catch(function (err) {
                win.debug('Strike search Error', err);
                defer.resolve({});
            });
            return defer.promise;
        },
        katsearch: function (input, category) {
            var defer = Q.defer();
            kat.search({
                query: input,
                min_seeds: 10,
                category: category
            }).then(function (data) {
                win.debug('KAT search: %s results', data.results.length);
                defer.resolve(data.results);
            }).catch(function (err) {
                win.debug('KAT search Error', err);
                defer.resolve({});
            });
            return defer.promise;
        },


        onlineAddItem: function (item) {

            var h = Common.calcHealth({
                seed: item.seeds,
                peer: item.peers
            });
            var health = Common.healthMap[h].capitalize();
            var ratio = item.peers > 0 ? item.seeds / item.peers : +item.seeds;
            $('.onlinesearch-info>ul.file-list').append(
                '<li class="result-item" data-file="' + item.magnet + '"><a>' + item.title + '</a><div class="item-icon magnet-icon"></div><div data-toggle="tooltip" data-placement="left" title="" class="fa fa-circle health-icon ' + health + '"></div><i class="online-size tooltipped" data-toggle="tooltip" data-placement="left" title="' + i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + '<br>' + i18n.__('Seeds:') + ' ' + item.seeds + ' - ' + i18n.__('Peers:') + ' ' + item.peers + '">' + item.size + '</i></li>'
            );
        },

        onlineOpen: function (e) {
            var that = this;
            var file = $(e.currentTarget).context.dataset.file;

            readTorrent(file, function (err, torrent) {
                if (!err) {
                    var torrentMagnet = 'magnet:?xt=urn:btih:' + torrent.infoHash + '&dn=' + torrent.name.replace(/ +/g, '+').toLowerCase();
                    _.each(torrent.announce, function (value) {
                        var announce = '&tr=' + encodeURIComponent(value);
                        torrentMagnet += announce;
                    });
                    that.startStream(torrent, torrentMagnet);
                } else {
                    win.error(err.stack);
                }
            });

        },

        onlineClose: function () {
            $('.onlinesearch-info>ul.file-list').html('');
            $('.onlinesearch-info').hide();
            this.render();
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
                        $('#online-input').val(text);
                    }
                });

            menu.append(cut);
            menu.append(copy);
            menu.append(paste);

            return menu;
        },

        openFileSelector: function (e) {
            var that = this;
            var _file = $(e.currentTarget).context.innerText,
                file = _file.substring(0, _file.length - 2); // avoid ENOENT

            if (_file.indexOf('.torrent') !== -1) {


                readTorrent(file, function (err, torrent) {
                    if (!err) {
                        var torrentMagnet = 'magnet:?xt=urn:btih:' + torrent.infoHash + '&dn=' + torrent.name.replace(/ +/g, '+').toLowerCase();
                        _.each(torrent.announce, function (value) {
                            var announce = '&tr=' + encodeURIComponent(value);
                            torrentMagnet += announce;
                        });
                        that.startStream(torrent, torrentMagnet);
                    } else {
                        win.error(err.stack);
                    }
                });


            } else { // assume magnet
                var content = fs.readFileSync(collection + file, 'utf8');

                readTorrent(content, function (err, torrent) {
                    if (!err) {
                        var torrentMagnet = 'magnet:?xt=urn:btih:' + torrent.infoHash + '&dn=' + torrent.name.replace(/ +/g, '+').toLowerCase();
                        _.each(torrent.announce, function (value) {
                            var announce = '&tr=' + encodeURIComponent(value);
                            torrentMagnet += announce;
                        });
                        that.startStream(torrent, torrentMagnet);
                    } else {
                        win.error(err.stack);
                    }
                });


            }
        },
        startStream: function (torrent, torrentsrc) {

            var torrentStart = {
                torrent: torrentsrc,
                type: 'dropped-content',
                dropped: true,
                metadata: {
                    title: torrent.name,
                },
                device: App.Device.Collection.selected
            };
            App.Streamer.start(torrentStart);

        },
        deleteItem: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();

            var _file = $(e.currentTarget.parentNode).context.innerText,
                file = _file.substring(0, _file.length - 2); // avoid ENOENT

            fs.unlinkSync(collection + file);
            win.debug('Torrent Collection: deleted', file);

            // update collection
            this.files = fs.readdirSync(collection);
            this.render();
        },

        renameItem: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();

            var _file = $(e.currentTarget.parentNode).context.innerText,
                file = _file.substring(0, _file.length - 2), // avoid ENOENT
                isTorrent = false;

            if (file.endsWith('.torrent')) {
                isTorrent = 'torrent';
            }

            var newName = this.renameInput(file);
            if (!newName) {
                return;
            }

            if (isTorrent) { //torrent
                if (!newName.endsWith('.torrent')) {
                    newName += '.torrent';
                }
            } else { //magnet
                if (newName.endsWith('.torrent')) {
                    newName = newName.replace('.torrent', '');
                }
            }

            if (!fs.existsSync(collection + newName) && newName) {
                fs.renameSync(collection + file, collection + newName);
                win.debug('Torrent Collection: renamed', file, 'to', newName);
            } else {
                $('.notification_alert').show().text(i18n.__('This name is already taken')).delay(2500).fadeOut(400);
            }

            // update collection
            this.files = fs.readdirSync(collection);
            this.render();
        },

        renameInput: function (oldName) {
            var userInput = prompt(i18n.__('Enter new name'), oldName);
            if (!userInput || userInput === oldName) {
                return false;
            } else {
                return userInput;
            }
        },

        clearCollection: function () {
            deleteFolder(collection);
            win.debug('Torrent Collection: delete all', collection);
            App.vent.trigger('torrentCollection:show');
        },

        openCollection: function () {
            win.debug('Opening: ' + collection);
            gui.Shell.openItem(collection);
        },

        importItem: function () {
            this.$('.tooltip').css('display', 'none');

            var that = this;
            var input = document.querySelector('.collection-import-hidden');
            input.addEventListener('change', function (evt) {
                var file = $('.collection-import-hidden')[0].files[0];
                that.render();
                window.ondrop({
                    dataTransfer: {
                        files: [file]
                    },
                    preventDefault: function () {}
                });
            }, false);

            input.click();
        },

        onDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
            $('#movie-detail').show();
            $('#nav-filters').show();
        },

        closeTorrentCollection: function () {
            App.vent.trigger('torrentCollection:close');
        }

    });

    App.View.TorrentCollection = TorrentCollection;
})(window.App);
