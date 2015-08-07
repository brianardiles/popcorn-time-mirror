'use strict'

angular.module 'com.module.common'

.directive 'ptViewContainer', ->
  restrict: 'E'
  transclude: true
  template: '<did ng-transclude></div>'
  controller: 'ptViewController as view'

.controller 'ptViewController', (Settings, $sce) ->
  vm = this

  vm.startPlayer = false

  vm.playerConfig =  
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
      'poster': 
        'url': 'http://static.videogular.com/assets/images/earth.png'

  return

.directive 'ptPlayTorrent', ->
  restrict: 'E'
  require: '^ptViewContainer'
  bindToController: true
  scope: { torrent: '=', episode: '=', season: '=' , quality: '=' , title: '=', device: '=' }
  template: '''
    <md-button ng-click="player.startTorrent()" style="color: rgb(255, 255, 255); background-color: rgb(6, 124, 154);" class="watchnow-btn" role="button" tabindex="0">
      <md-icon md-font-set="material-icons">play_arrow</md-icon> Play
      <span ng-if="player.season && player.episode"> S{{ player.season | padNumber }}E{{ player.episode.episode | padNumber }}</span>
    </md-button>'''
  controller: 'playTorrentController as player'
  link: (scope, element, attrs, player) ->

.controller 'playTorrentController', (Settings, torrentProvider) ->
  vm = this

  vm.startTorrent = ->
    torrentProvider.addTorrentLink(vm.torrent)
    return

  return
