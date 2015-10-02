var d3 = require('d3');
var $ = require('jquery');
var ipc = require('ipc');
var async = require('async');
var njds = require('nodejs-disks');
var pieChart = require('./pie-chart');
var showSidebar = true;

function populateSidebar() {
  var drivesInfo = [];
  async.series([
    function(callback) {
      getDrivesInfo(function(_driveInfo) {
        drivesInfo = _driveInfo;
        callback();
      });
    }
  ], function() {
    addDrives(drivesInfo);
  });
}

function getDrivesInfo(callback) {
  var drivesInfo = [];
  njds.drives(function(error, drives) {
    njds.drivesDetail(drives, function(error, driveData) {
      for (var i = 0; i < driveData.length; i += 1) {
        var driveInfo = getDriveInfo(driveData[i]);
        drivesInfo.push(driveInfo);
      }
      callback(drivesInfo);
    });
  });

  function getDriveInfo(driveData) {
    return {
      name: formatDriveName(),
      mount: driveData.mountpoint,
      total: driveData.total,
      used: driveData.used,
      free: driveData.available,
      usedPercentage: driveData.usedPer,
      freePercentage: driveData.freePer
    };

    function formatDriveName() {
      var name = driveData.mountpoint;
      var slashCount = name.split("/").length - 1;
      if (slashCount > 1) {
        var lastSlashIndex = driveData.mountpoint.lastIndexOf('/');
        name = driveData.mountpoint.substring(lastSlashIndex + 1);
        name = name.length === 0 ? '/' : name;
      }
      return name;
    }
  }
}

function addDrives(drivesInfo) {
  for (var i = 0; i < drivesInfo.length; i += 1) {
    var driveInfo = drivesInfo[i];
    addDrive(i, driveInfo);
  }

  function addDrive(driveNumber, driveInfo) {
    var chartWidth = calcChartWidth(drivesInfo.length);
    var freeColor = '#2DB82D';
    var usedColor = '#9EB0C8';
    var colorKey = d3.scale.ordinal()
      .domain([0, 1])
      .range([freeColor, usedColor]);

    var driveClickHandler = (function(driveInfo) {
      return function() {
        ipc.send('select-directory', driveInfo.mount);
      };
    })(driveInfo);

    var driveID = 'drive-' + driveNumber;
    var driveSelector = '#' + driveID;
    d3.select('#sidebar')
      .append('div')
        .attr('id', driveID)
        .attr('class', 'drive')
        .attr('title', 'Map ' + driveInfo.mount)
        .on('click', driveClickHandler)
      .append('hr');

    d3.select(driveSelector)
      .append('svg')
      .attr('class', 'piechart');
    var radius = chartWidth / 2;
    var innerRadius = radius / 3;
    var svg = d3.select(driveSelector + ' svg');
    var chart = pieChart(svg)
      .data(createDiskData(drivesInfo[driveNumber]))
      .radius(radius)
      .innerRadius(innerRadius)
      .colors(colorKey)
      .transitionDuration(750);

    d3.select(driveSelector)
      .append('p')
        .text(driveInfo.name);

    function calcChartWidth(numberOfDrives) {
      var minChartWidth = 125;
      var maxChartWidth = 150;
      var verticalSpaceForTitleAndSeparator = 60;
      var driveHeight = calcDriveHeight(numberOfDrives);
      driveHeight = Math.min(maxChartWidth, driveHeight - verticalSpaceForTitleAndSeparator);
      return Math.max(minChartWidth, driveHeight);

      function calcDriveHeight(numberOfDrives) {
        var sidebarHeight = $(window).height() - $('#toolbar').height();
        var driveHeight = sidebarHeight / numberOfDrives;
        return Math.floor(driveHeight);
      }
    }
  }

  function createDiskData(driveInfo) {
    var diskData = [];
    var free = parseSize(driveInfo.free);
    var used = parseSize(driveInfo.used);
    diskData.push({ id: 0, value: free.size, name: free.label  });
    diskData.push({ id: 1, value: used.size, name: used.label });
    return diskData;

    function parseSize(sizeString) {
      var parts = sizeString.split(' ');
      var size = +parts[0];
      var roundedSize = Math.round(size);
      var units = parts[1];
      var label = roundedSize + (size > 0 ? ' ' + units : '');
      return {
        size: size,
        roundedSize: roundedSize,
        units: units,
        label: label
      };
    }
  }
}

function toggleSidebar() {
  showSidebar = !showSidebar;
  d3.select('#sidebar')
    .classed('hidden', !showSidebar);
}

module.exports = {
  populate: populateSidebar,
  toggle: toggleSidebar
};
