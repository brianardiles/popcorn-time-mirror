'use strict'

angular.module 'com.module.webchimera'

.directive 'wcDetail', ($timeout) ->
  restrict: 'E'
  scope: { config: '=', state: '=' }
  bindToController: true
  templateUrl: 'player/views/directives/wc-detail.html'
  controller: 'detailCtrl as show'


.controller 'detailCtrl', ($scope, $filter, playerConfig, TVApi, YTS, Haruhichan, $timeout, Settings) ->
  vm = this

  api = null

  movieWatcher = ->
  tvShowWatcher = ->

  vm.goBack = ->
    vm.config = playerConfig
    vm.state = show: 'list', type: vm.state.type
    init()

  init = ->
    vm.currentTorrent = null
    vm.currentQuality = '0'
    vm.selectedSeason = null
    vm.selectedEpisode = null
    vm.currentDevice = Settings.chosenPlayer
    vm.state.torrentId = null
    vm.data = null
     
    vm.seasons = {}

  init()
  
  vm.selectSeason = (season) ->
    vm.selectedSeason = season
    seasonIndex = '' + vm.selectedSeason - 1
    
    if vm.seasons[seasonIndex]
      for first of vm.seasons[seasonIndex]
        vm.selectedEpisode = vm.seasons[seasonIndex][first]
        break
    else vm.selectedEpisode = vm.currentTorrent = null

    vm.currentQuality = '0'

  watchers = 
    anime: ->

    show: ->
      movieWatcher()

      tvShowWatcher = $scope.$watch 'show.selectedEpisode.torrents[show.currentQuality]', (newTorrent) ->
        vm.currentTorrent = newTorrent

      $scope.$watch 'show.selectedSeason', (newSeason) ->
        vm.selectSeason newSeason
    movie: ->
      tvShowWatcher()

      movieWatcher = $scope.$watch 'show.data.torrents[show.currentQuality]', (newTorrent) ->
        vm.currentTorrent = newTorrent

  $scope.$watch 'show.state.torrentId', (newTorrent, oldTorrent) ->
    if newTorrent? and newTorrent isnt oldTorrent 
      vm.trakt_url = 'http://www.imdb.com/title/' + newTorrent

      api.detail(newTorrent, vm.state.type).then (resp) ->
        vm.data = resp.data
        vm.state.poster = $filter('traktSize')(resp.data.images.fanart, 'medium', vm.state.type) 

        if vm.state.type is 'show'
          angular.forEach resp.data.episodes, (value, currentEpisode) ->
            vm.seasons[value.season] ?= {}
            vm.seasons[value.season][value.episode] = value
        else
          for key, first of resp.data.torrents
            vm.currentQuality = key
            break

    return

  $scope.$watch 'show.state.type', (newListType, oldListType) ->
    if newListType isnt oldListType or not api
      watchers[newListType]()

      if newListType is 'anime'
        api = Haruhichan
      else if newListType is 'show'
        api = TVApi
      else api = YTS

  return 
