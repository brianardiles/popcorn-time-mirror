'use strict'

angular.module 'com.module.core'

.constant 'streamServer', process.mainModule.exports

.factory 'socketServer', ($rootScope, $q, streamServer) ->
  class socketServer
    constructor: ->
      @queue = []
      @open()

      @callbacks = {}
      @subscribtions = {}

      @currentCallbackId = 0

    @_push: (data) ->
      { event, message, callback_id } = data

      if not callback_id
        angular.forEach @subscribtions[event], (scope) ->
          scope.$emit.apply scope, message
          scope.$digest()
      else if @callbacks[callback_id]
        $rootScope.$apply @callbacks[callback_id].cb.resolve messaege
        delete @callbacks[callback_id]
      else console.log 'unknown message receiver', event, message, callback_id

    @_isScope: (scope) ->
      angular.isObject scope and angular.isFunction scope.$emit

    @_getCallbackId: ->
      @currentCallbackId++
      if @currentCallbackId > 10000
        @currentCallbackId = 1
      @currentCallbackId

    @_send: (data) ->
      if @socket
        if @socket.readyState isnt @socket.OPEN
          @queue.push data

          if @socket.readyState is @socket.CLOSED
            @open()
       
        else 
          if angular.isString data 
            @socket.send data 
          else @socket.send JSON.stringify(data)
      else @queue.push data

    request: (data = null, response, timeout = 500) ->
      defer = $q.defer()
      callbackId = @_getCallbackId()
      
      @callbacks[callbackId] =
        time: new Date
        cb: defer
        
      data.callback_id = callbackId

      @_send data

      defer.promise

    subscribe: (event, $scope) ->
      throw new Error "No $scope for subscribtion" if not @_isScope $scope
      
      if @subscribtions.hasOwnProperty event
        @subscribtions[event].push $scope
      else @subscribtions[event] = [$scope]

      @_send subscribe: event

    unsubscribe: (event, $scope) ->
      return if not @subscribtions.hasOwnProperty event
      @subscribtions[event].filter (scope) -> scope.$id is $scope.$id
      @_send unsubscribe: event

    close: ->
      @socket.close()

    open: ->
      streamServer.start()
      @socket = new WebSocket "ws://localhost:#{streamServer.port}/ws"
      
      @socket.onopen = =>
        @flush()

      @socket.onmessage = (message) =>
        @_push JSON.parse message.data

    flush: ->
      while item = @queue.pop()
        @send item

  new socketServer()