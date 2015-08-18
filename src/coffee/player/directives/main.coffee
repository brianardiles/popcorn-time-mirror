'use strict'

angular.module 'com.module.webchimera'

.factory 'playerService', ($q) ->
  findTorrentUrl = (episode, selected, defaultQuality) ->
    if defaultQuality isnt '0'
      quality = episode.torrents[defaultQuality]
      if quality then return torrent.url
    episode.torrents[0].url

  sortNextEpisodes: (player) ->
    return $q.reject() unless player?.show

    show = player.show

    selected = player.episode
    defaultQuality = player.quality 

    playNextEpisodes = []

    for episode in show.episodes
      if (episode.episode >= selected.episode and episode.season is selected.season) or (episode.season > selected.season)
        playNextEpisodes.push
          title: episode.title
          season: episode.season
          episode: episode.episode
          torrent: findTorrentUrl episode, selected, defaultQuality

    $q.when playNextEpisodes

.directive 'ptDetail', ->
  restrict: 'E'
  scope: { state: '=' }
  bindToController: true
  templateUrl: 'player/views/main.html'
  controller: 'playerDetailController as ctrl'

.controller 'playerDetailController', ($sce, playerService, $filter, $scope, playerConfig) ->
  vm = this

  vm.config = playerConfig

  $scope.$watch 'ctrl.state.torrent.ready', (readyState) ->
    vm.config.controls = readyState

  $scope.$watchCollection 'ctrl.state.player', (newPlayer, oldPlayer) ->
    playerService.sortNextEpisodes(newPlayer).then (data) ->
      vm.next = data

  return