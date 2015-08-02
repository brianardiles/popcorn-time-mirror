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
