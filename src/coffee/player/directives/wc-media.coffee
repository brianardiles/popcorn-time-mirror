'use strict'

angular.module 'com.module.webchimera'

.directive 'wcMedia', ($timeout, WC_UTILS, WC_STATES, wcjsRenderer) ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'player/views/directives/wc-media.html'
  scope:
    wcSrc: '=?'
  link: (scope, elem, attrs, chimera) ->
    sources = undefined
    
    # FUNCTIONS
    scope.onChangeSource = (newValue, oldValue) ->
      if (!sources or newValue != oldValue) and newValue
        sources = newValue
        
        if chimera.currentState != WC_STATES.PLAY
          chimera.currentState = WC_STATES.STOP
        
        chimera.sources = sources
        scope.changeSource()

    scope.changeSource = ->
      i = 0
      l = sources.length
      
      while i < l
        #Trigger wcChangeSource($source) chimera callback in wcController
        chimera.changeSource sources[i]
        break
        i++

    $timeout ->
      if chimera.autoPlay
        chimera.play()
      return

    # INIT
    chimera.wcjsElement = wcjsRenderer.init elem.find('canvas')[0]
    chimera.sources = scope.wcSrc

    chimera.addListeners()
    chimera.onVideoReady()

    scope.$watch 'wcSrc', scope.onChangeSource
    
    scope.$watch ->
      chimera.sources
    , scope.onChangeSource

    if chimera.isConfig
      scope.$watch ->
        chimera.config
      , ->
        if chimera.config
          scope.wcSrc = chimera.config.sources

