'use strict'

angular.module 'com.module.core'

.factory 'torrentStore', (streamerEngine, parseTorrent, nodeFs, path, mkdirp, $q) ->

  homePath   = process.env[(if process.platform == 'win32' then 'USERPROFILE' else 'HOME')]

  storagePath = path.join homePath, '.config', 'streamer'
  storageFile = path.join storagePath, 'torrents.json'

  mkdirp storagePath, (err) ->
    if err then throw err
    
    if nodeFs.existsSync storageFile
      nodeFs.readFile storageFile, (err, data) =>
        if err then throw err

        torrents = JSON.parse data
        console.log 'resuming from previous state'
        
        torrents.forEach (infoHash) =>
          @load infoHash

  torrents = {}

  add: (link) ->
    defer = $q.defer()

    torrent = parseTorrent link

    if torrent
      infoHash = torrent.infoHash
      
      if torrents[infoHash]
        return defer.resolve infoHash
      
      console.log 'adding ' + infoHash
      
      try
        e = streamerEngine torrent
        torrents[infoHash] = e
        @save()
        defer.resolve infoHash
      catch e then defer.reject e
    else defer.reject err
      
    defer.promise

  save: ->
    mkdirp storagePath, (err) =>
      if err then throw err

      state = Object.keys(torrents).map (infoHash) ->
        infoHash
      
      nodeFs.writeFile storageFile, JSON.stringify(state), (err) ->
        if err then throw err

  shutdown: (signal) ->
    keys = Object.keys torrents
    
    if keys.length
      key = keys[0]
      torrent = torrents[key]
    
      torrent.destroy ->
        delete torrents[key]

      process.nextTick @shutdown

  get: (infoHash) ->
    torrents[infoHash]

  remove: (infoHash) ->
    torrent = torrents[infoHash]
    torrent.destroy()

    torrent.remove ->
      delete torrents[infoHash]
      @save()

  hashList: ->
    Object.keys torrents

  list: ->
    Object.keys(torrents).map (infoHash) ->
      torrents[infoHash]

  load: (infoHash) ->
    console.log 'loading ' + infoHash
    torrents[infoHash] = streamerEngine infoHash: infoHash
