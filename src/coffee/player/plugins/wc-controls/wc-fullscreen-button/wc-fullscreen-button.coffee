'use strict'

angular.module 'com.module.webchimera.plugins.controls'

.directive 'wcFullscreenButton', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: {}
  templateUrl: 'player/views/directives/wc-fullscreen-button.html'
  link: (scope, elem, attr, chimera) ->

    scope.onChangeFullScreen = (isFullScreen) ->
      scope.fullscreenIcon =
        enter: !isFullScreen
        exit: isFullScreen

    scope.onClickFullScreen = ->
      chimera.toggleFullScreen()

    scope.fullscreenIcon = enter: true

    scope.$watch ->
      chimera.isFullScreen
    , (newVal, oldVal) ->
      if newVal != oldVal
        scope.onChangeFullScreen newVal
