'use strict'

angular.module 'app.webchimera', [
  'app.webchimera.plugins.controls'
  'app.webchimera.plugins.top-controls'
  'app.webchimera.plugins.buffering'
  'app.webchimera.plugins.overlayplay'
  'app.webchimera.plugins.poster'
  'app.webchimera.plugins.torrent-info'
]

.directive 'ptDetail', ->
  restrict: 'E'
  templateUrl: 'webchimera/webchimera.html'
  controller: 'detailCtrl as ctrl'

.controller 'detailCtrl', ($sce, playerService, $filter, $scope, playerConfig, $stateParams) ->
  vm = this

  vm.config = angular.copy playerConfig
  
  vm.player = null

  $scope.$watch 'ctrl.torrent.ready', (readyState) ->
    console.log vm.torrent
    vm.config.controls = readyState

  $scope.$watchCollection 'ctrl.player', (newPlayer, oldPlayer) ->
    playerService.sortNextEpisodes(newPlayer).then (data) ->
      vm.next = data

  return