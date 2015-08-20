'use strict'

angular.module 'app.detail'

.directive 'ptControlsContainer', ->
  restrict: 'E'
  templateUrl: 'detail/views/controls-container.html'

.directive 'ptPeopleContainer', ->
  restrict: 'E'
  scope: { people: '=' }
  templateUrl: 'detail/views/people-container.html'

.directive 'ptEpisodeContainer', ->
  restrict: 'E'
  scope: { episodes: '=', selectedEpisode: '=' }
  templateUrl: 'detail/views/episode-container.html'
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
  templateUrl: 'detail/views/meta-container.html'
