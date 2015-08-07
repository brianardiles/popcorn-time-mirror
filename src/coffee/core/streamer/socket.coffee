'use strict'

angular.module 'com.module.core'

.constant 'streamServer', process.mainModule.exports

.run (streamServer, torrentProvider, socketServer) ->
  streamServer.start ->
    socketServer.start()
    torrentProvider.getAllTorrents()

.factory 'socketServer', ($rootScope, $q, socketFactory, streamServer, torrentProvider) ->
  socket = io "http://127.0.0.1:#{streamServer.port}/", port: streamServer.port
  
  connection = socketFactory ioSocket: socket
  started = false

  start: ->
    if not started 

      started = true
      connection.on 'verifying', (hash) ->
        torrentProvider.getTorrent(hash).then (torrent) ->
          torrent.ready = false

      connection.on 'message', (data) ->
        console.log data

      connection.on 'ready', (hash) ->
        torrentProvider._loadTorrent hash

      connection.on 'interested', (hash) ->
        torrentProvider.getTorrent(hash).then (torrent) ->
          torrent.interested = true

      connection.on 'uninterested', (hash) ->
        torrentProvider.getTorrent(hash).then (torrent) ->
          torrent.interested = false

      connection.on 'stats', (hash, stats) ->
        torrentProvider.getTorrent(hash).then (torrent) ->
          torrent.stats = stats

      connection.on 'download', (hash, progress) ->
        torrentProvider.getTorrent(hash).then (torrent) ->
          torrent.progress = progress

      connection.on 'selection', (hash, selection) ->
        torrentProvider.getTorrent(hash).then (torrent) ->
          i = 0

          while i < torrent.files.length
            file = torrent.files[i]
            file.selected = selection[i]
            i++

      connection.on 'destroyed', (hash) ->
        delete vm.data[hash]

      connection.on 'disconnect', ->
        vm.data = []

      connection.on 'connect', torrentProvider.getAllTorrents

      return
    return
