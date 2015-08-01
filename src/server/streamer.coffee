http        = require 'http'
fs          = require 'fs'
rangeParser = require 'range-parser'
url         = require 'url'
mime        = require 'mime'
pump        = require 'pump'

server = http.createServer()
files = []

server.on 'request', (request, response) ->
  u = url.parse(request.url)
  host = request.headers.host or 'localhost'

  if u.pathname == '/.m3u'
    response.setHeader 'Content-Type', 'application/x-mpegurl; charset=utf-8'
    return response.end('#EXTM3U\n' + files.map((f, i) ->
      '#EXTINF:-1,' + f.path + '\n' + 'http://' + host + '/' + i
    ).join('\n'))
  
  i = Number(u.pathname.slice(1))
  
  if isNaN(i) or i >= files.length
    response.statusCode = 404
    response.end()
    return
  
  file = files[i]
  
  range = request.headers.range
  range = range and rangeParser(file.length, range)[0]
  
  response.setHeader 'Accept-Ranges', 'bytes'
  response.setHeader 'Content-Type', mime.lookup(file.name)
  
  if !range
    response.setHeader 'Content-Length', file.length
    if request.method == 'HEAD'
      return response.end()
    pump file.createReadStream(), response
    return
  
  response.statusCode = 206
  response.setHeader 'Content-Length', range.end - (range.start) + 1
  response.setHeader 'Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + file.length
  
  if request.method == 'HEAD'
    return response.end()
  
  pump file.createReadStream(range), response
  
  return

server.on 'connection', (socket) ->
  socket.setTimeout 36000000

service = 
  setPort: (port) ->
    server.listen port
    console.log 'streamer listening on port ' + port

  setTorrent: (obj) ->
    files = obj
    console.log 'torrent selected ' + obj

process.on 'message', (message) ->
  if message instanceof Object and message.hasOwnProperty('functionName') and message.hasOwnProperty('functionArgs')
    service[message.functionName].apply this, message.functionArgs
  return
