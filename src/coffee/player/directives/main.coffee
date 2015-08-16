'use strict'

angular.module 'com.module.webchimera'

.directive 'ptDetail', ->
  restrict: 'E'
  scope: { state: '=' }
  bindToController: true
  templateUrl: 'player/views/main.html'
  controller: 'playerDetailController as ctrl'

.controller 'playerDetailController', ($sce, $q, $filter, $scope, playerConfig) ->
  vm = this

  vm.config = playerConfig

  findTorrentUrl = (episode, selectedEpisode, defaultQuality) ->
    if defaultQuality isnt '0'
      quality = episode.torrents[defaultQuality]
      if quality then return torrent.url
    episode.torrents[0].url

  sortNextEpisodes = (player) ->
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

  $scope.$watch 'ctrl.state.torrent', (newTorrent) ->
    if newTorrent?.connection
      newTorrent.listen()

  $scope.$watchCollection 'ctrl.state.player', (newPlayer, oldPlayer) ->
    if newPlayer
      vm.config.sources = newPlayer.torrent.files
    
      sortNextEpisodes(newPlayer).then (data) ->
        vm.next = data

  return