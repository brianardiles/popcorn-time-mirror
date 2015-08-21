'use strict'

angular.module 'app.page-header', []

.directive 'ptPageHeader', ->
  restrict: 'E'
  scope: { goBack: '&' }
  templateUrl: 'page-header/page-header.html'
  bindToController: true
  controller: 'pageHeaderController as header'

.controller 'pageHeaderController', ($state, $stateParams) ->
  vm = this

  vm.root = $state.current.root 
  vm.title = $state.current.title

  vm.torrentId = $stateParams.id
