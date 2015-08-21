'use strict'

angular.module 'app.play-torrent', []

.directive 'ptPlayTorrent', (torrentProvider) ->
  restrict: 'E'
  require: '^ptViewContainer'
  bindToController: true
  scope: { torrent: '=', episode: '=', show: '=' , quality: '=' , device: '=' }
  templateUrl: 'play-torrent/play-torrent.html'
  controller: 'playTorrentController as player'
  link: (scope, element, attrs, ctrl) ->
    player = scope.player
    view = ctrl

    scope.startTorrent = ->
      scope.player = player

      torrentProvider.addTorrentLink(player.torrent).then (resp) ->
        torrentProvider.getTorrent(resp.data.infoHash).then (torrentDetail) ->
          scope.state.torrent = torrentDetail
          scope.state.torrent.listen()
      
      return

.controller 'playTorrentController', (Settings, torrentProvider) ->
  vm = this

  return
