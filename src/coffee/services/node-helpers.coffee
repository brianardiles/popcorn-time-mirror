'use strict'

angular.module 'app.services'

.constant 'Datastore', require 'nedb'

.constant 'tls', require 'tls'
.constant 'url', require 'url'
.constant 'gui', require 'nw.gui'
.constant 'os', require 'os'

.constant 'request', require 'request'
.constant 'torrenthealth', require 'torrent-health'

.constant 'data_path', require('nw.gui').App.dataPath
.constant 'nativeWindow', require('nw.gui').Window.get()

.constant 'nodeFs', require 'fs'
.constant 'path', require 'path'

.factory 'tvdb', (Settings) ->
  tvdbClient = require 'node-tvdb'

  new tvdbClient('7B95D15E1BE1D75A', Settings.language)
     