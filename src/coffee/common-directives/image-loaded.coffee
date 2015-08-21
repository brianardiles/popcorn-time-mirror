'use strict'

angular.module 'app.common-directives'

.directive 'imageLoaded', ($timeout) ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    element.bind 'load', (e) ->
      element.parent().addClass 'fadeout'
      element.addClass 'fadein'
      return
    return
