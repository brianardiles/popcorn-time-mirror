'use strict'

torrentProgress = require './torrentProgress'
torrentStats    = require './torrentStats'

socket = require 'express-ws'
throttle = require './throttle'

module.exports = (express, torrentStore) ->
  ws = socket express

  broadcast = (args...) ->
    wss = ws.getWss '/ws'

    if wss
      wss.clients.forEach (client) ->
        client.send args...

  torrentStore.on 'torrent', (infoHash, torrent) ->

    notifyProgress = ->
      broadcast 'download', infoHash, torrentProgress(torrent.bitfield.buffer)

    notifySelection = ->
      pieceLength = torrent.torrent.pieceLength

      broadcast 'selection', infoHash, torrent.files.map (f) ->
        start = f.offset / pieceLength | 0
        end = (f.offset + f.length - 1) / pieceLength | 0
        
        torrent.selection.some (s) ->
          s.from <= start and s.to >= end

    listen = ->
      broadcast 'verifying', infoHash, torrentStats(torrent)

      torrent.once 'ready', ->
        broadcast 'ready', infoHash, torrentStats(torrent)

      torrent.on 'uninterested', ->
        broadcast 'uninterested', infoHash
        throttle notifySelection, 2000

      torrent.on 'interested', ->
        broadcast 'interested', infoHash
        throttle notifySelection, 2000

      interval = setInterval ->
        broadcast 'torrentStats', infoHash, torrentStats(torrent)
        throttle notifySelection, 2000
      , 1000

      torrent.on 'verify', throttle notifyProgress, 1000

      torrent.once 'destroyed', ->
        clearInterval interval
        broadcast 'destroyed', infoHash

    if torrent.torrent
      listen()
    else torrent.once 'verifying', listen
