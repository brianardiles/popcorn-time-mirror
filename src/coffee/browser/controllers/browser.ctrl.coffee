'use strict'

angular.module 'com.module.browser'

.controller 'browserCtrl', ($state, $stateParams) ->
  vm = this

  return 

.controller 'torrentsListCtrl', ($interval, $resource, $q, socketServer, streamServer) ->
  vm = this

  Torrent = $resource "http://127.0.0.1:#{streamServer.port}/torrents/:infoHash"

  load = ->
    torrents = Torrent.get ->
      vm.data = torrents

  loadTorrent = (hash) ->
    Torrent.get(infoHash: hash).$promise.then (torrent) ->
      vm.data[hash] = torrent
      
      torrent

  findTorrent = (hash) ->
    torrent = vm.data[hash]
    
    if torrent
      $q.when torrent
    else loadTorrent hash

  load()

  vm.keypress = (e) ->
    if e.which == 13
      vm.download()
    return

  vm.select = (torrent, file) ->
    socketServer.emit (if file.selected then 'deselect' else 'select'), torrent.infoHash, torrent.files.indexOf(file)

  socketServer.on 'verifying', (hash) ->
    findTorrent(hash).then (torrent) ->
      torrent.ready = false

  socketServer.on 'ready', (hash) ->
    loadTorrent hash

  socketServer.on 'interested', (hash) ->
    findTorrent(hash).then (torrent) ->
      torrent.interested = true

  socketServer.on 'uninterested', (hash) ->
    findTorrent(hash).then (torrent) ->
      torrent.interested = false

  socketServer.on 'stats', (hash, stats) ->
    findTorrent(hash).then (torrent) ->
      torrent.stats = stats

  socketServer.on 'download', (hash, progress) ->
    findTorrent(hash).then (torrent) ->
      torrent.progress = progress

  socketServer.on 'selection', (hash, selection) ->
    findTorrent(hash).then (torrent) ->
      i = 0

      while i < torrent.files.length
        file = torrent.files[i]
        file.selected = selection[i]
        i++

  socketServer.on 'destroyed', (hash) ->
    delete vm.data[hash]

  socketServer.on 'disconnect', ->
    vm.data = []

  socketServer.on 'connect', load

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