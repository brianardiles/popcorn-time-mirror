(function() {
  if (!window.nwDispatcher) return;


  var fs = window.require('fs');
  var watchDir = './js';
  var gui = window.require('nw.gui').Window.get()

  if (fs.existsSync(watchDir)) {
    fs.watch(watchDir, function() {
      gui.reloadIgnoringCache()
    });
  }
})();