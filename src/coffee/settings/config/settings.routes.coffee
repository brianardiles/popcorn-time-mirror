'use strict'

angular.module 'com.module.settings'

.config ($stateProvider) ->

  $stateProvider

    .state 'app.settings',
      url: '/settings'
      templateUrl: 'settings/views/view.html'
      controller: 'SettingsCtrl as vm'
