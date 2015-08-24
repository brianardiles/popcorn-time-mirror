'use strict'

angular.module 'app.common-directives'

.directive 'ptParallax', ($window) ->
  restrict: 'A'
  link: (scope, elem, attrs) ->
    win = angular.element $window

    ratio = (first, second) ->
      r = first / second
      
      if r < 0 then return 0
      if r > 1 then return 1
      
      Number r.toString().match /^\d+(?:\.\d{0,2})?/

    setPosition = ->
      unless document.body.style.position is 'fixed'
        calcValY = $window.pageYOffset * (attrs.parallaxRatio or 1)

        switch attrs.ptParallax
          when 'fade'
            transform = ratio calcValY, elem[0].clientHeight
            
            elem.css 'opacity', 1 - transform

          when 'background'
            calcValY = elem.prop('offsetTop') - calcValY

            elem.css 'background-position', '50% ' + calcValY + 'px'

          when 'sticky'
            transform = ratio $window.pageYOffset, elem.parent()[0].offsetTop

            elem.css 'top', -Math.abs(elem.parent()[0].offsetTop) + 'px'
            elem.css 'padding-top', elem.parent()[0].offsetTop + 'px'
            
            elem.css 'left', '100px'
            elem.css 'right', '0px'

            if transform >= 1
              elem.css 'position', 'fixed'
            else 
              elem.css 'position', null
              elem.css 'left', '0px'

            elem.css 'background-color', 'rgba(0, 0, 0,' + transform + ')'

        return

    if attrs.ptParallax is 'background'
      win.bind 'load', ->
        setPosition()
        scope.$apply()
    else setPosition()

    throttleOnAnimationFrame = (func) ->
      ->
        context = this
        args = arguments
        
        $window.cancelAnimationFrame timeout
        
        timeout = $window.requestAnimationFrame ->
          func.apply context, args
          timeout = null

    throttledScroll = throttleOnAnimationFrame setPosition

    win.on 'scroll resize', throttledScroll

    scope.$on '$destroy', ->
      win.off 'resize scroll', throttledScroll

    throttledScroll()

    return