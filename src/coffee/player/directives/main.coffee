'use strict'

angular.module 'com.module.webchimera'

.constant 'playerConfig',
  'controls': false
  'loop': false
  'autoplay': false
  'preload': 'auto'
  'sources': [
    {
      'src': 'http://static.videogular.com/assets/videos/videogular.mp4'
      'type': 'video/mp4'
    }
  ]
  'tracks': []
  'plugins':
    'controls':
      'autohide': true
      'autohideTime': 3000
    'poster': 'url': 'http://static.videogular.com/assets/images/earth.png'

.directive 'ptPlayerContainer', ->
  restrict: 'E'
  scope: { }
  templateUrl: 'player/views/main.html'
  controller: 'playerController as ctrl'

.controller 'playerController', (playerConfig) ->
  vm = this

  vm.config = playerConfig

  return