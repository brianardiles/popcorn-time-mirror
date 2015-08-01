'use strict'

angular.module 'com.module.common'

.constant 'cluster', require 'cluster'
.constant 'Datastore', require 'nedb'

.constant 'tls', require 'tls'
.constant 'url', require 'url'
.constant 'http', require 'http'

.constant 'gui', require 'nw.gui'
.constant 'request', require 'request'

.constant 'torrenthealth', require 'torrent-health'

.constant 'os', require 'os'
.constant 'data_path', require('nw.gui').App.dataPath
.constant 'nativeWindow', require('nw.gui').Window.get()

.constant 'nodeFs', require 'fs'
.constant 'path', require 'path'
.constant 'pump', require 'pump'
.constant 'torrentStream', require 'torrent-stream'
.constant 'crypto', require 'crypto'
.constant 'ffmpeg', require 'fluent-ffmpeg'

.factory 'tvdb', (Settings) ->
  tvdbClient = require 'node-tvdb'

  new tvdbClient('7B95D15E1BE1D75A', Settings.language)
     
.factory 'readFile', ($q, nodeFs)->
  (filename)->
    def = $q.defer()

    nodeFs.readFile filename, (err, res)->
      if err
        def.reject err
      else def.resolve res
    
    def.promise

.factory 'copyFile', (source, target) ->
  def = $q.defer()

  rd = nodeFs.createReadStream source
  wr = nodeFs.createWriteStream target

  rd.on 'error', def.reject()
  wr.on 'error', def.reject()
  
  wr.on 'close', def.resolve()

  rd.pipe wr

  def.promise

.factory 'writeFile', ($q, nodeFs)->
  (filename, data)->
    def = $q.defer()

    nodeFs.writeFile filename, data, (err, res)->
      if err
        def.reject err
      else def.resolve res

    def.promise

.factory 'isDir', ($q, nodeFs) ->
  (name) ->
    def = $q.defer()

    nodeFs.stat name, (err, res)->
      if err or res.blksize is res.size
        def.reject (err or null)
      else def.resolve()
    
    def.promise

.factory 'listDir', ($q, nodeFs, isDir)->
  (name)->
    def = $q.defer()

    onError = ->
      console.log "rejecting: #{res},#{name}"
      def.reject "#{name} is a file"
    
    onSuccess = ->
      nodeFs.readdir name, (err, res)->
        if err
          console.log "rejected by: #{err}"
          def.reject err
        else def.resolve res

    isDir(name).then onSuccess, onError

    def.promise

