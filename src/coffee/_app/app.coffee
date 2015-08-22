'use strict'

angular.module 'app', [
  # vendor
  'ngSanitize'
  'ngMaterial'
  'ngAnimate'
  'ngAria'

  'socket-io'
  'ct.ui.router.extras'

  'app.about'
  'app.bookmarks'
  'app.browser'
  'app.common-directives'
  'app.containers'
  'app.detail'
  'app.device-selector'
  'app.filter-bar'
  'app.header'
  'app.page-header'
  'app.play-torrent'
  'app.providers'
  'app.quality-icon'
  'app.quality-selector'
  'app.services'
  'app.settings'
  'app.sidebar'
  'app.streamer'
  'app.torrents'
  'app.webchimera'
  
]

.config ($compileProvider, $mdThemingProvider, $stateProvider, $urlRouterProvider, $uiViewScrollProvider) ->

  $stateProvider
    .state 'app',
      url: ''
      abstract: true
      templateUrl: '_app/app.html'

    .state 'app.about',
      url: '/about'
      sticky: true
      views: app:
        templateUrl: 'about/about.html'

    .state 'app.movie',
      url: '/movie'
      sticky: true
      title: 'Movies'
      root: true
      views: app:
        templateUrl: 'browser/browser.html'
        controller: 'browserController as browser'
      resolve: 
        type: -> 'movie'
        api: (YTS) -> YTS

    .state 'app.show',
      url: '/show'
      sticky: true
      title: 'TV Shows'
      root: true
      views: app:
        templateUrl: 'browser/browser.html'
        controller: 'browserController as browser'
      resolve: 
        type: -> 'show'
        api: (TVApi) -> TVApi

    .state 'app.anime',
      url: '/anime'
      sticky: true
      title: 'Anime'
      root: true
      views: app:
        templateUrl: 'browser/browser.html'
        controller: 'browserController as browser'
      resolve: 
        type: -> 'anime'
        api: (Haruhichan) -> Haruhichan

    .state 'app.bookmarks',
      url: '/bookmarks'
      sticky: true
      title: 'Bookmarks'
      root: true
      views: app:
        templateUrl: 'browser/browser.html'
        controller: 'browserController as browser'

    .state 'app.torrents',
      url: '/torrents'
      sticky: true
      title: 'Torrents List'
      views: app:
        templateUrl: 'torrents/torrents.html'

    .state 'app.detail',
      url: '/detail/:id?type?title'
      sticky: true
      title: null
      views: detail:
        template: '''<wc-poster ng-hide="ctrl.player.canplay" ng-if="ctrl.config.poster" poster="ctrl.config.poster"></wc-poster>
          <wc-detail ng-hide="ctrl.player.torrentLink" player="ctrl.player" torrent="ctrl.torrent" config="ctrl.config"></wc-detail>'''

    .state 'app.settings',
      url: '/settings'
      sticky: true
      title: 'Settings'
      views: app:
        templateUrl: 'settings/settings.html'
        controller: 'settingsController as settings'
        
  $urlRouterProvider.otherwise '/movie'
  $uiViewScrollProvider.useAnchorScroll()

  $compileProvider.debugInfoEnabled true

  $mdThemingProvider.definePalette 'white',
    '50': '#ffffff'
    '100': '#ffffff'
    '200': '#ffffff'
    '300': '#ffffff'
    '400': '#ffffff'
    '500': '#ffffff'
    '600': '#ffffff'
    '700': '#ffffff'
    '800': '#ffffff'
    '900': '#ffffff'
    'A100': '#ffffff'
    'A200': '#ffffff'
    'A400': '#ffffff'
    'A700': '#ffffff'
    'contrastDefaultColor': 'dark'
    
  $mdThemingProvider.definePalette 'black',
    '50': '#e1e1e1'
    '100': '#b6b6b6'
    '200': '#8c8c8c'
    '300': '#646464'
    '400': '#4d4d4d'
    '500': '#ffffff'
    '600': '#ffffff'
    '700': '#232323'
    '800': '#1a1a1a'
    '900': '#121212'
    'A100': '#ffffff'
    'A200': '#ffffff'
    'A400': '#ffffff'
    'A700': '#ffffff'
    'contrastDefaultColor': 'light'

  $mdThemingProvider.definePalette 'background',
    '50': '#fafafa'
    '100': '#f5f5f5'
    '200': '#08090B'
    '300': '#e0e0e0'
    '400': '#bdbdbd'
    '500': '#9e9e9e'
    '600': '#757575'
    '700': '#616161'
    '800': '#191D22'
    '900': '#212121'
    '1000': '#000000'
    'A100': '#ffffff'
    'A200': '#08090B'
    'A400': '#bdbdbd'
    'A700': '#616161'
    'contrastDefaultColor': 'dark'
    'contrastLightColors': '600 700 800 900'

  $mdThemingProvider.theme 'pct'
    .primaryPalette 'black'
    .accentPalette 'white'
    .backgroundPalette 'background'
    .warnPalette 'deep-orange'
    .dark()

  $mdThemingProvider.setDefaultTheme 'pct'
