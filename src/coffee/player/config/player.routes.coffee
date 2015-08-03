'use strict'

angular.module 'com.module.player'

.config ($stateProvider) ->

  $stateProvider

    .state 'app.player',
      url: '/player'
      templateUrl: 'player/views/view.html'
      controller: 'PlayerCtrl as vm'
