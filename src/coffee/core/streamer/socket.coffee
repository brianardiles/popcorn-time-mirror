'use strict'

angular.module 'com.module.core'

.constant 'streamServer', process.mainModule.exports

.run (streamServer) ->
  streamServer.start()

.factory 'socketServer', ($rootScope, $q, socketFactory, streamServer) ->
  socket = io "http://127.0.0.1:#{streamServer.port}/", port: streamServer.port
  socketFactory ioSocket: socket