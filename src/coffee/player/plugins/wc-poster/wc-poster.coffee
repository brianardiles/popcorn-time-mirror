'use strict'

angular.module 'com.module.webchimera.plugins.poster', []

.directive 'wcPoster', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: {}
  templateUrl: 'player/views/directives/wc-poster.html'
  link: (scope, elem, attr, chimera) ->
    scope.chimera = chimera
    
    scope.$watch 'chimera.config.poster', ->
      if scope.chimera.config
        scope.wcUrl = scope.chimera.config.poster
