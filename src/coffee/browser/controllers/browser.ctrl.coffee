'use strict'

angular.module 'com.module.browser'

.controller 'browserCtrl', ($state, $stateParams, torrentProvider) ->
  vm = this

  return 

.controller 'torrentsListCtrl', ($interval, $resource, $q, socketServer, streamServer, torrentProvider) ->
  vm = this

  vm.keypress = (e) ->
    if e.which == 13
      vm.download()
    return

  vm.select = (torrent, file) ->
    socketServer.emit (if file.selected then 'deselect' else 'select'), torrent.infoHash, torrent.files.indexOf(file)

  return 

.controller 'browserListCtrl', ($sce, TVApi, YTS, $stateParams, Haruhichan, genres, sorters, types) ->
  vm = this

  vm.type = $stateParams.listType

  data = switch vm.type 
    when 'movie'
      YTS
    when 'show'
      TVApi
    when 'anime'
      Haruhichan

  getBackdrop = (item) ->
    if item.images.fanart
      vm.backdrop = item.images.fanart

  vm.filters = 
    sorters: sorters[vm.type] or null
    types: types[vm.type] or null
    genres: genres[vm.type] or null

  data.fetch().then (resp) ->
    for first of resp.results
      getBackdrop resp.results[first]
      break
    vm.data = resp.results

  vm.onChange = (filter) ->
    vm.data = null

    data.fetch(filter.params).then (resp) ->
      for first of resp.results
        getBackdrop resp.results[first]
        break
      vm.data = resp.results

  return 

.controller 'movieDetailCtrl', ($scope, YTS, Haruhichan, $timeout, $stateParams, Settings) ->
  vm = this

  vm.currentTorrent = null
  vm.currentQuality = null 
  vm.currentdDevice = Settings.chosenPlayer

  vm.trakt_url = 'http://www.imdb.com/title/' + $stateParams.id
  vm.type = $stateParams.listType
  vm.torrentId = $stateParams.id
  
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

.controller 'showDetailCtrl', ($scope, TVApi, Haruhichan, $timeout, $stateParams, Settings) ->
  vm = this

  vm.currentTorrent = null
  vm.currentQuality = '0'
  vm.currentDevice = Settings.chosenPlayer
  
  vm.trakt_url = 'http://www.imdb.com/title/' + $stateParams.id
  vm.type = $stateParams.listType
  vm.torrentId = $stateParams.id

  vm.seasons = {}

  vm.selectSeason = (season) ->
    vm.selectedSeason = season
    seasonIndex = '' + vm.selectedSeason - 1
    if vm.seasons[seasonIndex]
      for first of vm.seasons[seasonIndex]
        vm.selectedEpisode = vm.seasons[seasonIndex][first]
        break
    else vm.selectedEpisode = vm.currentTorrent = null

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