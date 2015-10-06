'use strict'

angular.module 'app', [
  # vendor
  'ngSanitize'
  'ngMaterial'
  'ngAnimate'
  'ngAria'

  'socket-io'
  'xmlrpc'
  
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
  'app.streamer'
  'app.torrents'
  'app.webchimera'
  
]

.config ($compileProvider, $httpProvider, $mdThemingProvider) ->

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
