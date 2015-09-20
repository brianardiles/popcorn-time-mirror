(function() {
  if (!window.nwDispatcher) return;


  var fs = window.require('fs');
  var watchDir = './js';

  if (fs.existsSync(watchDir)) {
    fs.watch(watchDir, function() {
      //gui.reloadIgnoringCache()
    });
  }
})();