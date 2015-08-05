'use strict'

angular.module 'com.module.webchimera'

.controller 'wcController', ($scope, $window, wcConfigLoader, wcFullscreen, WC_UTILS, WC_STATES, WC_VOLUME_KEY) ->
  isFullScreenPressed = false
  isMetaDataLoaded = false

  # PUBLIC $chimera
  @chimerangularElement = null

  @clearMedia = ->
    @wcjsElement.src = ''
    return

  @onCanPlay = (evt) ->
    @isBuffering = false
    $scope.$apply $scope.wcCanPlay($event: evt)

  @onVideoReady = ->
    @isReady = true
    @autoPlay = $scope.wcAutoPlay
    @playsInline = $scope.wcPlaysInline
    @cuePoints = $scope.wcCuePoints
    @currentState = WC_STATES.STOP

    isMetaDataLoaded = true
    
    #Set media volume from localStorage if available
    if WC_UTILS.supportsLocalStorage()
      #Default to 100% volume if local storage setting does not exist.
      @setVolume parseFloat($window.localStorage.getItem(WC_VOLUME_KEY) or '100')
    
    if $scope.wcConfig
      wcConfigLoader.loadConfig($scope.wcConfig).then @onLoadConfig.bind(this)
    else $scope.wcPlayerReady $chimera: this

    $scope.$apply()

  @onLoadConfig = (config) ->
    @config = config

    $scope.wcAutoPlay = @config.autoPlay
    $scope.wcPlaysInline = @config.playsInline
    $scope.wcCuePoints = @config.cuePoints
    $scope.wcPlayerReady $chimera: this

  @onLoadMetaData = (evt) ->
    @isBuffering = false
    @onUpdateTime evt
    return

  @onUpdateTime = (time) ->
    @isBuffering = false
    @currentTime = time

    if @wcjsElement.length != 0
      @totalTime = @wcjsElement.length
      @timeLeft = (@wcjsElement.length - time)
      @isLive = false
    else
      # It's a live streaming without and end
      @isLive = true
    if @cuePoints
      @checkCuePoints time
    
    $scope.wcUpdateTime
      $currentTime: time
      $duration: @wcjsElement.length
    
    $scope.$apply()

  @checkCuePoints = (currentTime) ->
    for tl of @cuePoints
      i = 0
      l = @cuePoints[tl].length
      
      while i < l
        cp = @cuePoints[tl][i]
      
        # If timeLapse.end is not defined we set it as 1 second length
        if !cp.timeLapse.end
          cp.timeLapse.end = cp.timeLapse.start + 1
      
        if currentTime < cp.timeLapse.end
          cp.$$isCompleted = false
      
        # Check if we've been reached to the cue point
        if currentTime > cp.timeLapse.start
          cp.$$isDirty = true
      
          # We're in the timelapse
          if currentTime < cp.timeLapse.end
            if cp.onUpdate
              cp.onUpdate currentTime, cp.timeLapse, cp.params
      
          # We've been passed the cue point
          if currentTime >= cp.timeLapse.end
            if cp.onComplete and !cp.$$isCompleted
              cp.$$isCompleted = true
              cp.onComplete currentTime, cp.timeLapse, cp.params
        else
          if cp.onLeave and cp.$$isDirty
            cp.onLeave currentTime, cp.timeLapse, cp.params
      
          cp.$$isDirty = false
      
        i++

    return

  @getState = ->
    switch @wcjsElement.state
      when 0 then 'idle'
      when 1 then 'opening'
      when 2 then 'buffering'
      when 3 then 'playing'
      when 4 then 'paused'
      when 5 then 'stopping'
      when 6 then 'ended'
      when 7 then 'error'

  @onPlay = ->
    @setState WC_STATES.PLAY
    $scope.$apply()
    return

  @onPause = ->
    if @wcjsElement.time == 0
      @setState WC_STATES.STOP
    else
      @setState WC_STATES.PAUSE
    
    $scope.$apply()
    return

  @onVolumeChange = ->
    @volume = @wcjsElement.volume
    
    $scope.$apply()
    return

  @onPlaybackChange = ->
    @playback = @wcjsElement.playbackRate
    
    $scope.$apply()
    return

  @seekTime = (value, byPercent) ->
    second = undefined
    
    if byPercent
      second = value * @wcjsElement.length / 100
      @wcjsElement.time = 1000 * second
    else
      second = value
      console.log 1000 * second
      @wcjsElement.time = 1000 * second
    
    @currentTime = 1000 * second
    return

  @playPause = ->
    console.log @wcjsElement
    if @getState() is 'paused'
      @play()
    else @pause()

    return

  @setState = (newState) ->
    if newState and newState != @currentState
      $scope.wcUpdateState $state: newState
      @currentState = newState
    
    @currentState

  @play = ->
    @wcjsElement.play()
    @setState WC_STATES.PLAY
    return

  @pause = ->
    @wcjsElement.pause()
    @setState WC_STATES.PAUSE
    return

  @stop = ->
    if @wcjsElement
      @wcjsElement.pause()
      @wcjsElement.time = 0
    
    @currentTime = 0
    @setState WC_STATES.STOP
    return

  @toggleFullScreen = ->
    # There is no native full screen support or we want to play inline
    if !wcFullscreen.isAvailable or $scope.wcPlaysInline
      if @isFullScreen
        @chimerangularElement.removeClass 'fullscreen'
        @chimerangularElement.css 'z-index', 'auto'
      else
        @chimerangularElement.addClass 'fullscreen'
        @chimerangularElement.css 'z-index', WC_UTILS.getZIndex()
      @isFullScreen = !@isFullScreen
    else
      if @isFullScreen
        wcFullscreen.exit()
      else @enterElementInFullScreen @chimerangularElement[0]

    return

  @enterElementInFullScreen = (element) ->
    wcFullscreen.request element
    return

  @changeSource = (newValue) ->
    $scope.wcChangeSource $source: newValue
    return

  @setVolume = (newVolume) ->
    $scope.wcUpdateVolume $volume: newVolume
    @wcjsElement.volume = newVolume
    @volume = newVolume
    
    #Push volume updates to localStorage so that future instances resume volume
    if WC_UTILS.supportsLocalStorage()
      #TODO: Improvement: concat key with current page or "video player id" to create separate stored volumes.
      $window.localStorage.setItem WC_VOLUME_KEY, newVolume.toString()
    return

  @setPlayback = (newPlayback) ->
    $scope.wcUpdatePlayback $playBack: newPlayback
    @wcjsElement.input.rate = parseFloat newPlayback
    @playback = newPlayback
    return

  @onStartBuffering = (event) ->
    @isBuffering = true
    $scope.$apply()
    return

  @onStartPlaying = (event) ->
    @setState WC_STATES.PLAY
    @isBuffering = false
    $scope.$apply()
    return

  @onComplete = (event) ->
    $scope.wcComplete()
    @setState WC_STATES.STOP
    @isCompleted = true
    $scope.$apply()
    return

  @onVideoError = (event) ->
    $scope.wcError $event: event
    return

  @addListeners = ->
    #@wcjsElement.events.on 'canplay', @onCanPlay.bind(this), false
    #@wcjsElement.events.on 'loadedmetadata', @onLoadMetaData.bind(this), false
    #@wcjsElement.events.on 'play', @onPlay.bind(this), false
    #@wcjsElement.events.on 'volumechange', @onVolumeChange.bind(this), false
    #@wcjsElement.events.on 'playbackchange', @onPlaybackChange.bind(this), false

    #@wcjsElement.onFrameSetup =  
    #@wcjsElement.onFrameReady =  
    #@wcjsElement.onFrameCleanup =  

    #@wcjsElement.onMediaChanged =  
    #@wcjsElement.onNothingSpecial =  
    @wcjsElement.onOpening = @onCanPlay.bind(this) 
    @wcjsElement.onBuffering = @onStartBuffering.bind(this)
    @wcjsElement.onPlaying = @onStartPlaying.bind(this)
    @wcjsElement.onPaused = @onPause.bind(this)
    #@wcjsElement.onForward =  
    #@wcjsElement.onBackward =  
    @wcjsElement.onEncounteredError = @onVideoError.bind(this)
    @wcjsElement.onEndReached = @onComplete.bind(this)
    #@wcjsElement.onStopped =  

    @wcjsElement.onTimeChanged = @onUpdateTime.bind(this)
    #@wcjsElement.onPositionChanged =  
    @wcjsElement.onSeekableChanged = ->
      console.log 'seekable'
    #@wcjsElement.onPausableChanged =  
    #@wcjsElement.onLengthChanged =  

    return

  @init = ->
    @isReady = false
    @isCompleted = false
    @currentTime = 0
    @totalTime = 0
    @timeLeft = 0
    @isLive = false
    @isFullScreen = false
    @isConfig = $scope.wcConfig != undefined
    
    if wcFullscreen.isAvailable
      @isFullScreen = wcFullscreen.isFullScreen()
    
    @addBindings()

    if wcFullscreen.isAvailable
      document.addEventListener wcFullscreen.onchange, @onFullScreenChange.bind(this)
    
    return

  @onUpdateAutoPlay = (newValue) ->
    if newValue and !@autoPlay
      @autoPlay = newValue
      @play this
    return

  @onUpdatePlaysInline = (newValue) ->
    @playsInline = newValue
    return

  @onUpdateCuePoints = (newValue) ->
    @cuePoints = newValue
    @checkCuePoints @currentTime
    return

  @addBindings = ->
    $scope.$watch 'wcAutoPlay', @onUpdateAutoPlay.bind(this)
    $scope.$watch 'wcPlaysInline', @onUpdatePlaysInline.bind(this)
    $scope.$watch 'wcCuePoints', @onUpdateCuePoints.bind(this)
    return

  @onFullScreenChange = (event) ->
    @isFullScreen = wcFullscreen.isFullScreen()
    $scope.$apply()
    return

  # Empty wcjsElement on destroy to avoid that Chrome downloads video even when it's not present
  $scope.$on '$destroy', @clearMedia.bind(this)
  
  # Empty wcjsElement when router changes
  $scope.$on '$routeChangeStart', @clearMedia.bind(this)
  
  @init()
  
  return

