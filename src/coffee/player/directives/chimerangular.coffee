'use strict'

angular.module 'com.module.webchimera'

.directive 'chimerangular', ->
  restrict: 'EA'
  scope:
    wcTheme: '=?'
    wcAutoPlay: '=?'
    wcPlaysInline: '=?'
    wcCuePoints: '=?'
    wcConfig: '@'
    wcCanPlay: '&'
    wcComplete: '&'
    wcUpdateVolume: '&'
    wcUpdatePlayback: '&'
    wcUpdateTime: '&'
    wcUpdateState: '&'
    wcPlayerReady: '&'
    wcChangeSource: '&'
    wcError: '&'
  controller: 'wcController'
  controllerAs: 'chimera'
  link: 
    pre: (scope, elem, attr, controller) ->
      controller.chimerangularElement = angular.element elem
