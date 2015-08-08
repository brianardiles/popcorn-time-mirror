'use strict'

angular.module 'com.module.webchimera'

.directive 'ptPlayerContainer', ->
  restrict: 'E'
  scope: { player: '=' }
  bindToController: true
  templateUrl: 'player/views/main.html'
  controller: 'playerController as ctrl'

.controller 'playerController', ($sce, $q, $filter, $scope, playerConfig) ->
  vm = this

  vm.config = playerConfig

  findTorrentUrl = (episode, selectedEpisode, defaultQuality) ->
    if defaultQuality isnt '0'
      quality = episode.torrents[defaultQuality]
      if quality then return torrent.url
    episode.torrents[0].url

  sortNextEpisodes = (data) ->
    player = data.player
    show = player.show

    selectedEpisode = player.episode
    defaultQuality = player.quality 

    playNextEpisodes = []

    for episode in show.episodes
      if (episode.episode >= selectedEpisode.episode and episode.season is selectedEpisode.season) or (episode.season > selectedEpisode.season)
        playNextEpisodes.push
          title: episode.title
          season: episode.season
          episode: episode.episode
          torrent: findTorrentUrl episode, selectedEpisode, defaultQuality

    $q.when playNextEpisodes

  $scope.$watchCollection 'ctrl.player', (newVal, oldVal) ->
    if newVal.torrent and newVal.torrent.infoHash isnt oldVal?.torrent?.infoHash
      if newVal.player.show
        vm.poster = newVal.player.show.images.fanart
        
      if newVal.torrent.connection
        $q.all [
          sortNextEpisodes(newVal)
          newVal.torrent.listen()
        ]
        .then (data) ->
          vm.config.sources = newVal.torrent.files
          vm.next = data[0] 

  return