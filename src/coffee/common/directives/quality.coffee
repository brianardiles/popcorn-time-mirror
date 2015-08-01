'use strict'

angular.module 'com.module.common'

.directive 'ptQualitySelector', ->
  restrict: 'A'
  scope: { torrents: '=', selected: '=' }
  bindToController: true
  templateUrl: 'common/views/tv-quality.html'
  controller: 'qualityCtrl as quality'

.controller 'qualityCtrl', ->
  vm = this

  vm.list = ['480p', '720p', '1080p']

  vm.select = (quality) ->
    vm.selected = quality

  vm.selected = '0'

  return

.directive 'movieQualitySelector', ->
  restrict: 'A'
  scope: { torrents: '=', selected: '=' }
  bindToController: true
  templateUrl: 'common/views/movie-quality.html'
  controller: 'movieQualityCtrl as quality'

.controller 'movieQualityCtrl', ->
  vm = this

  vm.list = ['720p', '1080p']

  vm.select = (quality) ->
    vm.selected = quality

  return

.directive 'qualityIcon', ->
  restrict: 'A'
  scope: { torrent: '=' }
  bindToController: true
  template: '''
    <div ng-click="quality.getTorrentHealth(quality.torrent.url)" data-toggle="tooltip" data-placement="left" 
      title="Health {{quality.health | titleCase}}" 
      class="fa health-icon" ng-class="quality.health ? quality.health + ' fa-circle' : 'fa-spinner fa-spin'">
    </div>'''
  controller: 'qualityIconCtrl as quality'

.factory 'torrentHealth', ($q, torrenthealth) ->
  (torrentLink) ->
    defer = $q.defer()

    torrentHealthRestarted = 0

    getTorrent = ->
      torrenthealth(torrentLink, timeout: 1000).then (torrent) ->
        if torrent.seeds is 0 and torrentHealthRestarted < 5
          torrentHealthRestarted++
          getTorrent()
        else if torrent.seeds isnt 0 
          defer.resolve torrent
        else defer.reject()

    getTorrent()

    defer.promise

.controller 'qualityIconCtrl', (torrentHealth, $filter, $scope) ->
  vm = this
  
  torrentHealthRestarted = 0

  onSuccess = (torrent) ->
    vm.health = $filter('calcHealth')(torrent)
    vm.ratio = if torrent.peers > 0 then torrent.seeds / torrent.peers else +torrent.seeds

  onError = -> vm.health = 'none' 

  vm.getTorrentHealth = (newTorrent) ->
    vm.health = null

    if newTorrent.substring(0, 8) is 'magnet:?'
      torrentLink = newTorrent.split('&tr')[0] + '&tr=udp://tracker.openbittorrent.com:80/announce' + '&tr=udp://open.demonii.com:1337/announce' + '&tr=udp://tracker.coppersurfer.tk:6969'
     
      torrentHealth(torrentLink).then onSuccess, onError

  $scope.$watch 'quality.torrent', (newTorrent) ->
    vm.getTorrentHealth newTorrent.url 

  return