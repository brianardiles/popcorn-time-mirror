'use strict'

angular.module 'app.detail'

.directive 'ptQualitySelector', ->
  restrict: 'A'
  scope: { torrents: '=', selected: '=' }
  bindToController: true
  templateUrl: 'detail/views/quality-selector.html'
  controller: 'qualityCtrl as quality'

.controller 'qualityCtrl', ->
  vm = this

  vm.list = ['480p', '720p', '1080p']

  vm.select = (quality) ->
    vm.selected = quality

  vm.selected = '0' unless vm.selected

  return
