'use strict'

angular.module 'com.module.browser'

.directive 'backgroundCycler', ($compile, $animate) ->
  restrict: 'E'
  link: (scope, element, attr) ->

    animate = (newImageUrl) ->
      child = element.children()[0]
      
      scope = scope.$new()
      scope.url = newImageUrl
      
      img = $compile('<background-image></background-image>')(scope)
      
      $animate.enter img, element, null, ->
        console.log 'Inserted'
      
      if child
        $animate.leave angular.element(child), ->
          console.log 'Removed'

    scope.$watch 'list.backdrop', (url) ->
      if url
        console.log 'Active bg image changed', url
        animate url
   
.directive 'backgroundImage', ($compile, $animate) ->
  restrict: 'E'
  template: '<div class="list-backdrop fadein"></div>'
  replace: true
  scope: true
  link: (scope, element, attr) ->
    if scope.url
      element[0].style.backgroundImage = 'url(' + scope.url + ')'
    return


