#!/usr/bin/env electron

app     = require 'app'
dialog  = require 'dialog'
ipc     = require 'ipc'
path    = require 'path'
shell   = require 'shell'
window  = require 'browser-window'
getport = require 'get-port'
child   = require 'child_process'

bodyParser    = require 'body-parser'
express       = require 'express'
socket        = require 'socket.io'
http          = require 'http'
torrentStore  = require './server/torrentStore'


ready = false
win   = undefined

streamer = null

getport (err, port) ->
  process.socketPort = port 
  
  app.on 'ready', ->

    expressApp = express()

    expressApp.use bodyParser.urlencoded({ extended: false })
    expressApp.use bodyParser.json()

    console.log 'express listening at ' + port

    expressApp.use (req, res, next) ->
      res.header 'Access-Control-Allow-Origin', '*'
      res.header 'Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE'
      res.header 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
      
      next()

    routeHandlers = require('./server/routeHandlers')(torrentStore)

    findTorrent = (req, res, next) ->
      torrent = req.torrent = torrentStore.get(req.params.infoHash)

      if !torrent
        return res.send 404

      next()

    expressApp.all '/torrents/:infoHash/files/:path([^"]+)', findTorrent, routeHandlers.streamTorrent

    expressApp.delete '/torrents/:infoHash', findTorrent, routeHandlers.deleteTorrent

    expressApp.get '/torrents', routeHandlers.getAllTorrents
    expressApp.get '/torrents/:infoHash', findTorrent, routeHandlers.getTorrent
    expressApp.get '/torrents/:infoHash/stats', findTorrent, routeHandlers.torrentStats
    expressApp.get '/torrents/:infoHash/files', findTorrent, routeHandlers.getM3UPlaylist

    expressApp.post '/torrents', routeHandlers.addTorrent
    expressApp.post '/torrents/:infoHash/start/:index?', findTorrent, routeHandlers.startTorrent
    expressApp.post '/torrents/:infoHash/stop/:index?', findTorrent, routeHandlers.stopTorrent
    expressApp.post '/torrents/:infoHash/pause', findTorrent, routeHandlers.pauseSwarm
    expressApp.post '/torrents/:infoHash/resume', findTorrent, routeHandlers.resumeSwarm
    #expressApp.post '/upload', multipart(), routeHandlers.uploadTorrent

    server = http.createServer expressApp

    io = socket.listen server

    require('./server/socketServer')(io, torrentStore)
    require('./server/socketActions')(io, torrentStore)

    server.listen port

    win = new window
      title: 'Angular Popcorn Time'
      'min-width': 520
      'min-height': 520
      frame: false
      resizable: true
      icon: 'assets/images/icon.png'
      transparent: true
      center: true

    win.loadUrl 'file://' + path.join __dirname, 'index.html'
    
    ipc.on 'close', ->
      app.quit()

    ipc.on 'open-url-in-external', (event, url) ->
      shell.openExternal url

    ipc.on 'focus', ->
      win.focus()

    ipc.on 'minimize', ->
      win.minimize()

    ipc.on 'maximize', ->
      win.maximize()

    ipc.on 'resize', (e, size) ->
      if win.isMaximized()
        return
      
      width = win.getSize()[0]
      height = width / size.ratio | 0
      
      win.setSize width, height

      return 

    ipc.on 'enter-full-screen', ->
      win.setFullScreen true

    ipc.on 'exit-full-screen', ->
      win.setFullScreen false
      win.show()

    ipc.on 'get-port', (evt, arg) ->
      evt.returnValue = port

    ipc.on 'ready', (event, data) ->
      ready = true

      { size, coords, port, zoom } = data 

      win.setSize size[0], size[1]
      win.setBounds coords[0], coords[1]

      win.show()

      return 

    process.on 'uncaughtException', (err) ->
      console.log 'Caught exception: ' + err
