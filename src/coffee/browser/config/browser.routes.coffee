'use strict'

angular.module 'com.module.browser'

.config ($stateProvider) ->
  
  $stateProvider

    .state 'app.browser',
      abstract: true
      url: ''
      controller: 'browserCtrl as main' 
      templateUrl: 'browser/views/main.html'

    .state 'app.browser.list',
      url: '/:listType'
      abstract: true
      controller: 'browserListCtrl as list' 
      templateUrl: 'browser/views/browser.html'

    .state 'app.browser.list.view',
      url: '/view'
      sticky: true
      dsr: true
      views: view: templateUrl: 'browser/views/browser-list.html'

    .state 'app.browser.list.detail',
      sticky: true
      dsr: true
      url: '/:id'
      views: list:
        controllerProvider: ($stateParams) -> $stateParams.listType + 'DetailCtrl'
        controllerAs: 'show' 
        templateUrl: ($stateParams) -> 'browser/views/' + $stateParams.listType + '-detail.html'
