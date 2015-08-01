'use strict'

angular.module 'com.module.core'

.controller 'RouteCtrl', ($location) ->
  $location.path '/movie/view'
