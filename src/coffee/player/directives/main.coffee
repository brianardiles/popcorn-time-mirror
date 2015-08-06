'use strict'

angular.module 'com.module.webchimera'

.directive 'ptPlayerContainer', ->
  restrict: 'E'
  scope: { }
  templateUrl: 'player/views/main.html'
  controller: 'playerController as ctrl'

.controller 'playerController', ($sce) ->
  vm = this

  vm.config =   
    'controls': false
    'loop': false
    'autoPlay': true
    'autoHide': true
    'autoHideTime': 3000
    'preload': 'auto'
    'sources': [
      {
        'src': $sce.trustAsResourceUrl('http://static.videogular.com/assets/videos/videogular.mp4')
        'type': 'video/mp4'
      }
    ]
    'tracks': []
    'plugins':
      'poster': 'url': 'http://static.videogular.com/assets/images/earth.png'


  return