'use strict'

angular.module 'com.module.common'

.filter 'traktSize', ->
  (input = '', size, type) ->
    if type is 'movie' and size isnt 'thumb'
      input = input.replace 'medium', size
    else if type is 'show'
      input = input.replace '/original/', "/#{size}/"

    input


.constant 'healthMap', [
    'bad'
    'medium'
    'good'
    'excellent'
  ]

.filter 'calcHealth', (healthMap) ->
  (torrent) ->
    seeds = torrent.seeds
    peers = torrent.peers
    
    # First calculate the seed/peer ratio
    ratio = if peers > 0 then seeds / peers else seeds
    
    # Normalize the data. Convert each to a percentage
    # Ratio: Anything above a ratio of 5 is good
    normalizedRatio = Math.min(ratio / 5 * 100, 100)
    
    # Seeds: Anything above 30 seeds is good
    normalizedSeeds = Math.min(seeds / 30 * 100, 100)
    
    # Weight the above metrics differently
    # Ratio is weighted 60% whilst seeders is 40%
    weightedRatio = normalizedRatio * 0.6
    weightedSeeds = normalizedSeeds * 0.4
    weightedTotal = weightedRatio + weightedSeeds
    
    # Scale from [0, 100] to [0, 3]. Drops the decimal places
    scaledTotal = weightedTotal * 3 / 100 | 0

    healthMap[scaledTotal]

.filter 'fileSize', (os, Settings) ->
  (num) ->
    if isNaN(num)
      return
    
    num = parseInt(num)
    neg = num < 0
    
    switch os.platform()
      when 'linux'
        base = 1024
        units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
      when 'win32'
        base = 1024
        units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      else
        base = 1000
        units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    if neg
      num = -num
    
    if num < 1
      unit = units[0]
      
      if Settings.language == 'fr'
        unit = unit.replace('B', 'o')
      
      return (if neg then '-' else '') + num + ' ' + unit
    
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(base)), units.length - 1)
    
    num = (num / base ** exponent).toFixed(2) * 1
    unit = units[exponent]
    
    matchers = [
      'sq', 'es', 'hy', 'az', 'be'
      'qu', 'pt', 'bs', 'ca', 'bg' 
      'hr', 'cs', 'da', 'et', 'fo' 
      'fi', 'fr', 'de', 'ka', 'el' 
      'hu', 'is', 'id', 'it', 'kk' 
      'lv', 'lt', 'mn', 'nl', 'nn' 
      'nb', 'no', 'pl', 'ro', 'ru' 
      'sr', 'sk', 'sl', 'sv', 'tr' 
      'uk', 'uz', 'vi'
    ]

    if Settings.language in matchers
      num = num.toString().replace '.', ','

    if Settings.language is 'fr'
      unit = unit.replace 'B', 'o'

    (if neg then '-' else '') + num + ' ' + unit
