'use strict'

angular.module 'com.module.browser'

.directive 'ptControlsContainer', ->
  restrict: 'E'
  templateUrl: 'browser/views/controls-container.html'

.directive 'ptPeopleContainer', ->
  restrict: 'E'
  scope: { people: '=' }
  templateUrl: 'browser/views/people-container.html'

.directive 'ptEpisodeContainer', ->
  restrict: 'E'
  scope: { episodes: '=', selectedEpisode: '=' }
  templateUrl: 'browser/views/episode-container.html'
  bindToController: true
  controllerAs: 'container'
  controller: ($scope) ->
    vm = this

    vm.selectEpisode = (episode) ->
      vm.selectedEpisode = episode

    return
    
.directive 'ptMetaContainer', ->
  restrict: 'E'
  scope: { show: '=' }
  templateUrl: 'browser/views/meta-container.html'

.directive 'ptSummaryWrapper', ($previousState) ->
  restrict: 'E'
  scope: { title: '=', torrentId: '=?' }
  templateUrl: 'browser/views/summary-wrapper.html'
  bindToController: true
  controllerAs: 'summary'
  controller: ->
    @goPrevious = ->
      $previousState.go()

    return

.directive 'ptSeasonsWrapper', ->
  restrict: 'E'
  scope: { seasons: '=', selectedSeason: '=' }
  templateUrl: 'browser/views/seasons-wrapper.html'

.directive 'ptTorrentItem', ->
  restrict: 'E'
  scope: { data: '=' }
  controllerAs: 'torrent'
  bindToController: true
  templateUrl: 'browser/views/pt-torrent-item.html'
  controller: ($scope, torrentProvider, socketServer) ->
    vm = this

    vm.download = ->
      if vm.link
        Torrent.save(link: vm.link).$promise.then (torrent) ->
          loadTorrent torrent.infoHash
        vm.link = ''

    vm.pause = (torrent, $event) ->
      $event.stopPropagation() 
      socketServer.emit (if torrent.stats.paused then 'resume' else 'pause'), torrent.infoHash

    vm.remove = (torrent) ->
      Torrent.remove infoHash: torrent.infoHash
      delete vm.data[torrent.infoHash]

    return 