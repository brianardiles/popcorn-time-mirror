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
          scope.playPauseIcon = 'pause'
        when WC_STATES.PAUSE,  WC_STATES.STOP
          scope.playPauseIcon = 'play_arrow'

    scope.onClickPlayPause = ->
      chimera.playPause()

    scope.playPauseIcon = 'play_arrow'

    scope.$watch ->
      chimera.currentState
    , (newVal, oldVal) ->
      scope.setState newVal
