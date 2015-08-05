'use strict'

angular.module 'com.module.webchimera'

.directive 'wcPreload', ->
  restrict: 'A'
  require: '^chimerangular'
  link: 
    pre: (scope, elem, attr, chimera) ->
      preload = undefined

      scope.setPreload = (value) ->
        if value
          chimera.wcjsElement.attr 'preload', value
        else chimera.wcjsElement.removeAttr 'preload'

      if chimera.isConfig
        scope.$watch ->
          chimera.config
        , ->
          if chimera.config
            scope.setPreload chimera.config.preload
      else
        scope.$watch attr.wcPreload, (newValue, oldValue) ->
          if (!preload or newValue != oldValue) and newValue
            preload = newValue
            scope.setPreload preload
          else scope.setPreload()
