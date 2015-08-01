child_process = require 'child_process'

streamer = child_process.fork 'server/streamer.js'

streamer.on 'message', (m) ->
  console.log 'received: ' + m

exports.run = (functionName, functionParams) ->
  if arguments.length < 2
    throw new TypeError('Not enough arguments. ' + 'The first param is a function name as string. ' + 'The second is an array of data types')
  
  if typeof arguments[0] != 'string'
    throw new TypeError('First parameter must be a string. ' + 'This is the name of the function')
  
  if !Array.isArray(arguments[1])
    throw new TypeError('Second parameter must be an array. ' + 'This is an array of data to be processed')
  
  streamer.send
    functionName: functionName
    functionArgs: Array::slice.call(functionParams)
