'use strict'

angular.module 'app.browser', []

.controller 'browserController', ($scope, $interval, api, type) ->
  vm = this

  loading = false 
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

  vm.type = type

  vm.currentFilters = 
    page: 1

  fetchData = ->
    if not loading 
      loading = true 

      api.fetch(vm.currentFilters).then (resp) ->
        getBackdrop resp.results
        vm.data = resp.results
        loading = false 

  vm.loadMoreItems = ->
    vm.currentFilters.page = vm.currentFilters.page + 1
    fetchData()

  vm.onChange = (filter) ->
    vm.currentFilters = angular.merge vm.currentFilters, filter.params
    vm.data = {}
    fetchData()

  fetchData()

  $scope.$on '$destroy', ->
    $interval.cancel bgCycler

  return 
