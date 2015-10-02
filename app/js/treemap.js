var d3 = require('d3');
var $ = require('jquery');
var _ = require('underscore');
var treemapChart = require('./treemap-chart');
var chart;

function toggleTooltip() {
  chart.toggleTooltip();
}

function formatTitle(path) {
  var title = 'Space Filler Explorer';
  if (path) {
    title += ' - ' + path;
  }
  document.title = title;
}

function updateDirectory(path, tree) {
  formatTitle(path);
  var svg = d3.select('svg.treemap');
  chart = treemapChart(svg)
    .data(tree)
    .resizeDuration(250);
  resizeTreemap();
  chart.resizeDuration(500);

  var _resizeTreemap = _.debounce(resizeTreemap, 250);
  $(window).resize(function() {
    _resizeTreemap();
  });
}

function resizeTreemap() {
  chart.size(treemapSize());
}

function treemapSize() {
  var amountToEnsureScrollbarsDontAppear = 25;
  return {
    width: treemapWidth() - amountToEnsureScrollbarsDontAppear,
    height: treemapHeight() - amountToEnsureScrollbarsDontAppear
  };

  function treemapWidth() {
    var sidebarHidden = d3.select('#sidebar').classed('hidden');
    var sidebarWidth = sidebarHidden ? 0 : $('#sidebar').width();
    return $(window).width() - sidebarWidth;
  }

  function treemapHeight() {
    return $(window).height() - $('#toolbar').height();
  }
}

module.exports = {
  formatTitle: formatTitle,
  updateDirectory: updateDirectory,
  toggleTooltip: toggleTooltip,
  resize: resizeTreemap
};
