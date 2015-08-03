'use strict'

angular.module 'com.module.core'

.factory 'socketServer', ($rootScope) ->
  class socketServer
    constructor: ->
      @queue = []
      @open()
      
    push: (message, id) ->
      console.log id, message

    @_send: (data) ->
      if angular.isString data 
        @socket.send data 
      else @socket.send JSON.stringify(data)

    send: (data) ->
      if @socket
        if @socket.readyState isnt @socket.OPEN
          @queue.push data

          if @socket.readyState is @socket.CLOSED
            @open()
       
        else @_send data
      else @queue.push data

    close: ->
      @socket.close()

    open: ->
      @socket = new WebSocket "ws://localhost:#{@port}/ws"
      
      @socket.onopen = =>
        @flush()

      @socket.onmessage = (message) =>
        $rootScope.$apply =>
          @push JSON.parse message.data

    flush: ->
      while item = @queue.pop()
        @send item

  new socketServer()