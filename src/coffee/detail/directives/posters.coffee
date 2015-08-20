'use strict'

angular.module 'app.detail'

.directive 'imageLoaded', ($timeout) ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    element.bind 'load', (e) ->
      element.parent().addClass 'fadeout'
      element.addClass 'fadein'
      return
    return

.directive 'vibrant', ($parse, $Vibrant, $timeout) ->
  restrict: 'A'
  scope:
    colors: '='
  link: (scope, element, attrs) ->
    if angular.isDefined(attrs.crossorigin) or angular.isDefined(attrs.crossOrigin)
      element[0].crossOrigin = attrs.crossorigin or attrs.crossOrigin or 'Anonymous'

    element.on 'load', ->
      $timeout ->
        $Vibrant.get(element[0]).then (colors) ->
          scope.colors = colors
      , 1000