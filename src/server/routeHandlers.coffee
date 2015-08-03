'use strict'

fs          = require 'fs'
rangeParser = require 'range-parser'
url         = require 'url'
mime        = require 'mime'
pump        = require 'pump'

serializeFiles = (torrent) ->
  torrentFiles = torrent.files
  pieceLength = torrent.torrent.pieceLength
    
  torrentFiles.map (f) ->
    start = f.offset / pieceLength | 0
    end = (f.offset + f.length - 1) / pieceLength | 0
    
    name: f.name
    path: f.path
    link: '/torrents/' + torrent.infoHash + '/files/' + encodeURIComponent(f.path)
    length: f.length
    offset: f.offset
    selected: torrent.selection.some (s) ->
      s.from <= start and s.to >= end

serialize = (torrent) ->
  if !torrent.torrent
    return { infoHash: torrent.infoHash }

  infoHash: torrent.infoHash
  name: torrent.torrent.name
  interested: torrent.amInterested
  ready: torrent.ready
  files: serializeFiles torrent
  progress: torrentProgress torrent.bitfield.buffer

module.exports = (torrentStore) ->
  getM3UPlaylist: (req, res) ->
    torrent = req.torrent

    res.setHeader 'Content-Type', 'application/x-mpegurl; charset=utf-8'

    res.send '#EXTM3U\n' + torrent.files.map((f) ->
      '#EXTINF:-1,' + f.path + '\n' + req.protocol + '://' + req.get('host') + '/torrents/' + torrent.infoHash + '/files/' + encodeURIComponent(f.path)
    ).join('\n')

  stopTorrent: (req, res) ->
    index = parseInt(req.params.index)
    
    if index >= 0 and index < req.torrent.files.length
      req.torrent.files[index].deselect()
    else
      req.torrent.files.forEach (f) ->
        f.deselect()

    res.send 200

  startTorrent: (req, res) ->
    index = parseInt(req.params.index)

    if index >= 0 and index < req.torrent.files.length
      req.torrent.files[index].select()
    else
      req.torrent.files.forEach (f) ->
        f.select()

    res.send 200

  addTorrent: (req, res) ->
    torrentStore.add req.body.link, (err, infoHash) ->
      if err
        res.send 500, err
      else res.send infoHash: infoHash

  uploadTorrent: (req, res) ->
    file = req.files and req.files.file

    if !file
      return res.send(500, 'file is missing')

    torrentStore.add file.path, (err, infoHash) ->
      if err res.send 500, err
      else res.send infoHash: infoHash

      fs.unlink file.path

  getAllTorrents: (req, res) ->
    res.send torrentStore.list().map(serialize)

  getTorrent: (req, res) ->
    res.send serialize(req.torrent)

  pauseSwarm: (req, res) ->
    req.torrent.swarm.pause()
    res.send 200

  torrentStats: (req, res) ->
    res.send stats(req.torrent)

  deleteTorrent: (req, res) ->
    torrentStore.remove req.torrent.infoHash
    res.send 200

  resumeSwarm: (req, res) ->
    req.torrent.swarm.resume()
    res.send 200

  streamTorrent: (req, res) ->
    torrent = req.torrent
    file = _.find(torrent.files, path: req.params.path)

    if !file
      return res.send(404)

    if typeof req.query.ffmpeg != 'undefined'
      return require('./ffmpeg')(req, res, torrent, file)

    if torrent.ready
      onReady()
    else torrent.once 'ready', onReady
 
    onReady = ->
      index = Number pathname.slice(1)
      
      if Number.isNaN(index) or index >= torrent.files.length
        res.send 404
        return res.end '404 Not Found'
      
      file = torrent.files[index]
      
      res.setHeader 'Accept-Ranges', 'bytes'
      res.setHeader 'Content-Type', mime.lookup(file.name)
      res.send 200
      
      # Support DLNA streaming
      res.setHeader 'transferMode.dlna.org', 'Streaming'
      res.setHeader 'contentFeatures.dlna.org', 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000'

      if req.headers.range
        res.statusCode = 206
        range = rangeParser(file.length, req.headers.range)[0]
        res.setHeader 'Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + file.length
        res.setHeader 'Content-Length', range.end - (range.start) + 1
      else res.setHeader 'Content-Length', file.length
      
      if req.method == 'HEAD'
        res.end()

      pump file.createReadStream(range), res