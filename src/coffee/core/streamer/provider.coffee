'use strict'

angular.module 'com.module.common'

.factory 'torrentResource', (socketServer) ->
  class torrentResource
    constructor: (torrent) ->
      angular.extend @, torrent

      @connection = socketServer.connection

      @connection.on torrent.infoHash, (event, data) ->
        switch event 
          when 'verifying' then @ready = false
          when 'ready' then angular.extend @, data
          when 'interested' then @interested = true
          when 'uninterested' then @interested = false
          when 'stats' then @stats = data
          when 'download' then @progress = data
          when 'selection' then @files[i].selected = true

    listen: ->
      @connection.emit @infoHash, 'subscribe'

    destroy: ->
      # TODO add deconstructor
      @connection.emit @infoHash, 'unsubscribe'

.factory 'torrentProvider', ($http, $q, streamServer, torrentResource) ->
  data = {}

  getAllTorrents: -> 
    $http.get "http://127.0.0.1:#{streamServer.port}/torrents/"
      .success (torrents) ->
        for index, torrent of torrents
          data[index] = new torrentResource torrent

  getTorrent: (hash) ->
    torrent = data[hash]
    
    if torrent
      $q.when torrent
    else 
      data[hash] = new torrentResource infoHash: hash
      $q.when data[hash]

  addTorrentLink: (link) ->
    if link
      $http.post "http://127.0.0.1:#{streamServer.port}/torrents/", link: link
        .success (resp) -> data[resp.infoHash] = new torrentResource resp
    else $q.reject()
