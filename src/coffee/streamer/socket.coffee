'use strict'

angular.module 'app.streamer'

.constant 'streamServer', process.mainModule.exports

.run (streamServer, torrentProvider, socketServer) ->
  streamServer.start ->
    socketServer.start().then ->
      torrentProvider.getAllTorrents()

.factory 'socketServer', (socketFactory, streamServer, $q) ->

  connection: null

  start: ->
    if not @connection 
      @connection = socketFactory ioSocket: io "http://127.0.0.1:#{streamServer.port}/"
    $q.when()