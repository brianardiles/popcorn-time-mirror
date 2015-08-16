'use strict'

angular.module 'com.module.common'

.directive 'filterBar', ->
  restrict: 'A'
  scope: { type: '=', list: '=', onChange: '&' }
  bindToController: true
  templateUrl: 'common/views/filter-bar.html'
  controller: 'filterCtrl as filters'

.controller 'filterCtrl', ($scope) ->
  vm = this

  vm.menuOpen = null

  $scope.$watchCollection 'filters.params', (newParams, oldParams) ->
    if not angular.equals(newParams, oldParams) and angular.isDefined oldParams
      vm.onChange params: newParams

  return

.directive 'ptDropdown', ($document, $timeout) ->
  restrict: 'E'
  bindToController: true
  scope: { items: '=?', selected: '=', label: '@', menuOpen: '=' }
  templateUrl: (iElem, tAttrs) -> "common/views/#{tAttrs.template}.html"
  controller: 'filterBarGroupController as filter'

.controller 'filterBarGroupController', ($scope) ->
  vm = this

  if not vm.selected
    vm.selected = vm.items[0]

  return
  
