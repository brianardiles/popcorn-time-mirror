'use strict'

angular.module 'com.module.common'
     
.factory 'TVApi', (tvdb, $log, AdvSettings, Settings, $http, $q, timeoutCache) ->
  tvdb.getLanguages().then (langlist) ->
    AdvSettings.set 'tvdbLangs', langlist

  fetch: (filters) ->
    deferred = $q.defer()

    params = 
      sort: 'seeds'
      limit: '50'
      keywords: filters?.keywords?.replace(/\s/g, '% ')
      genre: filters?.genre or null
      order: filters?.order or null
    
    if filters?.sort_by != 'popularity'
      params.sort = filters?.sort_by 

    url = AdvSettings.get('tvshowAPI').url + 'shows/' + (filters?.page or 1)
    $log.info 'Request to TVApi', url
    
    $http
      method: 'GET'
      url: url
      params: params
      cache: timeoutCache 10 * 60 * 1000
    .success (data) ->
      if !data or data.error and data?.error != 'No movies found'
        err = if data then data.error else 'No data returned'
        $log.error 'API error:', err
        deferred.reject err
      else
        results = {}
        for idx, show of data
          results[show._id] = show
          results[show._id].type = 'show'
        deferred.resolve { results: results, hasMore: true }
    .error (error, response) ->
      deferred.reject error

    deferred.promise

  detail: (_id, debug) ->
    if debug == undefined then (debug = true) else ''
    
    defer = $q.defer()

    url = AdvSettings.get('tvshowAPI').url + 'show/' + _id
    $log.info 'Request to TVApi', url
    
    $http
      method: 'GET'
      url: url
      cache: new timeoutCache 10 * 60 * 1000
    .success (data) ->
      if !data or data.error and data.error != 'No data returned' or data.episodes.length == 0
        err = if data and data.episodes.length != 0 then data.error else 'No data returned'
        if debug then $log.error('API error:', err) else ''
        defer.reject err
      else
        # we cache our new element or translate synopsis
        if Settings.translateSynopsis and Settings.language != 'en'

          x = 0
          while x < Settings.tvdbLangs.length
            if Settings.tvdbLangs[x].abbreviation.indexOf(Settings.language) > -1
              langAvailable = true
              break
            x++
          
          if !langAvailable
            defer.resolve data
          
          reqTimeout = $timeout ->
            defer.resolve data
          , 2000

          tvdb.getSeriesAllById(tvdb_id).then (localization) ->
            $timeout.cancel reqTimeout
            angular.extend data, synopsis: localization.Overview
            
            i = 0
            while i < localization.Episodes.length
              j = 0
              while j < data.episodes.length
                if localization.Episodes[i].id.toString() == data.episodes[j].tvdb_id.toString()
                  data.episodes[j].overview = localization.Episodes[i].Overview
                  break
                j++
              i++

            defer.resolve data

          .catch (error) -> defer.resolve data
        else defer.resolve data
    .error (error, response) ->
      defer.reject error

  extractIds: (items) ->
    items.results.map (item) -> item['imdb_id']

