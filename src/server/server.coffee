child_process = require 'child_process'
cluster       = require 'cluster'

streamer = child_process.fork 'server/streamServer.js'

streamer.on 'message', (m) ->
  console.log 'received: ' + m

