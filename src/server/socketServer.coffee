'use strict'

torrentProgress = require './torrentProgress'
torrentStats    = require './torrentStats'
torrentStore    = require './torrentStore'

socket = require 'express-ws'

module.exports = (express) ->
  ws = socket express
  wss = ws.getWss '/ws'

  broadcast = (args...) ->
    wss.clients.forEach (client) ->
      client.send aargs...

  torrentStore.on 'torrent', (infoHash, torrent) ->
    listen = ->
      notifyProgress = _.throttle((->
        broadcast 'download', infoHash, torrentProgress(torrent.bitfield.buffer)
      ), 1000, trailing: false)

      notifySelection = _.throttle((->
        pieceLength = torrent.torrent.pieceLength

        broadcast 'selection', infoHash, torrent.files.map (f) ->
          start = f.offset / pieceLength | 0
          end = (f.offset + f.length - 1) / pieceLength | 0
          
          torrent.selection.some (s) ->
            s.from <= start and s.to >= end

      ), 2000, trailing: false)

      broadcast 'verifying', infoHash, torrentStats(torrent)

      torrent.once 'ready', ->
        broadcast 'ready', infoHash, torrentStats(torrent)

      torrent.on 'uninterested', ->
        broadcast 'uninterested', infoHash
        notifySelection()

      torrent.on 'interested', ->
        broadcast 'interested', infoHash
        notifySelection()

      interval = setInterval ->
        broadcast 'torrentStats', infoHash, torrentStats(torrent)
        notifySelection()
      , 1000

      torrent.on 'verify', notifyProgress

      torrent.once 'destroyed', ->
        clearInterval interval
        broadcast 'destroyed', infoHash

    if torrent.torrent
      listen()
    else torrent.once 'verifying', listen
