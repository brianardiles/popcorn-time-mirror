child_process = require 'child_process'
cluster       = require 'cluster'
getPort       = require 'get-port'

streamer = null

getPort (err, port) ->
  module.exports.port = port

module.exports =
  start: (cb) ->
    streamer = child_process.fork 'server/streamServer.js', [@port]

    streamer.on 'message', (msg) ->
      if msg is 'started'
        cb()

  port: null

process.on 'uncaughtException', (err) ->
  console.log 'Caught exception: ' + err