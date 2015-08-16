'use strict'

angular.module 'com.module.common'

.directive 'ptViewContainer', ->
  restrict: 'E'
  transclude: true
  template: '<div ng-transclude></div>'
  controller: 'ptViewController as view'

.controller 'ptViewController', (Settings, $sce, torrentProvider) ->
  vm = this

  vm.state = 
    show: 'list' 
    type: 'movie'
    torrentId: null

  vm.player = detail: null, start: false, player: null

  vm.setPlayer = (data, player) ->
    vm.show = 'player'

    torrentProvider.getTorrent(data.infoHash).then (torrentDetail) ->
      vm.player = { player: player, torrent: torrentDetail, start: true }
        
  return

.controller 'playTorrentController', (Settings, torrentProvider) ->
  vm = this

  return

.directive 'ptPlayTorrent', (torrentProvider) ->
  restrict: 'E'
  require: '^ptViewContainer'
  bindToController: true
  scope: { torrent: '=', episode: '=', show: '=' , quality: '=' , device: '=' }
  template: '''
    <md-button ng-click="startTorrent()" style="color: rgb(255, 255, 255); background-color: rgb(6, 124, 154);" class="watchnow-btn" role="button" tabindex="0">
      <md-icon md-font-set="material-icons">play_arrow</md-icon> Play
      <span ng-if="player.episode.season && player.episode.episode"> S{{ player.episode.season | padNumber }}E{{ player.episode.episode | padNumber }}</span>
    </md-button>'''
  controller: 'playTorrentController as player'
  link: (scope, element, attrs, ctrl) ->
    player = scope.player
    view = ctrl

    scope.startTorrent = ->
      torrentProvider.addTorrentLink(player.torrent).then (resp) ->
        view.setPlayer resp.data, player
      return
