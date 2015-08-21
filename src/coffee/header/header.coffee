'use strict'

angular.module 'app.header', []

.directive 'ptHeader', ->
  restrict: 'E'
  templateUrl: 'header/header.html'
  controller: 'ptHeaderCtrl as title'

.controller 'ptHeaderCtrl', ($scope, $rootScope, titleButtons, nativeWindow, $location) ->
  vm = this

  vm.platform = process.platform
  vm.buttons = titleButtons[process.platform]

  vm.state = 
    fullscreen: false
    maximized: false

  vm.max = ->
    if nativeWindow.isFullscreen
      vm.fullscreen()
    else
      if window.screen.availHeight <= nativeWindow.height
        nativeWindow.unmaximize()
        vm.state.maximized = false
      else
        nativeWindow.maximize()
      vm.state.maximized = true

  vm.min = ->
    nativeWindow.minimize()

  vm.close = ->
    nativeWindow.close()

  vm.fullscreen = ->
    nativeWindow.toggleFullscreen()
    vm.state.fullscreen = nativeWindow.isFullscreen

  return