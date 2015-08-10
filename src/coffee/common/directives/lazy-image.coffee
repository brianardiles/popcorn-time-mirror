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

.directive 'ptLazyScroll', (lazyLoader) ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    container = lazyLoader.setContainer element

    scope.$on '$destroy', -> container()

.factory 'lazyLoader', ($document, $timeout, $interval) ->
  do ->
    # maintain a list of images that lazy-loading
    # and have yet to be rendered.
    images = []

    # define the render timer for the lazy loading
    # images to that the DOM-querying (for offsets)
    # is chunked in groups.
    renderTimer = null
    renderDelay = 100

    # the container element as a reference.
    container = null

    # cache the document document height so that
    # we can respond to changes in the height due to
    # dynamic content.
    doc = $document

    documentHeight = doc.clientHeight
    documentTimer = null
    documentDelay = 2000

    # determine if the container dimension events
    # (ie. resize, scroll) are currenlty being
    # monitored for changes.
    isWatchingContainer = false

    # start monitoring the given image for visibility
    # and then render it when necessary.
    addImage = (image) ->
      images.push image

      if not renderTimer
        startRenderTimer()

      if not isWatchingContainer
        startWatchingContainer()

      return

    # remove the given image from the render queue.
    removeImage = (image) ->
      # Remove the given image from the render queue.
      i = 0

      while i < images.length
        if images[i] is image
          images.splice i, 1
          break
        i++
     
      # destroy image constructor
      image.destroy()

      # If removing the given image has cleared the
      # render queue, then we can stop monitoring
      # the container and the image queue.
      if not images.length
        clearRenderTimer()
        stopWatchingContainer()

      return

    # check the document height to see if it's changed.
    checkDocumentHeight = ->
      # If the render time is currently active, then
      # don't bother getting the document height -
      # it won't actually do anything.
      if renderTimer
        return

      currentDocumentHeight = doc.clientHeight

      # If the height has not changed, then ignore -
      # no more images could have come into view.
      if currentDocumentHeight is documentHeight
        return

      # Cache the new document height.
      documentHeight = currentDocumentHeight

      startRenderTimer()

      return

    # check the lazy-load images that have yet to
    # be rendered.
    checkImages = ->
      if images.length 
        visible = []
        hidden = []
        cont = angular.element(container)
        console.log cont
        # Determine the containers dimensions.
        containerHeight = cont[0].clientHeight
        scrollTop = cont[0].scrollTop

        # Calculate the viewport offsets.
        topFoldOffset = scrollTop
        console.log topFoldOffset + containerHeight, cont[0].scrollTop, cont[0].clientHeight
        bottomFoldOffset = topFoldOffset + containerHeight

        # Query the DOM for layout and seperate the
        # images into two different categories: those
        # that are now in the viewport and those that
        # still remain hidden.
        i = 0

        while i < images.length
          image = images[i]
          if image.isVisible(topFoldOffset, bottomFoldOffset)
            visible.push image
          else hidden.push image
          i++

        # Update the DOM with new image source values.
        i = 0

        while i < visible.length
          visible[i].render()
          i++

        # Keep the still-hidden images as the new
        # image queue to be monitored.
        images = hidden

        # Clear the render timer so that it can be set
        # again in response to container changes.
        clearRenderTimer()

        # If we've rendered all the images, then stop
        # monitoring the container for changes.
        if not images.length
          stopWatchingContainer()
        
        return

    setContainer = (element) ->
      container = element

      -> 
        stopWatchingContainer()

        @

    # clear the render timer so that we can easily
    # check to see if the timer is running.
    clearRenderTimer = ->
      $timeout.cancel renderTimer
      renderTimer = null

    # start the render time, allowing more images to
    # be added to the images queue before the render
    # action is executed.
    startRenderTimer = ->
      renderTimer = $timeout checkImages, renderDelay

    # start watching the container for changes in dimension.
    startWatchingContainer = ->
      isWatchingContainer = true
      
      # Listen for container changes.
      container.on 'scroll', containerChanged

      # Set up a timer to watch for document-height changes.
      documentTimer = $interval checkDocumentHeight, documentDelay
     
    # stop watching the container for changes in dimension.

    stopWatchingContainer = ->
      isWatchingContainer = false

      # Stop watching for container changes.
      container.off 'scroll', containerChanged

      # Stop watching for document changes.
      $interval.cancel documentTimer

    # start the render time if the container changes.
    containerChanged = ->
      if not renderTimer
        startRenderTimer()

    setContainer: setContainer
    addImage: addImage
    removeImage: removeImage
    checkElements: -> checkImages()

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
