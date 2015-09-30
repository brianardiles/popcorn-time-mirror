'use strict'

angular.module 'app.common-directives'

.run ($templateCache) ->
  $templateCache.put 'menu-tree', '''
    <li ng-repeat="child in menu.section.children" ng-init="level = menu.level + 1">
        <md-sidemenu-item section="child" parent-selected="menu.section.selected" level="level"></md-sidemenu-item>
    </li>'''

.directive 'mdSidemenuItem', ($mdCollapse) ->
  scope: {}
  template: '''
    <h2 class="menu-heading md-primary-hue-2 text md-subhead" ng-if="menu.section.type === 'heading'">{{ menu.section.name }} &nbsp;</h2>
    
    <md-button layout="row" layout-align="space-between start" ng-if="menu.section.type !== 'heading'" class="md-black-primary-default background" ng-click="menu.section.children ? menu.toggle(menu.section) : menu.select(menu.section.state, menu.section.id)" aria-expanded="{{ menu.section.selected }}">
      <md-icon ng-if="menu.section.icon" md-font-set="material-icons" class="md-raised md-black-primary-hue-1 text">{{ menu.section.icon }}</md-icon>
      <span flex class="md-black-primary-hue-1 text">{{ menu.section.name }}</span>
      <md-icon ng-if="menu.section.children" aria-hidden="true" class="md-background-default text md-toggle-icon" ng-class="{ 'active' : menu.section.selected }" md-svg-src="md-toggle-arrow"></md-icon>
    </md-button>

    <ul ng-class="{ collapse: menu.level > 1 }" ng-if="menu.section.children" ng-include="'menu-tree'"></ul>'''
  controllerAs: 'menu'
  bindToController: { section: '=', parentSelected: '=?', level: '=', state: '=' }
  controller: ($scope, $state, $element, $mdCollapse) ->
    menu = this

    menu.groupElement = null 

    $scope.$applyAsync ->
      if menu.section.children and menu.section.type isnt 'heading'
        menu.groupElement = angular.element $element.find('ul')[0]

    menu.toggle = (section) ->
      if menu.groupElement
        if section.selected
          $mdCollapse.collapse menu.groupElement
        else 
          $mdCollapse.expand menu.groupElement

      section.selected = !section.selected

    menu.select = (state, id) ->
      $state.go (state or 'browser.models'), modelName: id

    menu.selected = (section) ->
      $state.is menu.section.state

    if menu.section.children 
      $scope.$watch 'menu.parentSelected', (selected, wasSelected) ->
        if wasSelected and not selected
          menu.section.selected = false
          $mdCollapse.collapse menu.groupElement

    return

.directive 'mdSidemenu', ->
  restrict: 'E'
  scope: { menu: '=' }
  template: '''
    <ul>
      <li ng-repeat="section in menu" ng-init="level = 1">
        <md-sidemenu-item section="section" parent-selected="section.selected" level="level"></md-sidemenu-item>
      </li>
    </ul>''' 
