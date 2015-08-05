'use strict'

angular.module 'com.module.webchimera'

.service 'wcFullscreen', (WC_UTILS, WC_FULLSCREEN_APIS) ->
  # Native fullscreen polyfill
  polyfill = null

  chimeraS = WC_FULLSCREEN_APIS

  isFullScreen = ->
    document[polyfill.element] != null

  for browser of chimeras
    if chimeras[browser].enabled of document
      polyfill = chimeras[browser]
      break

  # Override chimeras on iOS
  if WC_UTILS.isiOSDevice()
    polyfill = chimeras.ios

  @isAvailable = polyfill != null

  if polyfill
    @onchange = polyfill.onchange
    @onerror = polyfill.onerror
    @isFullScreen = isFullScreen

    @exit = ->
      document[polyfill.exit]()
      return

    @request = (elem) ->
      elem[polyfill.request]()
      return

  return
