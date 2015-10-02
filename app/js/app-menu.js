var ipc = require('ipc');

module.exports = Menu.buildFromTemplate([
  {
    label: 'Space Filler Explorer',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function() {
          ipc.send('quit');
        }
      }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Folder',
        accelerator: 'CmdOrCtrl+O',
        click: function() {
          ipc.send('select-directory');
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Show Tooltip',
        type: 'checkbox',
        checked: true,
        accelerator: 'CmdOrCtrl+T',
        click: function() {
          ipc.send('toggle-tooltip');
        }
      },
      {
        label: 'Show Sidebar',
        type: 'checkbox',
        checked: true,
        accelerator: 'CmdOrCtrl+D',
        click: function() {
          ipc.send('toggle-sidebar');
        }
      }
    ]
  }
]);
