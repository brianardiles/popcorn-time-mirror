torrentProgress = require './torrentProgress'

exports.serializeFiles = (torrent) ->
  torrentFiles = torrent.files
  pieceLength = torrent.torrent.pieceLength
    
  torrentFiles.map (f) ->
    start = f.offset / pieceLength | 0
    end = (f.offset + f.length - 1) / pieceLength | 0
    
    name: f.name
    path: f.path
    src: 'http://127.0.0.1:' + process.argv[2] + '/torrents/' + torrent.infoHash + '/files/' + encodeURIComponent(f.path)
    length: f.length
    offset: f.offset
    selected: torrent.selection.some (s) ->
      s.from <= start and s.to >= end

exports.serialize = (torrent) ->
  if !torrent.torrent
    return { infoHash: torrent.infoHash }

  infoHash: torrent.infoHash
  name: torrent.torrent.name
  interested: torrent.amInterested
  ready: torrent.ready
  files: exports.serializeFiles torrent
  progress: torrentProgress torrent.bitfield.buffer

exports.serializeObject = (torrents) ->
  object = {}

  for indx, torrent of torrents
    object[indx] = exports.serialize torrent

  object