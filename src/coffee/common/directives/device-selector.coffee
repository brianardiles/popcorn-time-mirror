'use strict'

angular.module 'com.module.common'

.directive 'ptDeviceSelector', ->
  scope: { selected: '=' }
  bindToController: true
  templateUrl: 'common/views/device-selector.html'
  controller: 'deviceSelectController as devices'

.controller 'deviceSelectController', (Settings) ->
  vm = this

  vm.items = Settings.avaliableDevices

  vm.toggleMenu = ($event) ->
    $event.stopPropagation()
    vm.menuOpen = !vm.menuOpen

  vm.setItem = (item, $event) ->
    vm.toggleMenu $event
    Settings.chosenPlayer = vm.selected = item
    
  return