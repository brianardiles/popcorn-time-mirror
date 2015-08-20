'use strict'

angular.module 'app.summary-wrapper', []

.directive 'ptSummaryWrapper', ->
  restrict: 'E'
  scope: { goBack: '&', title: '=', torrentId: '=?' }
  templateUrl: 'summary-wrapper/summary-wrapper.html'
