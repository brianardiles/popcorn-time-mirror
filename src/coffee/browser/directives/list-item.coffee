'use strict'

angular.module 'com.module.browser'

.directive 'browserListItem', ->
  scope: { id: '=', item: '=', type: '=' }
  templateUrl: 'browser/views/list-item.html'

.directive 'browserListGhost', ($timeout) ->
  restrict: 'A'
  scope: true
  link: (scope, element, attr, ctrl) ->
    ghost = angular.element('<div class="item ghost"></div>')

    $timeout ->
      if scope.$last then console.log element.children()
    , 0

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
  template: '''
    <div style="padding-top: 27px; font-size: 20pt; width: 80px; text-align: center">{{ torrent.data.progress[0].toFixed(0) }}%</div>
      <div class="md-list-item-text">
        <h4><a ng-href="{{ torrent.data.files[0].link }}" target="_blank">{{ torrent.data.name || 'Fetching metadata...' }}</a></h4>
        <p>
          <strong>Speed:</strong>
          {{ torrent.data.stats.speed.down / 1024 | number:1 }} / {{ torrent.data.stats.speed.up / 1024 | number:1 }} KB/s
          <md-icon md-font-set="material-icons">swap_vertical_circle</md-icon>

          <strong>Traffic:</strong>
          <span class="label label-success">{{ torrent.data.stats.traffic.down / 1024 / 1024 | number:1 }}</span> /
          <span class="label label-danger">{{ torrent.data.stats.traffic.up / 1024 / 1024 | number:1 }}</span> MB
          <md-icon md-font-set="material-icons">swap_vertical_circle</md-icon>

          <strong>Peers:</strong>
          <span class="label label-success">{{ torrent.data.stats.peers.unchocked | number }}</span> /
          <span class="label label-default">{{ torrent.data.stats.peers.total | number }}</span>
          <md-icon md-font-set="material-icons">account_circle</md-icon>

          <strong>Queue:</strong>
          <span class="label label-primary">{{ torrent.data.stats.queue | number }}</span>
        </p>
      </div>
      <md-button class="md-fab" ng-click="torrent.pause(torrent.data)" style="margin: 14px 20px">
        <md-icon md-font-set="material-icons">{{ torrent.data.stats.paused ? 'play_circle' : 'pause_circle' }}</md-icon>
      </md-button>'''
  controller: ($scope, torrentProvider) ->
    vm = this

    vm.download = ->
      if vm.link
        Torrent.save(link: vm.link).$promise.then (torrent) ->
          loadTorrent torrent.infoHash
        vm.link = ''

    vm.pause = (torrent) ->
      socketServer.emit (if torrent.stats.paused then 'resume' else 'pause'), torrent.infoHash

    vm.remove = (torrent) ->
      Torrent.remove infoHash: torrent.infoHash
      delete vm.data[torrent.infoHash]

    return 