'use strict'

module.exports = (torrentStore) ->
  pause: (infoHash) ->
    torrent = torrentStore.get(infoHash)

    if torrent and torrent.swarm
      torrent.swarm.pause()

  resume: (infoHash) ->
    torrent = torrentStore.get(infoHash)

    if torrent and torrent.swarm
      torrent.swarm.resume()

  select: (infoHash, file) ->
    torrent = torrentStore.get(infoHash)

    if torrent and torrent.files
      file = torrent.files[file]
      file.select()

  deselect: (infoHash, file) ->
    torrent = torrentStore.get(infoHash)
    
    if torrent and torrent.files
      file = torrent.files[file]
      file.deselect()
