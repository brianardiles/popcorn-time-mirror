'use strict'

angular.module 'app.common-directives'

.directive 'mdSearchAutocomplete', ($animateCss, $timeout, $q) ->
  controller: 'MdAutocompleteCtrl'
  controllerAs: '$mdAutocompleteCtrl'
  scope:
    inputName: '@mdInputName'
    inputMinlength: '@mdInputMinlength'
    inputMaxlength: '@mdInputMaxlength'
    searchText: '=?mdSearchText'
    selectedItem: '=?mdSelectedItem'
    itemsExpr: '@mdItems'
    itemText: '&mdItemText'
    placeholder: '@placeholder'
    noCache: '=?mdNoCache'
    selectOnMatch: '=?mdSelectOnMatch'
    itemChange: '&?mdSelectedItemChange'
    textChange: '&?mdSearchTextChange'
    minLength: '=?mdMinLength'
    delay: '=?mdDelay'
    autofocus: '=?mdAutofocus'
    floatingLabel: '@?mdFloatingLabel'
    autoselect: '=?mdAutoselect'
    menuClass: '@?mdMenuClass'
    inputId: '@?mdInputId'
    menuClosed: '=?mdMenuClosed'
  template: '''
    <md-button class="md-icon-button" style="float: left" aria-label="Open Search" ng-click="searchIconClicked($event)">
      <md-icon class="md-background-default text" style="font-size: 3em; color: white; height: 1em; width: 1em" md-font-set="material-icons">search</md-icon>
    </md-button>

    <md-autocomplete-wrap
      layout="row"
      ng-class="{ 'md-menu-showing': !$mdAutocompleteCtrl.hidden }"
      role="listbox">

      <md-input-container style="float: right" md-no-float flex>
        <input class="md-background-default text" md-style="{'border-color': 'background.default'}" style="padding: 0px; line-height: 40px" type="search"
            id="{{  inputId || 'fl-input-' + $mdAutocompleteCtrl.id  }}"
            name="{{ inputName }}"
            autocomplete="off"
            ng-required="$mdAutocompleteCtrl.isRequired"
            ng-minlength="inputMinlength"
            ng-maxlength="inputMaxlength"
            ng-disabled="$mdAutocompleteCtrl.isDisabled"
            ng-model="$mdAutocompleteCtrl.scope.searchText"
            ng-keydown="$mdAutocompleteCtrl.keydown($event)"
            ng-blur="$mdAutocompleteCtrl.blur(); onBlur($event)"
            ng-focus="$mdAutocompleteCtrl.focus()"
            aria-owns="ul-{{ $mdAutocompleteCtrl.id }}"
            aria-label="{{ floatingLabel }}"
            aria-autocomplete="list"
            aria-haspopup="true"
            aria-activedescendant=""
            aria-expanded="{{ !$mdAutocompleteCtrl.hidden }}"/>
      </md-input-container>

    <md-progress-linear ng-if="$mdAutocompleteCtrl.loading && !$mdAutocompleteCtrl.hidden" md-mode="indeterminate"></md-progress-linear>

    <md-virtual-repeat-container
          md-auto-shrink
          md-auto-shrink-min="1"
          ng-hide="$mdAutocompleteCtrl.hidden && !$mdAutocompleteCtrl.notFoundVisible()"
          class="md-autocomplete-suggestions-container md-whiteframe-z1"
          role="presentation">
        
        <ul class="md-autocomplete-suggestions"
            ng-class="::menuClass"
            id="ul-{{$mdAutocompleteCtrl.id}}"
            ng-mouseenter="$mdAutocompleteCtrl.listEnter()"
            ng-mouseleave="$mdAutocompleteCtrl.listLeave()"
            ng-mouseup="$mdAutocompleteCtrl.mouseUp()">
          
          <li md-virtual-repeat="item in $mdAutocompleteCtrl.matches"
              ng-class="{ selected: $index === $mdAutocompleteCtrl.index }"
              ng-click="$mdAutocompleteCtrl.select($index)"
              md-extra-name="$mdAutocompleteCtrl.itemName">
            <md-autocomplete-parent-scope md-autocomplete-replace>  
              <span md-highlight-text="searchText">{{item.display}}</span>
            </md-autocomplete-parent-scope>
          </li>
        </ul>
      </md-virtual-repeat-container>

    </md-autocomplete-wrap>
    
   <aria-status class="md-visually-hidden"role="status"aria-live="assertive"> <p ng-repeat="message in $mdAutocompleteCtrl.messages track by $index" ng-if="message">{{ message }}</p>
    </aria-status>'''
  link: (scope, element, attrs, ctrl) ->
    input = element.find 'input'
    inputContainer = element.find 'md-input-container'
    
    timeout = null

    animateElement = (toWidth) ->
      defer = $q.defer()
    
      if not timeout
        timeout = $timeout ->
          $animateCss inputContainer,
            from: width: inputContainer.prop 'clientWidth'
            to: width: toWidth
            easing: 'cubic-bezier(0.35, 0, 0.25, 1)'
            duration: 0.4
          .start().done -> 
            defer.resolve()
            timeout = null
        , 250, false
      else defer.reject()

      defer.promise

    scope.onBlur = ($event) -> 
      animateElement '0px'

    scope.searchIconClicked = ($event) ->  
      ctrl.scope.searchText = null
      animateElement('240px').then ->
        input.focus()
      
      return

    inputContainer.css width: '0px'
