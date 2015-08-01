'use strict'

angular.module 'com.module.browser'

.controller 'browserCtrl', ($state, $stateParams) ->
  vm = this

  return 

.controller 'browserListCtrl', (TVApi, YTS, $stateParams, Haruhichan, genres, sorters, types) ->
  vm = this

  vm.type = $stateParams.listType

  data = switch vm.type 
    when 'movie'
      YTS
    when 'show'
      TVApi
    when 'anime'
      Haruhichan

  vm.filters = 
    sorters: sorters[vm.type] or null
    types: types[vm.type] or null
    genres: genres[vm.type] or null

  data.fetch().then (resp) ->
    vm.data = resp.results

  vm.onChange = (filter) ->
    vm.data = null

    data.fetch(filter.params).then (resp) ->
      vm.data = resp.results

  return 

.controller 'movieDetailCtrl', ($scope, YTS, Haruhichan, $timeout, $stateParams) ->
  vm = this

  vm.currentTorrent = null
  vm.currentQuality = null 

  vm.trakt_url = 'http://www.imdb.com/title/' + $stateParams.id
  vm.type = $stateParams.listType

  if $stateParams.id.charAt(0) is 'm'
    data = Haruhichan
  else
    data = YTS

  data.detail($stateParams.id, vm.type).then (resp) ->
    vm.data = resp.data

    for key, first of resp.data.torrents
      vm.currentQuality = key
      break

    $scope.$watch 'show.data.torrents[show.currentQuality]', (newTorrent) ->
      vm.currentTorrent = newTorrent

  return

.controller 'showDetailCtrl', ($scope, TVApi, Haruhichan, $timeout, $stateParams) ->
  vm = this

  vm.currentTorrent = null
  vm.currentQuality = '0'

  vm.trakt_url = 'http://www.imdb.com/title/' + $stateParams.id
  vm.type = $stateParams.listType

  vm.seasons = {}

  vm.selectSeason = (season) ->
    vm.selectedSeason = season

    if vm.seasons['' + vm.selectedSeason]
      for first of vm.seasons['' + vm.selectedSeason]
        vm.selectedEpisode = vm.seasons['' + vm.selectedSeason][first]
        break

    vm.currentQuality = '0'

  $scope.$watch 'show.selectedEpisode.torrents[show.currentQuality]', (newTorrent) ->
    vm.currentTorrent = newTorrent

  $scope.$watch 'show.selectedSeason', (newSeason) ->
    vm.selectSeason newSeason

  if $stateParams.id.charAt(0) is 'm'
    data = Haruhichan
  else
    data = TVApi

  data.detail($stateParams.id, vm.type).then (resp) ->
    vm.data = resp.data

    angular.forEach resp.data.episodes, (value, currentEpisode) ->
      vm.seasons[value.season] ?= {}
      vm.seasons[value.season][value.episode] = value
        
  return 