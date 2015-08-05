'use strict'

angular.module 'com.module.webchimera'

.directive 'wcNativeControls', ->
  restrict: 'A'
  require: '^chimerangular'
  link: 
    pre: (scope, elem, attr, chimera) ->
      controls = undefined

      scope.setControls = (value) ->
        if value
          chimera.wcjsElement.attr 'controls', value
        else chimera.wcjsElement.removeAttr 'controls'

      if chimera.isConfig
        scope.$watch ->
          chimera.config
        , ->
          if chimera.config
            scope.setControls chimera.config.controls
      else
        scope.$watch attr.wcNativeControls, (newValue, oldValue) ->
          if (!controls or newValue != oldValue) and newValue
            controls = newValue
            scope.setControls controls
          else scope.setControls()
