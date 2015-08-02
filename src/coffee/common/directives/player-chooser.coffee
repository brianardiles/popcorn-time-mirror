'use strict'

angular.module 'com.module.common'

.directive 'ptPlayTorrent', ->
  restrict: 'E'
  bindToController: true
  scope: { torrent: '=', episode: '=', season: '=' , quality: '=' , title: '=', device: '=' }
  template: '''
    <md-button ng-disabled="!player.torrent" ng-click="player.startTorrent()" style="color: rgb(255, 255, 255); background-color: rgb(6, 124, 154);" class="watchnow-btn" role="button" tabindex="0">
      <md-icon md-font-set="material-icons">play_arrow</md-icon> Play
      <span ng-if="player.season && player.episode"> S{{ player.season | padNumber }}E{{ player.episode.episode | padNumber }}</span>
    </md-button>'''
  controller: 'playTorrentController as player'

.controller 'playTorrentController', (Settings) ->
  vm = this

  return