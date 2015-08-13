'use strict'

angular.module 'com.module.webchimera.plugins.torrent-info', []

.directive 'wcTorrentInfo', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: { torrent: '=?wcTorrent' }
  templateUrl: 'player/views/directives/wc-torrent-info.html'
  link: (scope, elem, attr, chimera) ->
    
    scope.stopPlaying = ->
      chimera.stop()
