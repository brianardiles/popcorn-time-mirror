'use strict'

angular.module 'app.page-header', []

.directive 'ptPageHeader', ->
  restrict: 'E'
  templateUrl: 'page-header/page-header.html'
  scope: { goBack: '&' }
  bindToController: true
  controller: 'pageHeaderController as header'

.controller 'pageHeaderController', ($state, $stateParams) ->
  vm = this

  vm.root = $state.current.root 
  vm.title = $state.current.title

  vm.torrentId = $stateParams.id
