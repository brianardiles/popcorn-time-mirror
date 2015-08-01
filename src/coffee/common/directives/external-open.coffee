'use strict'

angular.module 'com.module.common'

.directive 'extOpen', (gui) ->
  scope: { link: '=' }
  link: (scope, element, attrs) ->
    open = ->
      gui.Shell.openExternal scope.link

    element.on 'click', open

    scope.$on '$destroy', ->
      element.off 'click', open
