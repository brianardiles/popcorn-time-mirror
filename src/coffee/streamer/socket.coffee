'use strict'

angular.module 'app.streamer'

.value 'serverPort', require('ipc').sendSync 'get-port'

.run (torrentProvider, socketServer, serverPort) ->
  socketServer.start().then ->
    torrentProvider.getAllTorrents()

.factory 'socketServer', (socketFactory, $q, serverPort) ->
  connection: null

  start: ->
    if not @connection 
      @connection = socketFactory ioSocket: io "http://127.0.0.1:#{serverPort}/"
    $q.when()