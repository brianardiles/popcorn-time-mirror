'use strict'

angular.module 'app.filter-bar', []

.directive 'ptFilterBar', ->
  restrict: 'E'
  scope: { type: '=', list: '=', onChange: '&' }
  bindToController: true
  templateUrl: 'filter-bar/filter-bar.html'
  controller: 'filterCtrl as filters'

.controller 'filterCtrl', ($scope) ->
  vm = this

  vm.menuOpen = null

  $scope.$watchCollection 'filters.params', (newParams, oldParams) ->
    if not angular.equals(newParams, oldParams) and angular.isDefined oldParams
      vm.onChange params: newParams

  return

.directive 'ptFilterBarItem', ->
  restrict: 'E'
  bindToController: true
  scope: { items: '=?', selected: '=', label: '@', menuOpen: '=' }
  templateUrl: "filter-bar/filter-bar-item.html"
  controller: 'filterBarItemController as filter'

.controller 'filterBarItemController', ->
  vm = this

  if not vm.selected
    vm.selected = vm.items[0]

  return
  
