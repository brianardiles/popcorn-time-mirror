child_process = require 'child_process'

streamer = child_process.fork 'server/streamer.js'

streamer.on 'message', (m) ->
  console.log 'received: ' + m

streamer.send 'test'

exports = 
  test: ->
    streamer.send 'test'