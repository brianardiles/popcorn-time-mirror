splashwin = require('nw.gui').Window.open('./splash.html', {
    'frame': false, // frameless
    'toolbar': false,
    'icon': "images/icon.png",
    'position': 'center', // centered
    'width': Math.round(window.screen.width * 0.24) || 460,
    'resizable': false,
    'height': Math.round(window.screen.width * 0.13) || 250,
    'transparent': true,
    'always-on-top': true // always on top
});

if (require('nw.gui').App.fullArgv.indexOf('--debug') !== -1) {
    require('nw.gui').Window.get().showDevTools();
    splashwin.close(false)
}