var splashwin = require('nw.gui').Window.open('splash.html', {
    'frame': false, // frameless
    'toolbar': false,
    'position': 'center', // centered
    'width': 600,
    'resizable': false,
    'height': 300,
    'show_in_taskbar': false, // no nwjs icon in taskbar
    'transparent': true,
    'always-on-top': true // always on top
});