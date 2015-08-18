'use strict'

angular.module 'com.module.common'

.factory 'Haruhichan', ($q, $http, Settings, $log, timeoutCache) ->
  results = {}

  statusMap = [
    'Not Airing Yet'
    'Currently Airing'
    'Ended'
  ]

  parseTime = (duration) ->
    time = duration.match(/(?:([0-9]+) h)?.*?(?:([0-9]+) min)/)
    
    if !time
      return $log.error('couldn\'t parse time:', time)
    
    (if time[1] then time[1] else 0) * 60 + Number(time[2])

  formatForPopcorn = (items) ->
    for idx, item of items
      aired = if item.aired.indexOf(', ') != -1 then item.aired.split(', ')[1] else item.aired
      
      results['mal-' + item.id] =
        images:
          poster: item.malimg
          fanart: item.malimg
          banner: item.malimg
        mal_id: item.MAL
        haru_id: item.id
        tvdb_id: 'mal-' + item.id
        imdb_id: 'mal-' + item.id
        slug: item.name.toLowerCase().replace(/\s/g, '-')
        title: item.name
        year: aired.replace(RegExp(' to.*'), '')
        type: if item.type is 'Movie' then 'movie' else 'show'
        item_data: item.type

    results: results or null
    hasMore: true

  movieTorrents = (id, dl) ->
    torrents = {}
    
    angular.forEach dl, (item) ->
      qualityMatch = item.quality.match(/[0-9]+p/)
      quality = if qualityMatch then qualityMatch[0] else null
      qualityNumber = quality.replace('p', '')
    
      if qualityNumber > 480 and qualityNumber < 1000
        quality = '720p'
      else if qualityNumber >= 1000 and qualityNumber < 1800
        quality = '1080p'
    
      torrents[quality] =
        seeds: 0
        peers: 0
        magnet: item.magnet
        health: 'good'
    
      return
    
    torrents

  showTorrents = (id, dl) ->
    torrents = {}
    episodeNb = null
    
    angular.forEach dl, (item) ->
      qualityMatch = item.quality.match /[0-9]+p/
      quality = if qualityMatch then qualityMatch[0] else null
      qualityNumber = quality.replace('p', '')
      
      if qualityNumber > 200 and qualityNumber < 600
        quality = '480p'
      else if qualityNumber >= 600 and qualityNumber < 1000
        quality = '720p'
      else if qualityNumber >= 1000 and qualityNumber < 1800
        quality = '1080p'

      match = item.name.match(/[\s_]([0-9]+(-[0-9]+)?|CM|OVA)[\s_]/)
      
      if !match
        tryName = item.name.split(/:?(\(|\[)/)
        
        if tryName.length == 1
          return
        
        if torrents[episodeNb] and torrents[episodeNb].title == tryName[0]
          episode = episodeNb
        else
          episodeNb++
          episode = episodeNb
      else
        episode = match[1]
      
      if !torrents[episode]
        torrents[episode] =
          title: if match then item.name else tryName[0]
          ordered: if match then true else false
      
      torrents[episode][quality] =
        seeds: 0
        peers: 0
        url: item.magnet
        health: 'good'

    for s, torrent of torrents
      title: if torrent.ordered then 'Episode ' + s else torrent.title
      torrents: torrent
      season: 1
      episode: Number s.split('-')[0]
      overview: 'We still don\'t have single episode overviews for anime… Sorry'
      tvdb_id: id + '-1-' + s

  formatDetailForPopcorn = (item, type) ->
    img = item.malimg
    type = type
    genres = item.genres.split ', '
    
    ret = 
      country: 'Japan'
      genre: genres
      genres: genres
      num_seasons: 1
      runtime: parseTime(item.duration)
      status: statusMap[item.status]
      synopsis: item.synopsis
      network: item.producers
      
      rating:
        hated: 0
        loved: 0
        votes: 0
        percentage: Math.round(item.score) * 10
      
      images:
        poster: img
        fanart: img
        banner: img
      
      year: item.aired.split(', ')[1].replace(RegExp(' to.*'), '')
      type: type

    if type == 'movie'
      ret = angular.extend(ret,
        cover: img
        rating: item.score
        subtitle: undefined
        torrents: movieTorrents(item.id, item.episodes))
    else
      ret = angular.extend ret, episodes: showTorrents(item.id, item.episodes)
    
    ret

  fetch: (filters = {}) ->
    deferred = $q.defer()

    params = 
      sort: 'popularity'
      limit: '50'
      type: 'All'
      page: (filters.page - 1) or 0
      
    if filters.keywords
      params.search = filters.keywords.replace /\s/g, '% '
    
    genres = filters.genre
    
    if genres and genres != 'All'
      params.genres = genres
    
    if filters.sorter and filters.sorter != 'popularity'
      params.sort = filters.sorter
    
    if filters.sort == 'name'
      params.order * -1
    
    switch filters.order
      when 1
        params.order = 'desc'
      else
        params.order = 'asc'
        break
    
    if filters.type and filters.type != 'All'
      if filters.type == 'Movies'
        params.type = 'movie'
      else
        params.type = filters.type.toLowerCase()
    
    url = 'http://ptp.haruhichan.com/list.php'
    
    $log.info 'Request to Hurahican API', url
    
    $http 
      url: url
      params: params
      method: 'GET'
      cache: timeoutCache 10 * 60 * 1000
    .success (data) ->
      if !data or data.error and data.error != 'No movies found'
        err = if data then data.error else 'No data returned'
        $log.error 'API error:', err
        deferred.reject err
      else
        deferred.resolve formatForPopcorn data
    .error (err) ->
      deferred.reject error

    deferred.promise
  
  # Single element query
  detail: (torrent_id, type) ->
    defer = $q.defer()

    url = 'http://ptp.haruhichan.com/anime.php'
    $log.info 'Request to Hurahican API', url

    $http 
      url: url
      params: id: torrent_id.split('-')[1]
      method: 'GET'
      cache: timeoutCache 10 * 60 * 1000
    .success (data) ->
      if !data or data.error and data.error != 'No data returned'
          err = if data then data.error else 'No data returned'
          $log.error 'API error:', err
          defer.reject err
      else if data.episodes.length == 0
        err = 'No torrents returned'
        $log.error 'API error:', err
        defer.reject err
      else
        defer.resolve data: formatDetailForPopcorn(data, type)
    .error (err) ->
      defer.reject err

    defer.promise

  extractIds: (items) ->
    items.results.map (item) -> item['haru_id']
