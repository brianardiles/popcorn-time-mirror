#!/usr/bin/env electron

app     = require 'app'
dialog  = require 'dialog'
ipc     = require 'ipc'
path    = require 'path'
shell   = require 'shell'
window  = require 'browser-window'
getport = require 'get-port'
child   = require 'child_process'

ready = false
win   = undefined
port = null

streamer = null

module.exports = 
  app.on 'ready', ->

    splashwin = new window
      'frame': false
      'toolbar': false
      'icon': "images/icon.png"
      'position': 'center'
      'width': 460
      'resizable': false
      'height': 250
      'transparent': true
      'always-on-top': true 

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

    ipc.on 'enter-full-screen', ->
      win.setFullScreen true

    ipc.on 'exit-full-screen', ->
      win.setFullScreen false
      win.show()

    ipc.on 'get-port', (event, arg) ->
      getport (err, newport) ->
        streamer = child.fork 'build/server/streamServer.js', [newport]
        event.returnValue = newport

    ipc.on 'ready', (event, data) ->
      ready = true

      { size, coords, port } = data 

      win.setSize size[0], size[0]
      win.setBounds coords[0], coords[1]

      win.show()

      

    process.on 'uncaughtException', (err) ->
      console.log 'Caught exception: ' + err
