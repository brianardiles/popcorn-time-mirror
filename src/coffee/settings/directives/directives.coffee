'use strict'

angular.module 'com.module.settings'

.directive 'ptSettingsContainer', ->
  restrict: 'E'
  templateUrl: (element, attrs) ->
    'settings/views/settings-' + attrs.template + '.html'
