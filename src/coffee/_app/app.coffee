'use strict'

angular.module 'app', [
  # vendor
  'ngSanitize'
  'ngMaterial'
  'ngAnimate'
  'ngResource'
  'ngAria'

  'ui.router'
  'ct.ui.router.extras'
  'socket-io'
  
  # modules
  'com.module.core'
  'com.module.common'
  'com.module.browser'
  'com.module.settings'
  'com.module.player'
]

.config ($compileProvider, $mdThemingProvider) ->

  # disable angular's debug annotations in production for performance
  # (this debug info is required for protractor to run)
  $compileProvider.debugInfoEnabled true

  $mdThemingProvider
    .definePalette 'PopcornTimeAccent',
      50: '000000'
      100: '000000'
      200: '000000'
      300: '000000'
      400: '000000'
      500: 'F0F0F0'
      600: 'F0F0F0'
      700: '000000'
      800: '000000'
      900: '000000'

      A100: '757575'
      A200: '616161'
      A400: '424242'
      A700: 'F0F0F0'

    .definePalette 'PopcornTimePrimary',
      50: 'E0E0E0'
      100: 'BDBDBD'
      200: '303030'
      300: '616161'
      400: '424242'
      500: 'F0F0F0'
      600: 'F0F0F0'
      700: '434343'
      800: '232323'
      900: '000000'

      A100: '757575'
      A200: '616161'
      A400: '424242'
      A700: 'F0F0F0'

      contrastDefaultColor: 'dark'

      contrastDarkColors: undefined

      contrastLightColors: [
        '50'
        '100'
      ]

    .theme 'default'
    .primaryPalette 'PopcornTimePrimary'
    .accentPalette 'PopcornTimeAccent'
    .dark()


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
