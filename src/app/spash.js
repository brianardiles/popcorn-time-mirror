var splashwin = require('nw.gui').Window.open('splash.html', {
    'frame': false, // frameless
    'toolbar': false,
    'position': 'center', // centered
    'width': Math.round(window.screen.width * 0.24) || 460,
    'resizable': false,
    'height': Math.round(window.screen.width * 0.09) || 180,
    'show_in_taskbar': false, // no nwjs icon in taskbar
    'transparent': true,
    'always-on-top': true // always on top
});

require('nw.gui').Window.get().showDevTools();
