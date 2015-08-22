'use strict'

angular.module 'app.detail', []

.directive 'wcDetail', ->
  scope: { player: '=', config: '=', torrent: '=' }
  bindToController: true
  restrict: 'E'
  templateUrl: 'detail/detail.html'
  controller: 'detailController as detail'

.controller 'detailController', ($scope, $filter, playerConfig, $timeout, Settings, $stateParams, $state, TVApi, YTS, Haruhichan) ->
  vm = this

  $state.current.title = vm.show = $stateParams.title
  
  vm.currentDevice = Settings.chosenPlayer
  vm.currentQuality = '0' 
  vm.currentTorrent = null

  vm.seasons = {}
  vm.selectedSeason = null

  vm.torrentId = $stateParams.id
  vm.trakt_url = 'http://www.imdb.com/title/' + $stateParams.id
  vm.type = $stateParams.type

  api = switch vm.type
    when 'anime'
      Haruhichan
    when 'show'
      TVApi
    else YTS

  vm.goBack = ->
    vm.config = angular.copy playerConfig
    $state.go 'app.' + vm.type

  vm.selectSeason = (season) ->
    seasonIndex = '' + vm.selectedSeason 
    
    if vm.seasons[seasonIndex]
      for first of vm.seasons[seasonIndex]
        vm.selected = vm.seasons[seasonIndex][first]
        break
    else vm.selected = vm.currentTorrent = null

    vm.currentQuality = '0'

  getTorrentDetails = (newTorrent) ->
    api.detail(newTorrent, vm.type).then (resp) ->
      vm.data = resp.data
      vm.config.poster = $filter('traktSize')(resp.data.images.fanart, 'medium', vm.type) 
      
      if vm.type is 'show'
        angular.forEach resp.data.episodes, (value, currentEpisode) ->
          vm.seasons[value.season] ?= {}
          vm.seasons[value.season][value.episode] = value
      else
        vm.selected = resp.data

        for key, first of resp.data.torrents
          vm.currentQuality = key
          break

  $scope.$watch 'detail.selected.torrents[detail.currentQuality]', (newTorrent) ->
    vm.currentTorrent = newTorrent

  if vm.type is 'show'
    $scope.$watch 'detail.selectedSeason', (newSeason) ->
      vm.selectSeason newSeason

  getTorrentDetails $stateParams.id

  return 
