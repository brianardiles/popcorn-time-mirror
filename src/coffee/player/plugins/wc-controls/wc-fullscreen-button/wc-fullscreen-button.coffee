'use strict'

angular.module 'com.module.webchimera.plugins.controls'

.directive 'wcFullscreenButton', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: {}
  templateUrl: 'player/views/directives/wc-fullscreen-button.html'
  link: (scope, elem, attr, chimera) ->

    scope.onChangeFullScreen = (isFullScreen) ->
      if isFullScreen
        scope.fullscreenIcon = 'fullscreen_exit'
      else scope.fullscreenIcon = 'fullscreen'

    scope.onClickFullScreen = ->
      chimera.toggleFullScreen()

    scope.fullscreenIcon = 'fullscreen'

    scope.$watch ->
      chimera.isFullScreen
    , (newVal, oldVal) ->
      if newVal != oldVal
        scope.onChangeFullScreen newVal
