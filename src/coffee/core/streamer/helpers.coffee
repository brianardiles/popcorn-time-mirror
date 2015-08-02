'use strict'

angular.module 'com.module.core'

.constant 'streamServer', process.mainModule.exports

.factory 'streamOptions', (Settings, AdvSettings, crypto, semver) ->

  getPeerID = ->
    version = semver.parse Settings.version

    torrentVersion = [
      version.major
      version.minor
      version.patch
      (if version.prerelease.length then version.prerelease[0] else 0)
    ].join ''
    
    torrentPeerId = [
      'PT'
      torrentVersion
      crypto.pseudoRandomBytes(6).toString('hex')
    ].join '-'

    torrentPeerId

  connections: 1000
  dht: true
  id: getPeerID()
  name: 'Popcorn Time'
  path: AdvSettings.get 'tmpLocation'
  verify: false
  tracker: true
  trackers: [
    'udp://tracker.openbittorrent.com:80'
    'http://tracker.yify-torrents.com'
    'udp://tracker.publicbt.org:80'
    'udp://tracker.coppersurfer.tk:6969'
    'udp://tracker.leechers-paradise.org:6969'
    'udp://open.demonii.com:1337'
    'udp://p4p.arenabg.ch:1337'
    'udp://p4p.arenabg.com:1337'
    'udp://tracker.ccc.de:80'
  ]

.filter 'torrentProgress', ->
  (buffer) ->
    progress = []

    if buffer 

      counter = 0
      downloaded = true

      i = 0

      while i < buffer.length
        p = buffer[i]

        if downloaded and p > 0 or !downloaded and p == 0
          counter++
        else
          progress.push counter
          counter = 1
          downloaded = !downloaded

        i++

      progress.push counter

      progress.map (p) ->
        p * 100 / buffer.length

    progress.length + '%'

.filter 'notChoked', ->
  (wires = []) ->
    notChoked = (prev, wire) ->
      prev + !wire.peerChoking

    wires.reduce notChoked, 0

.factory 'torrentStats', ->
  (torrent) ->
    swarm = torrent.swarm
    
    
    peers:
      total: swarm.wires.length
      unchocked: swarm.wires
    
    traffic:
      down: swarm.downloaded
      up: swarm.uploaded
    
    speed:
      down: swarm.downloadSpeed()
      up: swarm.uploadSpeed()
    
    queue: swarm.queued
    paused: swarm.paused

.factory 'ffmpegService', (nodeFs, $q, pump, ffmpeg) ->
  (req, res, torrent, file) ->
    param = req.query.ffmpeg

    probe = ->
      defer = $q.defer()
      filePath = path.join torrent.path, file.path
      
      nodeFs.exists filePath, (exists) ->
        if !exists
          return defer.reject 'File doesn`t exist.'
        
        ffmpeg.ffprobe filePath, (err, metadata) ->
          if err
            defer.reject err.toString()

          defer.resolve metadata

      defer.promise

    remux = ->
      res.type 'video/webm'

      command = ffmpeg(file.createReadStream())
        .videoCodec('libvpx')
        .audioCodec('libvorbis')
        .format('webm')
        .audioBitrate(128)
        .videoBitrate(1024)
        .outputOptions [
          #'-threads 2'
          '-deadline realtime'
          '-error-resilient 1'
        ]

      pump command, res

    switch param
      when 'probe'
        return probe()
      when 'remux'
        return remux()
      else res.send 501, 'Not supported.'
