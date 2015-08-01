'use strict'

angular.module 'com.module.common'

.factory '$Vibrant', ($q) ->
  defaultQuality = 64
  defaultColorCount = 6

  rgba = (array, opacity) ->
    if !opacity or isNaN(opacity)
      opacity = 1
    'rgba(' + array.join() + ',' + opacity + ')'

  get: (image, colorCount, quality) ->
    defer = $q.defer()

    vibrant = new Vibrant(image, colorCount or defaultColorCount, quality or defaultQuality)

    swatches = vibrant.swatches()
    swatch = vibrant.getBestSwatch()

    background = rgba(swatch.getRgb(), 0.96)
    color = swatch.getTitleTextColor()
    fab = swatch.getHex()

    if color == '#000' or color == '#000000'
      color = 'rgba(20,21,23,.9)'
    
    if background and color
      defer.resolve
        background: background
        color: color
        fab: fab
    else
      defer.reject()

    defer.promise
