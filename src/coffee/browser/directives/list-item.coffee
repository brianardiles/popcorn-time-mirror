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
  controllerAs: 'item'
  bindToController: true
  template: '''
    <div style="padding-top: 27px; font-size: 20pt; width: 80px; text-align: center">{{ bitfield.buffer | torrentProgress }}</div>
      <div class="md-list-item-text">
        <h4>{{ torrent.name || 'Fetching metadata...' }}</h4>
        <p>
          <strong>Speed:</strong>
          {{ swarm.downloadSpeed() / 1024 | number:1 }} / {{ swarm.uploadSpeed() / 1024 | number:1 }} KB/s
          <md-icon md-font-set="material-icons">swap_vertical_circle</md-icon>

          <strong>Traffic:</strong>
          <span class="label label-success">{{ swarm.downloaded / 1024 / 1024 | number:1 }}</span> /
          <span class="label label-danger">{{ swarm.uploaded / 1024 / 1024 | number:1 }}</span> MB
          <md-icon md-font-set="material-icons">swap_vertical_circle</md-icon>

          <strong>Peers:</strong>
          <span class="label label-success">{{ swarm.wires | notChoked | number }}</span> /
          <span class="label label-default">{{ swarm.wires.length | number }}</span>
          <md-icon md-font-set="material-icons">account_circle</md-icon>

          <strong>Queue:</strong>
          <span class="label label-primary">{{ swarm.queued | number }}</span>
        </p>
      </div>
      <md-button class="md-fab" ng-click="pause(torrent.torrent)" style="margin: 14px 20px">
        <md-icon md-font-set="material-icons">{{ swarm.paused ? 'play_circle' : 'pause_circle' }}</md-icon>
      </md-button>'''
  controller: ($scope, torrentProvider) ->
    vm = this

    $scope.$watchCollection 'item.data.torrent', (newData) ->
      $scope.torrent = newData

    $scope.$watchCollection 'item.data.swarm', (newData) ->
      $scope.swarm = newData

    $scope.$watchCollection 'item.data.bitfield', (newData) ->
      $scope.bitfield = newData     

    return 