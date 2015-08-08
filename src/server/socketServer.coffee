'use strict'

torrentProgress = require './torrentProgress'
torrentStats    = require './torrentStats'
torrentUtils    = require './torrentUtils'

throttle = require './throttle'

module.exports = (io, torrentStore) ->

  torrentStore.on 'torrent', (infoHash, torrent) ->
    emit = (event, data = null) ->
      io.sockets.emit infoHash, event, data

    notifyProgress = ->
      emit 'download', torrentProgress(torrent.bitfield.buffer)

    notifySelection = ->
      pieceLength = torrent.torrent.pieceLength

      emit 'selection', torrent.files.map (f) ->
        start = f.offset / pieceLength | 0
        end = (f.offset + f.length - 1) / pieceLength | 0
        
        torrent.selection.some (s) ->
          s.from <= start and s.to >= end

    listen = ->
      emit 'verifying', torrentStats(torrent)

      torrent.once 'ready', ->
        emit 'ready', torrentUtils.serialize torrent

      torrent.on 'uninterested', ->
        emit 'uninterested'
        throttle notifySelection, 2000

      torrent.on 'interested', ->
        emit 'interested'
        throttle notifySelection, 2000

      interval = setInterval ->
        emit 'stats', torrentStats(torrent)
        throttle notifySelection, 2000
      , 1000

      torrent.on 'verify', throttle notifyProgress, 1000

      torrent.once 'destroyed', ->
        clearInterval interval
        emit 'destroyed'

    io.sockets.on 'connection', (socket) ->
      socket.on infoHash, (event, data) ->
        if event is 'subscribe'
          if torrent.torrent
            listen()
          else torrent.once 'verifying', listen

