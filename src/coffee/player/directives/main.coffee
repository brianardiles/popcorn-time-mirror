'use strict'

angular.module 'com.module.webchimera'

.directive 'ptPlayerContainer', ->
  restrict: 'E'
  scope: { config: '=' }
  bindToController: true
  templateUrl: 'player/views/main.html'
  controller: 'playerController as ctrl'

.controller 'playerController', ($sce) ->
  vm = this

  return