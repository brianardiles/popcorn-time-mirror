'use strict'

angular.module 'com.module.common'

.factory 'torrentProvider', ($resource, $q, streamServer) ->
  data = {}

  Torrent = $resource "http://127.0.0.1:#{streamServer.port}/torrents/:infoHash"

  getAllTorrents: -> Torrent.get

  _loadTorrent: (hash) ->
    Torrent.get(infoHash: hash).$promise.then (torrent) ->
      data[hash] = torrent
      
      torrent

  getTorrent: (hash) ->
    torrent = data[hash]
    
    if torrent
      $q.when torrent
    else @_loadTorrent hash

  addTorrentLink: (link) ->
    if link
      Torrent.save(link: link).$promise.then (torrent) =>
        @_loadTorrent torrent.infoHash
    else $q.reject()

  startTorrent: (hash, index) ->
    $q.when()

  stopTorrent: (hash, index) ->
    $q.when()

  pauseSwarm: (hash) ->
    $q.when()

  resumeSwarm: (hash) ->
    $q.when()

  deleteTorrent: (hash) ->
    $q.when()

  getM3UPlaylist: (hash) ->
    $q.when()

  uploadTorrent: (files) ->
    $q.when()