'use strict'

angular.module 'com.module.common'

.directive 'ptPlayerChooser', ->
  scope: { torrent: '=', episodeid: '=' , episode: '=', season: '=' , quality: '=' , title: '=' }
  templateUrl: 'common/views/player-chooser.html'
  controller: 'playerSelectController as devices'

.controller 'playerSelectController', (Settings) ->
  vm = this

  vm.items = Settings.avaliableDevices

  vm.toggleMenu = ($event) ->
    $event.stopPropagation()
    vm.menuOpen = !vm.menuOpen

  vm.setItem = (item, $event) ->
    vm.toggleMenu $event
    Settings.chosenPlayer = vm.selected = item
    
  if not vm.selected
    vm.selected = Settings.chosenPlayer

  return