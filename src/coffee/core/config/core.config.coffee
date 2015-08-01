'use strict'

angular.module 'com.module.core'

.run ($rootScope, $state, $previousState) ->
  $rootScope.$state = $state

  $rootScope.goPrevious = ->
    $previousState.go()
