'use strict'

angular.module 'com.module.webchimera'

.directive 'wcNextVideo', ->
  restrict: 'E'
  require: '^chimerangular'
  templateUrl: 'player/views/directives/wc-next-video.html'
  scope:
    wcSrc: '='
    wcTime: '=?'
  controller: 'wcNextVideo as video'
  link: (scope, elem, attr, chimera) ->
    scope.chimera = chimera

.controller 'wcNextVideo', ($scope, $timeout, wcNextVideoService) ->
  @max = $scope.wcTime or 5000
  @current = 0
  @timer = null
  @isCompleted = false
  @currentVideo = 0
  @sources = null

  @onLoadData = (sources) ->
    @sources = sources
    $scope.chimera.sources = @sources[@currentVideo]

  @onLoadDataError = ->
    $scope.chimera.onVideoError()

  @count = ->
    @current += 10
    
    if @current >= @max
      $timeout.cancel @timer
      $scope.chimera.autoPlay = true
      @current = 0
      @isCompleted = false
      $scope.chimera.isCompleted = false
      @currentVideo++
      
      if @currentVideo == @sources.length
        @currentVideo = 0
      $scope.chimera.sources = @sources[@currentVideo]
    else
      @timer = $timeout(@count.bind(this), 10)

  @cancelTimer = ->
    $timeout.cancel @timer
    
    @current = 0
    @isCompleted = false

  @onComplete = (newVal) ->
    @isCompleted = newVal

    if newVal
      @timer = $timeout(@count.bind(this), 10)

  $scope.$watch ->
    $scope.chimera.isCompleted
  , @onComplete.bind(this)

  wcNextVideoService.loadData($scope.wcSrc).then @onLoadData.bind(this), @onLoadDataError.bind(this)
