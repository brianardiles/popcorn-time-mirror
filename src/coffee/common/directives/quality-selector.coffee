'use strict'

angular.module 'com.module.common'

.directive 'ptQualitySelector', ->
  restrict: 'A'
  scope: { torrents: '=', selected: '=' }
  bindToController: true
  templateUrl: 'common/views/tv-quality.html'
  controller: 'qualityCtrl as quality'

.controller 'qualityCtrl', ->
  vm = this

  vm.list = ['480p', '720p', '1080p']

  vm.select = (quality) ->
    vm.selected = quality

  vm.selected = '0'

  return

.directive 'movieQualitySelector', ->
  restrict: 'A'
  scope: { torrents: '=', selected: '=' }
  bindToController: true
  templateUrl: 'common/views/movie-quality.html'
  controller: 'movieQualityCtrl as quality'

.controller 'movieQualityCtrl', ->
  vm = this

  vm.list = ['720p', '1080p']

  vm.select = (quality) ->
    vm.selected = quality

  return

