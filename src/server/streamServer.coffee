'use strict'

bodyParser    = require 'body-parser'
express       = require 'express'
socket        = require 'socket.io'
http          = require 'http'
torrentStore  = require './torrentStore'

port = process.argv[2]

app = express()

app.use bodyParser.urlencoded({ extended: false })
app.use bodyParser.json()

console.log 'express listening at ' + port

app.use (req, res, next) ->
  res.header 'Access-Control-Allow-Origin', '*'
  res.header 'Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE'
  res.header 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
  
  next()

routeHandlers = require('./routeHandlers')(torrentStore)

findTorrent = (req, res, next) ->
  torrent = req.torrent = torrentStore.get(req.params.infoHash)

  if !torrent
    return res.send 404

  next()

app.all '/torrents/:infoHash/files/:path([^"]+)', findTorrent, routeHandlers.streamTorrent

app.delete '/torrents/:infoHash', findTorrent, routeHandlers.deleteTorrent

app.get '/torrents', routeHandlers.getAllTorrents
app.get '/torrents/:infoHash', findTorrent, routeHandlers.getTorrent
app.get '/torrents/:infoHash/stats', findTorrent, routeHandlers.torrentStats
app.get '/torrents/:infoHash/files', findTorrent, routeHandlers.getM3UPlaylist

app.post '/torrents', routeHandlers.addTorrent
app.post '/torrents/:infoHash/start/:index?', findTorrent, routeHandlers.startTorrent
app.post '/torrents/:infoHash/stop/:index?', findTorrent, routeHandlers.stopTorrent
app.post '/torrents/:infoHash/pause', findTorrent, routeHandlers.pauseSwarm
app.post '/torrents/:infoHash/resume', findTorrent, routeHandlers.resumeSwarm
#app.post '/upload', multipart(), routeHandlers.uploadTorrent

server = http.createServer app

io = socket.listen server

require('./socketServer')(io, torrentStore)
require('./socketActions')(io, torrentStore)

server.listen port

process.send 'started'
