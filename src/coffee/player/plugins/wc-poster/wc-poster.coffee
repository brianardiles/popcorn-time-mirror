'use strict'

angular.module 'com.module.webchimera.plugins.poster', []

.directive 'wcPoster', ->
  restrict: 'E'
  require: '^chimerangular'
  scope: wcUrl: '=?'
  templateUrl: 'player/views/directives/wc-poster.html'
  link: (scope, elem, attr, chimera) ->
    scope.chimera = chimera
    
    if chimera.isConfig
      scope.$watch 'chimera.config', ->
        if scope.chimera.config
          scope.wcUrl = scope.chimera.config.plugins.poster.url
