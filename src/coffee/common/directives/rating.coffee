'use strict'

angular.module 'com.module.common'

.directive 'ratingContainer', ->
  restrict: 'A'
  scope: { rating: '=' }
  bindToController: true
  templateUrl: 'common/views/rating-container.html'
  controller: 'ratingCtrl as rating'

.controller 'ratingCtrl', ->
  vm = this

  vm.value = vm.rating.percentage / 10
  vm.rounded = Math.round(vm.value) / 2

  vm.stars = [1..5].map (i) -> 
    if i > vm.rounded then (if vm.rounded % 1 > 0 and Math.ceil(vm.rounded) is i then 'star_half' else 'star_border') else 'star'

  return