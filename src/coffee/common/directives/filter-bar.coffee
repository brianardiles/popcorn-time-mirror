'use strict'

angular.module 'com.module.common'

.directive 'extOpen', (gui) ->
  scope: { link: '=' }
  link: (scope, element, attrs) ->
    open = ->
      gui.Shell.openExternal scope.link

    element.on 'click', open

    scope.$on '$destroy', ->
      element.off 'click', open

.filter 'titleCase', ->
  (input) ->
    input.charAt(0).toUpperCase() + input.slice(1).toLowerCase() if input

.directive 'filterBar', ->
  restrict: 'A'
  scope: { list: '=', onChange: '&' }
  bindToController: true
  templateUrl: 'common/views/filter-bar.html'
  controller: 'filterCtrl as filters'

.controller 'filterCtrl', ($scope, $stateParams) ->
  vm = this

  vm.type = $stateParams.listType
  
  vm.menuOpen = null

  $scope.$watchCollection 'filters.params', (newParams, oldParams) ->
    if not angular.equals(newParams, oldParams) and angular.isDefined oldParams
      vm.onChange params: newParams

  return

.directive 'ptDropdown', ($document, $timeout) ->
  restrict: 'E'
  bindToController: true
  scope: { items: '=?', selected: '=', label: '@', menuOpen: '=' }
  templateUrl: (iElem, tAttrs) -> "common/views/#{tAttrs.template}.html"
  controller: 'filterBarGroupController as filter'

.controller 'filterBarGroupController', ($scope) ->
  vm = this

  if not vm.selected
    vm.selected = vm.items[0]

  return
  
.directive 'imageLoaded', ($timeout) ->
  restrict: 'A'
  link: (scope, element, attrs) ->
    element.bind 'load', (e) ->
      element.parent().addClass 'fadeout'
      element.addClass 'fadein'
      return
    return

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

.directive 'vibrant', ($parse, $Vibrant, $timeout) ->
  restrict: 'A'
  scope:
    colors: '='
  link: (scope, element, attrs) ->
    if angular.isDefined(attrs.crossorigin) or angular.isDefined(attrs.crossOrigin)
      element[0].crossOrigin = attrs.crossorigin or attrs.crossOrigin or 'Anonymous'

    element.on 'load', ->
      $timeout ->
        $Vibrant.get(element[0]).then (colors) ->
          scope.colors = colors
      , 1000