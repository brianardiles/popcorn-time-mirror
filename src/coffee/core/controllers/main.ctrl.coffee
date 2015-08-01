'use strict'

angular.module 'com.module.core'

.constant 'titleButtons',  
  win32: ['min', 'max', 'close']
  darwin: ['close', 'min', 'max']
  linux: ['min', 'max', 'close']

.controller 'MainCtrl', ($scope, $rootScope, $state, titleButtons, nativeWindow, $location, CoreService) ->
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
    if AdvSettings.get('minimizeToTray')
      minimizeToTray()
    else nativeWindow.minimize()

  vm.close = ->
    nativeWindow.close()

  vm.fullscreen = ->
    nativeWindow.toggleFullscreen()
    vm.state.fullscreen = nativeWindow.isFullscreen

  return

.filter 'getQuality', ->
  (links) ->
    q720 = links["720p"] 
    q1080 = links["1080p"]

    if q720 && q1080
        return '720p/1080p'
    else if q1080
        return '1080p'
    else if q720
        return '720p'
    else 'HDRip'
