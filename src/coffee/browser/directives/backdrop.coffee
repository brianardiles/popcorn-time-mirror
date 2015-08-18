'use strict'

angular.module 'com.module.browser'

.directive 'backgroundCycler', ($compile, $animate, $q) ->
  restrict: 'E'
  link: (scope, element, attr) ->
    image = null

    $animate.enabled element

    scope.$watch 'list.backdrop', (newImageUrl) ->
      if newImageUrl
        newScope = scope.$new()
        newScope.url = newImageUrl
        
        animations = []

        if image
          animations.push $animate.leave image

        image = angular.element '<background-image></background-image>'
        newImage = $compile(image) newScope
        
        animations.push $animate.enter newImage, element, null

        $q.all animations

        return

.directive 'backgroundImage', ($compile, $animate) ->
  restrict: 'E'
  template: '<div class="bg-image"></div>'
  replace: true
  scope: true
  link: (scope, element, attr) ->
    if scope.url
      element.css 'background-image': 'url(' + scope.url + ')'
    return
