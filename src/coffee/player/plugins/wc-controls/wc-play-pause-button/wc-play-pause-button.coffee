'use strict'

angular.module 'com.module.webchimera.plugins.controls'

.directive 'wcPlayPauseButton', (WC_STATES) ->
  restrict: 'E'
  require: '^chimerangular'
  scope: {}
  templateUrl: 'player/views/directives/wc-play-pause-button.html'
  link: (scope, elem, attr, chimera) ->

    scope.setState = (newState) ->
      switch newState
        when WC_STATES.PLAY
          scope.playPauseIcon = pause: true
        when WC_STATES.PAUSE
          scope.playPauseIcon = play: true
        when WC_STATES.STOP
          scope.playPauseIcon = play: true

    scope.onClickPlayPause = ->
      chimera.playPause()

    scope.playPauseIcon = play: true

    scope.$watch ->
      chimera.currentState
    , (newVal, oldVal) ->
      scope.setState newVal
