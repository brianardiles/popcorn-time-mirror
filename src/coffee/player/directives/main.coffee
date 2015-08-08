'use strict'

angular.module 'com.module.webchimera'

.directive 'ptPlayerContainer', ->
  restrict: 'E'
  scope: { player: '=' }
  bindToController: true
  templateUrl: 'player/views/main.html'
  controller: 'playerController as ctrl'

.controller 'playerController', ($sce, $filter, $scope) ->
  vm = this

  $scope.$watchCollection 'ctrl.player', (newVal, oldVal) ->
    if newVal.detail?.connection
      newVal.detail.listen()
    console.log newVal, oldVal

  return