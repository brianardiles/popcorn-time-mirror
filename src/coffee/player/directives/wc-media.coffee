'use strict'

angular.module 'com.module.webchimera'

.directive 'wcMedia', ($timeout, WC_UTILS, WC_STATES, wcjsRenderer) ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'views/directives/wc-media.html'
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
      canPlay = ''
     
      # It's a cool browser
      if chimera.wcjsElement[0].canPlayType
        i = 0
        l = sources.length
        
        while i < l
          canPlay = chimera.wcjsElement[0].canPlayType(sources[i].type)
          
          if canPlay == 'maybe' or canPlay == 'probably'
            chimera.wcjsElement.attr 'src', sources[i].src
            chimera.wcjsElement.attr 'type', sources[i].type
            
            #Trigger wcChangeSource($source) chimera callback in wcController
            chimera.changeSource sources[i]
            break
          i++

      $timeout ->
        if chimera.autoPlay
          chimera.play()
        return

      if canPlay == ''
        chimera.onVideoError()

    # INIT
    chimera.wcjsElement = wcjsRenderer.init elem.find 'canvas'
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

