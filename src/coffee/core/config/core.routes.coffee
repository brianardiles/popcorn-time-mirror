'use strict'

angular.module 'com.module.core'

.config ($stateProvider, $urlRouterProvider) ->

  $stateProvider

    .state 'router',
      url: '/router'
      template: '<div class="lockscreen" style="height: 100%"></div>'
      controller: 'RouteCtrl'

    .state 'error',
      url: '/error'
      templateUrl: 'core/views/error.html'

    .state 'app',
      abstract: true
      url: ''
      templateUrl: 'core/views/app.html'
      controller: 'MainCtrl as title'

    .state 'app.about',
      url: '/about'
      templateUrl: 'core/views/about.html'

  $urlRouterProvider.otherwise '/router'
