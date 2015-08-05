'use strict'

angular.module 'com.module.webchimera'

.directive 'wcLoop', ->
  restrict: 'A'
  require: '^chimerangular'
  link: 
    pre: (scope, elem, attr, chimera) ->
      lp = undefined

      scope.setLoop = (value) ->
        if value
          chimera.wcjsElement.attr 'loop', value
        else chimera.wcjsElement.removeAttr 'loop'

      if chimera.isConfig
        scope.$watch ->
          chimera.config
        , ->
          if chimera.config
            scope.setLoop chimera.config.loop
      else
        scope.$watch attr.wcLoop, (newValue, oldValue) ->
          if (!lp or newValue != oldValue) and newValue
            lp = newValue
            scope.setLoop lp
          else scope.setLoop()
