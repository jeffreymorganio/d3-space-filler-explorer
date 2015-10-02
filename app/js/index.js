var ipc = require("ipc");
var $ = require('jquery');
var remote = require('remote');
var Menu = remote.require('menu');
var appMenu = require('./js/app-menu');
var sidebar = require('./js/sidebar');
var treemap = require('./js/treemap');

function initApp() {
  initAppMenu();
  initTooltipCheckbox();
  addAppEventListeners();
  sidebar.populate();
  selectDirectoryAfterPieAnimationFinishes();
}

function initAppMenu() {
  Menu.setApplicationMenu(appMenu);
}

function initTooltipCheckbox() {
  checkTooltipCheckbox(true);
  enableTooltipCheckbox(false);
  addTooltipCheckboxLabelListener();

  function addTooltipCheckboxLabelListener() {
    tooltipCheckboxLabel().on('click', function() {
      var isEnabled = !tooltipCheckbox().prop('disabled');
      if (isEnabled) {
        toggleTooltipCheckboxAndFireChangeEvent();
      }
    });
  }
}

function checkTooltipCheckbox(isChecked) {
  tooltipCheckbox().prop('checked', isChecked);
}

function tooltipCheckbox() {
  return $('input[name="show-tooltip"]');
}

function checkTooltipCheckboxAndFireChangeEvent(isChecked) {
  checkTooltipCheckbox(isChecked);
  tooltipCheckbox().trigger('change');
}

function toggleTooltipCheckboxAndFireChangeEvent() {
  var isChecked = tooltipCheckbox().prop('checked');
  checkTooltipCheckboxAndFireChangeEvent(!isChecked);
}

function enableTooltipCheckbox(isEnabled) {
  tooltipCheckbox().prop('disabled', !isEnabled);
  if (isEnabled) {
    tooltipCheckboxLabel().removeClass('disabled');
  } else {
    tooltipCheckboxLabel().addClass('disabled');
  }
}

function tooltipCheckboxLabel() {
  return $('#show-tooltip-checkbox-label');
}

function addAppEventListeners() {
  ipc.on('update-directory', function(path, tree) {
    treemap.updateDirectory(path, tree);
    enableTooltipCheckbox(true);
  });

  ipc.on('toggle-tooltip', function(tooltipToggledWithCheckbox) {
    treemap.toggleTooltip();
    if (!tooltipToggledWithCheckbox) {
      var isChecked = tooltipCheckbox().prop('checked');
      checkTooltipCheckbox(!isChecked);
    }
  });

  ipc.on('toggle-sidebar', function() {
    sidebar.toggle();
    treemap.resize();
  });
}

function selectDirectoryAfterPieAnimationFinishes() {
  var delayToEnsurePieAnimationIsVisible = 750;
  setTimeout(function() {
    requestSelectDirectory();
  },
  delayToEnsurePieAnimationIsVisible);
}

function requestSelectDirectory() {
  ipc.send("select-directory");
}

function requestToggleTooltip(tooltipToggledWithCheckbox) {
  ipc.send("toggle-tooltip", tooltipToggledWithCheckbox);
}

function requestToggleTooltipWithCheckbox() {
  requestToggleTooltip(true);
}

function colloquialDirectory() {
  return process.platform === 'darwin' ? 'folder' : 'directory';
}
