'use strict'

angular.module 'com.module.common'

.factory 'YTS', ($q, $http, Settings, cloudFlareApi) ->
  results = null

  any = (list, fn) ->
    idx = 0
    while idx < list.length
      if fn(list[idx])
        return true
      idx += 1
    false

  formatTorrents = (torrents) ->
    torrentsObject = {}
    for idx, torrent of torrents
      if torrent.quality isnt '3D'
        torrentsObject[torrent.quality] =
          url: torrent.url
          magnet: 'magnet:?xt=urn:btih:' + torrent.hash + '&tr=udp://open.demonii.com:1337&tr=udp://tracker.coppersurfer.tk:6969'
          size: torrent.size_bytes
          filesize: torrent.size
          seeds: torrent.seeds
          peers: torrent.peers

    torrentsObject

  format = (data) ->
    results = {}
    for idx, movie of data.movies
      torrents = formatTorrents movie.torrents

      if torrents     
        results[movie.imdb_code] =
          title: movie.title_english
          year: movie.year
          genres: movie.genres
          rating: 
            percentage: movie.rating * 10
          runtime: movie.runtime
          images: 
            poster: movie.medium_cover_image
            banner: movie.large_cover_image
            fanart: movie.background_image_original
          synopsis: movie.description_full
          trailer: 'https://www.youtube.com/watch?v=' + movie.yt_trailer_code or false
          certification: movie.mpa_rating
          torrents: torrents
          actors: movie.actors,
          directors: movie.directors
          type: 'movie'

    results: results or null
    hasMore: data.movie_count > data.page_number * data.limit
  
  fetch: (filters = {}) ->
    defer = $q.defer()

    params = 
      sort_by: 'seeds'
      limit: 50
      with_rt_ratings: true
      page: filters.page or 1
      quality: Settings.movies_quality or 'all'
      lang: Settings.language if Settings.translateSynopsis
  
    if filters?.sort_by isnt 'seeds' and filters?.sort_by
      params.sort_by = switch filters.sort_by
        when 'last added' then 'date_added'
        when 'trending' then 'trending_score'
        else filters.sort_by

    if filters?.order_by isnt 1 and filters?.order_by
      params.order_by = 'desc'

    if filters?.genre isnt 'All' and filters?.genre
      params.genre = filters?.genre

    if filters?.query
      params.query_term = filters?.query

    request = cloudFlareApi('http://cloudflare.com/api/v2/list_movies_pct.json', params)
    
    request.then ((data) ->
      if !data or data.status == 'error'
        err = if data then data.status_message else 'No data returned'
        defer.reject err
      else defer.resolve format(data.data)
    ), ((err) ->
      defer.reject err or 'Status Code is above 400'
    )

    defer.promise

  random: ->
    defer = $q.defer()
    
    request = cloudFlareApi 'http://cloudflare.com/api/v2/get_random_movie.json?' + Math.round((new Date).valueOf() / 1000)

    request.then ((data) ->
      if !data or data.status is 'error'
        err = if data then data.status_message else 'No data returned'
        defer.reject err
      else defer.resolve data.data
    ), ((err) ->
      defer.reject err or 'Status Code is above 400'
    )

    defer.promise

  extractIds: (items) ->
    items.results.map (item) -> item['imdb_id']

  detail: (torrent_id) ->
    $q.when data: results[torrent_id]
