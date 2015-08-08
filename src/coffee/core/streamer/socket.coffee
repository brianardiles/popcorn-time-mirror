'use strict'

angular.module 'com.module.core'

.constant 'streamServer', process.mainModule.exports

.run (streamServer, torrentProvider, socketServer) ->
  streamServer.start ->
    socketServer.start()
    torrentProvider.getAllTorrents()

.factory 'socketServer', (socketFactory, streamServer) ->
  socket = io "http://127.0.0.1:#{streamServer.port}/"
  
  connection: null

  start: ->
    if not @connection 
      @connection = socketFactory ioSocket: socket
      return
    return