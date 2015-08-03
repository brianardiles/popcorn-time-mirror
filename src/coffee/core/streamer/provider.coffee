'use strict'

angular.module 'com.module.common'

.factory 'torrentProvider', (socketServer, $q) ->

  getAllTorrentHashs: ->
    #torrentStore.hashList()
    $q.when angular.noop()

  getAllTorrents: ->
    $q.when angular.noop()

  addTorrentLink: (link) ->
    #torrentStore.add link
    $q.when angular.noop()

  uploadTorrent: (files) ->
    angular.noop()

  setStreamTorrent: (torrent) ->
    $q.when()

  getTorrent: (hash) ->
    #torrentStore.get hash
    $q.when angular.noop()

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

  getStats: (hash) ->
    $q.when()
    
  getM3UPlaylist: (hash) ->
    $q.when()