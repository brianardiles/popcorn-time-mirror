'use strict'

exports.torrentProgress = (buffer) ->
  progress = []
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
