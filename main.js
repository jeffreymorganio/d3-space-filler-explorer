var app = require('app');
var ipc = require('ipc');
var dialog = require('dialog');
var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');
var fileSizeTree = require('file-size-tree-js');
var mainWindow = null;

app.on('ready', function() {
  createAppWindow();
  addAppEventListeners();
  registerKeyboardShortcuts();
});

function createAppWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
     // Include the application icon when packaging for Linux.
     // (The application icon when packaging for OS X and Windows
     // is included by the corresponding packaging scripts in
     // package.json.)
    icon: 'app/icons/Icon.png'
  });
  mainWindow.loadUrl('file://' + __dirname + '/app/index.html');
}

function addAppEventListeners() {
  app.on('window-all-closed', function() {
    quit();
  });

  ipc.on('select-directory', function(event, path) {
    if (path) {
      mapDirectory(path);
    } else {
      selectDirectory();
    }
  });

  ipc.on('toggle-sidebar', function() {
    toggleSidebar();
  });

  ipc.on('toggle-tooltip', function(event, tooltipToggledWithCheckbox) {
    toggleTooltip(tooltipToggledWithCheckbox);
  });

  ipc.on('quit', function() {
    quit();
  });
}

function registerKeyboardShortcuts() {
  globalShortcut.register('CmdOrCtrl+O', function() {
    selectDirectory();
  });

  globalShortcut.register('CmdOrCtrl+D', function() {
    toggleSidebar();
  });

  globalShortcut.register('CmdOrCtrl+T', function () {
    toggleTooltip();
  });

  globalShortcut.register('CmdOrCtrl+Q', function() {
    quit();
  });

  globalShortcut.register('Alt+CmdOrCtrl+I', function() {
    mainWindow.toggleDevTools();
  });
}

function selectDirectory() {
  var dialogOptions = {
    properties: ['openDirectory']
  };
  dialog.showOpenDialog(mainWindow, dialogOptions, function(filenames) {
    if (filenames === undefined) return;
    var path = filenames[0];
    mapDirectory(path);
  });
}

function mapDirectory(path) {
  console.log('mapDirectory():' + path);
  var options = {
    fileName: 'name',
    files: 'children',
    directoryName: 'name'
  };
  var tree = fileSizeTree(path, options);
  mainWindow.webContents.send('update-directory', path, tree);
}

function toggleSidebar() {
  mainWindow.webContents.send('toggle-sidebar');
}

function toggleTooltip(tooltipToggledWithCheckbox) {
  tooltipToggledWithCheckbox = tooltipToggledWithCheckbox || false;
  mainWindow.webContents.send('toggle-tooltip', tooltipToggledWithCheckbox);
}

function quit() {
  app.quit();
}
