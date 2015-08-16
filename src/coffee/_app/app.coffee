'use strict'

angular.module 'app', [
  # vendor
  'ngSanitize'
  'ngMaterial'
  'ngAnimate'
  'ngAria'

  'socket-io'
  
  # modules
  'com.module.core'
  'com.module.common'
  'com.module.webchimera'
  'com.module.browser'
  'com.module.settings'
]

.config ($compileProvider, $mdThemingProvider) ->

  # disable angular's debug annotations in production for performance
  # (this debug info is required for protractor to run)
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

.factory 'ScreenResolution', ->
  SD: window.screen.width < 1280 or window.screen.height < 720
  HD: window.screen.width >= 1280 and window.screen.width < 1920 or window.screen.height >= 720 and window.screen.height < 1080
  FullHD: window.screen.width >= 1920 and window.screen.width < 2000 or window.screen.height >= 1080 and window.screen.height < 1600
  UltraHD: window.screen.width >= 2000 or window.screen.height >= 1600
  QuadHD: window.screen.width >= 3000 or window.screen.height >= 1800
  Standard: window.devicePixelRatio <= 1
  Retina: window.devicePixelRatio > 1

.constant 'splashwin', splashwin

.run (nativeWindow, Settings, ScreenResolution, $timeout, deviceScan, splashwin) ->
  zoom = 0
  screen = window.screen
  
  if ScreenResolution.QuadHD
    zoom = 2

  width = parseInt(if localStorage.width then localStorage.width else Settings.defaultWidth)
  height = parseInt(if localStorage.height then localStorage.height else Settings.defaultHeight)
  
  x = parseInt(if localStorage.posX then localStorage.posX else -1)
  y = parseInt(if localStorage.posY then localStorage.posY else -1)
 
  # reset app width when the width is bigger than the available width
  if screen.availWidth < width
    width = screen.availWidth
  
  # reset app height when the width is bigger than the available height
  if screen.availHeight < height
    height = screen.availHeight
  
  # reset x when the screen width is smaller than the window x-position + the window width
  if x < 0 or x + width > screen.width
    x = Math.round((screen.availWidth - width) / 2)
  
  # reset y when the screen height is smaller than the window y-position + the window height
  if y < 0 or y + height > screen.height
    y = Math.round((screen.availHeight - height) / 2)

  nativeWindow.once 'move', ->         
    $timeout -> 
      splashwin.close(true)
      nativeWindow.show()
      deviceScan()
    , 1000, false

  nativeWindow.zoomLevel = zoom
  nativeWindow.resizeTo width, height
  nativeWindow.moveTo x, y
    
  return
