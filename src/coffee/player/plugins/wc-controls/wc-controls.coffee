'use strict'

angular.module 'com.module.webchimera.plugins.controls', []

.directive 'wcControls', ($timeout, WC_STATES) ->
  restrict: 'E'
  require: '^chimerangular'
  transclude: true
  templateUrl: 'player/views/directives/wc-controls.html'
  scope:
    wcAutohide: '=?'
    wcAutohideTime: '=?'
  link: (scope, elem, attr, chimera) ->
    w = 0
    h = 0
    
    autoHideTime = 2000
    hideInterval = undefined
    scope.chimera = chimera

    scope.onMouseMove = ->
      if scope.wcAutohide
        scope.showControls()

    scope.setAutohide = (value) ->
      if value and chimera.currentState == WC_STATES.PLAY
        hideInterval = $timeout(scope.hideControls, autoHideTime)
      else
        scope.animationClass = ''
        $timeout.cancel hideInterval
        scope.showControls()

    scope.setAutohideTime = (value) ->
      autoHideTime = value

    scope.hideControls = ->
      scope.animationClass = 'hide-animation'

    scope.showControls = ->
      scope.animationClass = 'show-animation'
      $timeout.cancel hideInterval
      
      if scope.wcAutohide and chimera.currentState == WC_STATES.PLAY
        hideInterval = $timeout(scope.hideControls, autoHideTime)

    if chimera.isConfig
      scope.$watch 'chimera.config', ->
        if scope.chimera.config
          ahValue = scope.chimera.config.plugins.controls.autohide or false
          ahtValue = scope.chimera.config.plugins.controls.autohideTime or 2000
          scope.wcAutohide = ahValue
          scope.wcAutohideTime = ahtValue
          scope.setAutohideTime ahtValue
          scope.setAutohide ahValue
    else
      # If wc-autohide has been set
      if scope.wcAutohide != undefined
        scope.$watch 'wcAutohide', scope.setAutohide
      
      # If wc-autohide-time has been set
      if scope.wcAutohideTime != undefined
        scope.$watch 'wcAutohideTime', scope.setAutohideTime

