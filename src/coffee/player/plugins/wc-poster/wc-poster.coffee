'use strict'

angular.module 'com.module.webchimera.plugins.poster', []

.directive 'wcPoster', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: { poster: '=?' }
  templateUrl: 'player/views/directives/wc-poster.html'
  link: (scope, elem, attr, chimera) ->
    scope.chimera = chimera
