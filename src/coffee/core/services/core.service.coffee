'use strict'

angular.module 'com.module.core'

.service 'CoreService', ->

  @alert = (title, text) ->
    #SweetAlert.swal title, text

  @alertSuccess = (title, text) ->
    #SweetAlert.swal title, text, 'success'

  @alertError = (title, text) ->
    #SweetAlert.swal title, text, 'error'

  @alertWarning = (title, text) ->
    #SweetAlert.swal title, text, 'warning'

  @alertInfo = (title, text) ->
    #SweetAlert.swal title, text, 'info'

  @confirm = (title, text, successCb, cancelCb) ->
    config = 
      title: title
      text: text
      type: 'warning'
      showCancelButton: true
      confirmButtonColor: '#DD6B55'
    @_swal config, successCb, cancelCb

  @_swal = (config, successCb, cancelCb) ->
    #SweetAlert.swal config, (confirmed) ->
    #  if confirmed
    successCb()
    #  else cancelCb()

  @toastSuccess = (title, text) ->
    #toasty.pop.success
    #  title: title
    #  msg: text
    #  sound: false

  @toastError = (title, text) ->
    #toasty.pop.error
    #  title: title
    #  msg: text
    #  sound: false

  @toastWarning = (title, text) ->
    #toasty.pop.warning
    #  title: title
    #  msg: text
    #  sound: false

  @toastInfo = (title, text) ->
    #toasty.pop.info
    #  title: title
    #  msg: text
    #  sound: false

  return