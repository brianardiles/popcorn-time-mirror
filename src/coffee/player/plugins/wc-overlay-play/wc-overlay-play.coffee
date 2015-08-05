'use strict'

angular.module 'com.module.webchimera.plugins.overlayplay', []

.directive 'wcOverlayPlay', (WC_STATES) ->
  restrict: 'E'
  require: '^chimerangular'
  scope: {}
  templateUrl: 'views/directives/wc-overlay-play.html'
  link: (scope, elem, attr, chimera) ->

    scope.onChangeState = (newState) ->
      switch newState
        when WC_STATES.PLAY
          scope.overlayPlayIcon = {}
        when WC_STATES.PAUSE
          scope.overlayPlayIcon = play: true
        when WC_STATES.STOP
          scope.overlayPlayIcon = play: true

    scope.onClickOverlayPlay = (event) ->
      chimera.playPause()

    scope.overlayPlayIcon = play: true
    
    scope.$watch ->
      chimera.currentState
    , (newVal, oldVal) ->
      scope.onChangeState newVal
