(function (App) {
    'use strict';

    var torrentHealth = require('torrent-health');

    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        tagName: 'section',

        className: 'show-detail',

        ui: {

        },


        events: {
            'click .back': 'closeDetails'
        },


        keyboardEvents: {

        },

        initialize: function () {

        },

        onShow: function () {
            this.playerQualityChooseUI();
            this.seasonsUI();
            this.getSeasonImages();
        },


        playerQualityChooseUI: function () {
            //change option of player, with dropdown
            $('#player-option p').on('click', function (e) {
                $('#player-option ul').addClass('visable');
            });

            $('#player-option ul li').on('click', function (e) {
                $('#player-option ul').removeClass('visable');
                $('#player-option #current-player-name').text($(this).children('p').text());
                $('#player-option #current-player-icon').removeClass().addClass($(this).children('i').attr('class'));
            });
            $('.quality-toggle p').on('click', function (e) {
                e.preventDefault();
                $('.quality-toggle p').removeClass('active');
                $(this).addClass('active');
            });
        },

        getSeasonImages: function () {

            App.Trakt.seasons.summary(this.model.get('imdb_id'))
                .then(function (seasonsinfo) {
                    if (!seasonsinfo) {
                        win.warn('Unable to fetch data from Trakt.tv');
                    } else {
                        seasonsinfo.forEach(function (entry) {
                            console.log(entry);
                            $('#seasonTab-' + entry.number + 1).attr('data-poster', entry.images.poster.full);
                        });
                    }
                }).catch(function (err) {
                    console.log(err);
                });
        },
        seasonsUI: function () {

            //change season
            $('.seasons-container li').on('click', function (e) {
                e.preventDefault();
                $('.seasons-container li').removeClass('active');
                $(this).addClass('active');
                var seasonId = $(this).data('id');
                var posterURL = $(this).data('poster');
                $('.poster').attr("src", posterURL);
                $('.episode-list-show').removeClass('episode-list-show');
                $('#season-' + seasonId).addClass('episode-list-show').find("li.active").click();

            });

            //change active episode on list
            $('.episode-container ul li').on('click', function (e) {
                $('.episode-container ul li').removeClass('active');
                $(this).addClass('active');

            });


            //owl.owlCarousel
            var owl = $(".seasons-container");
            owl.owlCarousel({
                pagination: false, //boolean   Show pagination.
                responsive: false,
                autoWidth: true
            });

            function recalcCarouselWidth(carousel) {
                var stage = carousel.find('.owl-stage');
                stage.width(Math.ceil(stage.width()) + 1);
            }

            $(window).on('resize', function (e) {
                recalcCarouselWidth($('.owl-carousel'));
            }).resize();

            $('.seasons-container').on('refreshed.owl.carousel', function (event) {
                recalcCarouselWidth($('.owl-carousel'));
            });


            // Custom Navigation Events
            $(".season-next").click(function (e) {
                e.preventDefault();
                owl.trigger('next.owl.carousel');
            });
            $(".season-prev").click(function (e) {
                e.preventDefault();
                owl.trigger('prev.owl.carousel');
            });
            // possibility of scroll with the scroll wheel
            owl.on('mousewheel', '.owl-stage', function (e) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    owl.trigger('next.owl');
                } else {
                    owl.trigger('prev.owl');
                }
            });

            var seasons_container_width = $('.seasons-wrapper').width();
            var seasons_items_width = $('.seasons-wrapper ul li').width() * $('.seasons-wrapper ul li').length;
            console.log(seasons_container_width, seasons_items_width);
            if (seasons_container_width > seasons_items_width) {
                $(".season-prev").hide();
                $(".season-next").hide();
            } else {
                $(".season-prev").show();
                $(".season-next").show();
            }
            $(window).resize(function () {
                var seasons_container_width = $('.seasons-wrapper').width();
                var seasons_items_width = $('.seasons-wrapper ul li').width() * $('.seasons-wrapper ul li').length;
                if (seasons_container_width > seasons_items_width) {
                    $(".season-prev").hide();
                    $(".season-next").hide();
                } else {
                    $(".season-prev").show();
                    $(".season-next").show();
                }
            });
        },

        closeDetails: function (e) {
            App.vent.trigger('show:closeDetail');
        }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
