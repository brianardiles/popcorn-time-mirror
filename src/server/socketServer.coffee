'use strict'

torrentProgress = require './torrentProgress'
torrentStats    = require './torrentStats'

throttle = require './throttle'

module.exports = (io, torrentStore) ->
  torrentStore.on 'torrent', (infoHash, torrent) ->

    notifyProgress = ->
      io.sockets.emit 'download', infoHash, torrentProgress(torrent.bitfield.buffer)

    notifySelection = ->
      pieceLength = torrent.torrent.pieceLength

      io.sockets.emit 'selection', infoHash, torrent.files.map (f) ->
        start = f.offset / pieceLength | 0
        end = (f.offset + f.length - 1) / pieceLength | 0
        
        torrent.selection.some (s) ->
          s.from <= start and s.to >= end

    listen = ->
      io.sockets.emit 'verifying', infoHash, torrentStats(torrent)

      torrent.once 'ready', ->
        io.sockets.emit 'ready', infoHash, torrentStats(torrent)

      torrent.on 'uninterested', ->
        io.sockets.emit 'uninterested', infoHash
        throttle notifySelection, 2000

      torrent.on 'interested', ->
        io.sockets.emit 'interested', infoHash
        throttle notifySelection, 2000

      interval = setInterval ->
        io.sockets.emit 'stats', infoHash, torrentStats(torrent)
        throttle notifySelection, 2000
      , 1000

      torrent.on 'verify', throttle notifyProgress, 1000

      torrent.once 'destroyed', ->
        clearInterval interval
        io.sockets.emit 'destroyed', infoHash

    if torrent.torrent
      listen()
    else torrent.once 'verifying', listen
