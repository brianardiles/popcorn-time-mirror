'use strict'

angular.module 'com.module.webchimera.plugins.top-controls'

.directive 'wcCloseButton', ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'player/views/directives/wc-close-button.html'
  link: (scope, elem, attr, chimera) ->
    scope.onClosePlayer = ->
      chimera.stop()