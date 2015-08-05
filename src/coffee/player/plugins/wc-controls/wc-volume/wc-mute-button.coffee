'use strict'

angular.module 'com.module.webchimera.plugins.controls'

.directive 'wcMuteButton', ->
    restrict: 'E'
    require: '^chimerangular'
    templateUrl: 'player/views/directives/wc-mute-button.html'
    link: (scope, elem, attr, chimera) ->
      isMuted = false
      
      UP = 38
      DOWN = 40
      CHANGE_PER_PRESS = 0.05

      scope.onClickMute = ->
        if isMuted
          scope.currentVolume = scope.defaultVolume
        else
          scope.currentVolume = 0
          scope.muteIcon = mute: true
        
        isMuted = !isMuted
        chimera.setVolume scope.currentVolume

      scope.onMuteButtonFocus = ->
        scope.volumeVisibility = 'visible'

      scope.onMuteButtonLoseFocus = ->
        scope.volumeVisibility = 'hidden'

      scope.onMuteButtonKeyDown = (event) ->
        currentVolume = if chimera.volume != null then chimera.volume else 1
        newVolume = undefined
        
        if event.which == UP or event.keyCode == UP
          newVolume = currentVolume + CHANGE_PER_PRESS
        
          if newVolume > 1
            newVolume = 1
        
          chimera.setVolume newVolume
          event.preventDefault()
        else if event.which == DOWN or event.keyCode == DOWN
          newVolume = currentVolume - CHANGE_PER_PRESS
        
          if newVolume < 0
            newVolume = 0
        
          chimera.setVolume newVolume
          event.preventDefault()

      scope.onSetVolume = (newVolume) ->
        scope.currentVolume = newVolume
        isMuted = scope.currentVolume == 0
        
        # if it's not muted we save the default volume
        if !isMuted
          scope.defaultVolume = newVolume
        else
          # if was muted but the user changed the volume
          if newVolume > 0
            scope.defaultVolume = newVolume
        
        percentValue = Math.round(newVolume * 100)
        
        if percentValue == 0
          scope.muteIcon = mute: true
        else if percentValue > 0 and percentValue < 25
          scope.muteIcon = level0: true
        else if percentValue >= 25 and percentValue < 50
          scope.muteIcon = level1: true
        else if percentValue >= 50 and percentValue < 75
          scope.muteIcon = level2: true
        else if percentValue >= 75
          scope.muteIcon = level3: true

      scope.defaultVolume = 1
      scope.currentVolume = scope.defaultVolume
      scope.muteIcon = level3: true
      
      #Update the mute button on initialization, then watch for changes
      scope.onSetVolume chimera.volume

      scope.$watch ->
        chimera.volume
      , (newVal, oldVal) ->
        if newVal != oldVal
          scope.onSetVolume newVal
