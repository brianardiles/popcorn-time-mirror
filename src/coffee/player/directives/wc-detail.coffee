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

  vm.goBack = ->
    vm.config = playerConfig
    vm.state = show: 'list', type: vm.state.type
    init()

  init = ->
    vm.currentTorrent = null
    vm.currentQuality = '0'
    vm.selectedSeason = null
    vm.selected = null
    vm.currentDevice = Settings.chosenPlayer
    vm.state.torrentId = null
    vm.data = null
     
    vm.seasons = {}

  init()
  
  vm.selectSeason = (season) ->
    vm.selectedSeason = season
    seasonIndex = '' + vm.selectedSeason 
    
    if vm.seasons[seasonIndex]
      for first of vm.seasons[seasonIndex]
        vm.selected = vm.seasons[seasonIndex][first]
        break
    else vm.selected = vm.currentTorrent = null

    vm.currentQuality = '0'

  getTorrentDetails = (newTorrent) ->
    api.detail(newTorrent, vm.state.type).then (resp) ->
      vm.data = resp.data
      vm.state.poster = $filter('traktSize')(resp.data.images.fanart, 'medium', vm.state.type) 
      
      if resp.data.type
        vm.state.type = resp.data.type

      if vm.state.type is 'show'
        angular.forEach resp.data.episodes, (value, currentEpisode) ->
          vm.seasons[value.season] ?= {}
          vm.seasons[value.season][value.episode] = value
      else
        vm.selected = resp.data
        
        for key, first of resp.data.torrents
          vm.currentQuality = key
          break

  $scope.$watch 'show.selected.torrents[show.currentQuality]', (newTorrent) ->
    vm.currentTorrent = newTorrent

  $scope.$watch 'show.selectedSeason', (newSeason) ->
    vm.selectSeason newSeason

  $scope.$watch 'show.state.torrentId', (newTorrent, oldTorrent) ->
    if newTorrent? and newTorrent isnt oldTorrent 
      vm.trakt_url = 'http://www.imdb.com/title/' + newTorrent
      getTorrentDetails newTorrent

    return

  $scope.$watch 'show.state.type', (newListType, oldListType) ->
    if newListType isnt oldListType or not api
      if newListType is 'anime'
        api = Haruhichan
      else if newListType is 'show'
        api = TVApi
      else api = YTS

  return 
