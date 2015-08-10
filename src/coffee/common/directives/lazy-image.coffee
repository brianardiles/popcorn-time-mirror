'use strict'

angular.module 'com.module.common'

.factory 'LazyImageService', ($window, $document) ->
  class LazyImageService 
    constructor: (@element) ->
      @source = null
      @isRendered = false
      @height = null

      if @element[0]
        @element = @element[0]

    isVisible: (topFoldOffset, bottomFoldOffset) ->
      if height == null
        height = @element.offsetHeight
      top = @element.offsetTop
      bottom = top + height

      console.log bottomFoldOffset, topFoldOffset #wrong offsets

      top <= bottomFoldOffset and top >= topFoldOffset or bottom <= bottomFoldOffset and bottom >= topFoldOffset or top <= topFoldOffset and bottom >= bottomFoldOffset

    render: ->
      @isRendered = true
      @renderSource()
      return

    setSource: (newSource) ->
      @source = newSource

      if @isRendered
        @renderSource()
      return

    renderSource: ->
      @element.src = @source
      return

.factory 'lazyLoader', ($window, $document) ->
  do ->
    images = []

    renderTimer = null
    renderDelay = 100

    win = $window
    doc = angular.element($document)

    documentHeight = doc.clientHeight
    documentTimer = null
    documentDelay = 2000

    isWatchingWindow = false

    checkDocumentHeight = ->
      if renderTimer
        return

      currentDocumentHeight = doc.clientHeight
      if currentDocumentHeight == documentHeight
        return
      documentHeight = currentDocumentHeight
      startRenderTimer()

    checkImages = ->
      console.log 'Checking for visible images...'

      visible = []
      hidden = []
      
      windowHeight = win.innerHeight
      topFoldOffset = win.scrollTop
      bottomFoldOffset = topFoldOffset + windowHeight
      
      i = 0
      
      while i < images.length
        image = images[i]
      
        if image.isVisible(topFoldOffset, bottomFoldOffset)
          visible.push image
        else hidden.push image
        i++
      
      i = 0
      
      while i < visible.length
        visible[i].render()
        i++
      
      images = hidden
      clearRenderTimer()
      
      if !images.length
        stopWatchingWindow()
      
      return

    clearRenderTimer = ->
      clearTimeout renderTimer
      renderTimer = null
      return

    startRenderTimer = ->
      renderTimer = setTimeout(checkImages, renderDelay)
      return

    startWatchingWindow = ->
      isWatchingWindow = true

      angular.element(win).on 'resize', windowChanged
      angular.element(win).on 'scroll', windowChanged

      documentTimer = setInterval(checkDocumentHeight, documentDelay)
      return

    stopWatchingWindow = ->
      isWatchingWindow = false

      angular.element(win).off 'resize'
      angular.element(win).off 'scroll'

      clearInterval documentTimer
      return

    windowChanged = ->
      if !renderTimer
        startRenderTimer()
      return

    addImage: (image) ->
      images.push image

      if !renderTimer
        startRenderTimer()

      if !isWatchingWindow
        startWatchingWindow()

    removeImage: (image) ->
      i = 0

      while i < images.length
        if images[i] == image
          images.splice i, 1
          break
        i++

      if !images.length
        clearRenderTimer()
        stopWatchingWindow()
      return

.directive 'ptLazySrc', (LazyImageService, lazyLoader) ->
  restrict: 'A'
  link: ($scope, element, attributes) ->
    lazyImage = new LazyImageService element
    lazyLoader.addImage lazyImage

    attributes.$observe 'ptLazySrc', (newSource) ->
      lazyImage.setSource newSource
      return
    
    $scope.$on '$destroy', ->
      lazyLoader.removeImage lazyImage
      return
