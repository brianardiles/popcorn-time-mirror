'use strict'

angular.module 'com.module.browser'

.controller 'sideNavCtrl', (torrentProvider) ->
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

.controller 'browserListCtrl', ($interval, $sce, $scope, TVApi, YTS, Haruhichan, genres, sorters, types) ->
  vm = this

  page = null
  data = null
  bgCycler = null

  vm.activeBgImageIndex = 0

  vm.cycleBgImages = ->
    if bgCycler
      $interval.cancel bgCycler

    cycle = ->
      if vm.bgImages
        selectedKey = vm.activeBgImageIndex++ % vm.bgImagesKeys.length
        vm.backdrop = vm.bgImages[vm.bgImagesKeys[selectedKey]].images?.fanart

    bgCycler = $interval cycle, 10000

    cycle()
  
  getBackdrop = (results) ->
    vm.bgImages = results
    vm.bgImagesKeys = Object.keys results
    vm.cycleBgImages()

  $scope.$watch 'list.state.type', (newListType, oldListType) ->
    if newListType isnt oldListType or not page
      vm.data = {}
      vm.backdrop = {}

      data = switch newListType
        when 'movie'
          vm.title = 'Movies'
          YTS
        when 'show'
          vm.title = 'TV Shows'
          TVApi
        when 'anime'
          vm.title = 'Anime'
          Haruhichan

      vm.filters = 
        sorters: sorters[newListType] or null
        types: types[newListType] or null
        genres: genres[newListType] or null

      data.fetch().then (resp) ->
        getBackdrop resp.results
        vm.data = resp.results

      page = 1

  vm.type = 'movie'

  vm.loadMoreItems = (filters) ->
    page = page + 1

    data.fetch({page: page}).then (resp) ->
      vm.data = angular.extend vm.data, resp.results

  vm.onChange = (filter) ->
    vm.data = {}

    data.fetch(filter.params).then (resp) ->
      getBackdrop resp.results
      vm.data = resp.results

  return 
