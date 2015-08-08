'use strict'

angular.module 'com.module.common'

.directive 'ptViewContainer', ->
  restrict: 'E'
  transclude: true
  template: '<did ng-transclude></div>'
  controller: 'ptViewController as view'

.controller 'ptViewController', (Settings, $sce, torrentProvider) ->
  vm = this

  vm.player = detail: null, start: false

  vm.setPlayer = (hash, torrent) ->
    torrentProvider.getTorrent(hash).then (torrentDetail) ->
      vm.player = { detail: torrentDetail, start: true }
        
  return

.controller 'playTorrentController', (Settings, torrentProvider) ->
  vm = this

  return

.directive 'ptPlayTorrent', (torrentProvider) ->
  restrict: 'E'
  require: '^ptViewContainer'
  bindToController: true
  scope: { torrent: '=', episode: '=', season: '=' , quality: '=' , title: '=', device: '=' }
  template: '''
    <md-button ng-click="startTorrent()" style="color: rgb(255, 255, 255); background-color: rgb(6, 124, 154);" class="watchnow-btn" role="button" tabindex="0">
      <md-icon md-font-set="material-icons">play_arrow</md-icon> Play
      <span ng-if="player.season && player.episode"> S{{ player.season | padNumber }}E{{ player.episode.episode | padNumber }}</span>
    </md-button>'''
  controller: 'playTorrentController as player'
  link: (scope, element, attrs, ctrl) ->
    player = scope.player
    view = ctrl

    scope.startTorrent = ->
      torrentProvider.addTorrentLink(player.torrent).then (data) ->
        view.setPlayer data.infoHash, player
      return
