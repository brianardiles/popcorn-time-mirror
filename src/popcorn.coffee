#!/usr/bin/env electron

app     = require 'app'
dialog  = require 'dialog'
ipc     = require 'ipc'
path    = require 'path'
shell   = require 'shell'
window  = require 'browser-window'

ready = false
win   = undefined

app.on 'ready', ->
  win = new window
    title: 'Angular Popcorn Time'
    min-width: 960
    min-height: 520
    frame: false
    show: false
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

  ipc.on 'ready', ->
    ready = true
    win.show()

