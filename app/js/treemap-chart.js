var d3 = require('d3');
var numeral = require('numeral');

function treemapChart(svg) {
  var chart = {};
  var dataSet;
  var colors = d3.scale.category20();
  var width, height;
  var showTooltip = true;
  var _resizeDuration = 500;

  function drawTreemap() {
    if (!dataSet) return;

    displayTooltip(false);

    svg
      .attr('width', width)
      .attr('height', height);

    var treemap = d3.layout.treemap()
      .round(false)
      .size([width, height])
      .sticky(true)
      .value(function(d) {
        return d.size;
      });

    var nodes = treemap.nodes(dataSet)
      .filter(function(d) {
        return !d.children;
      });

    var cells = svg.selectAll('g')
      .data(nodes);

    var cellEnter = cells.enter()
      .append('g')
      .attr('class', 'cell');

    cellEnter.append('rect')
      .on('mouseover', function() {
        d3.select(this).classed('cell-hightlight', true);
      })
      .on('mousemove', function() {
        var mousePoint = d3.mouse(document.body);
        var data = dataOf(this);
        updateTooltip(mousePoint, data);
      })
      .on('mouseleave', function() {
        displayTooltip(false);
        d3.select(this).classed('cell-hightlight', false);
      });
      cellEnter.append('text');

    cells // update
      .transition()
      .duration(_resizeDuration)
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .select('rect')
      .attr('width', function(d) {
        return Math.max(0, d.dx - 1);
      })
      .attr('height', function(d) {
        return Math.max(0, d.dy - 1);
      })
      .style('fill', function(d) {
        return colors(d.parent.name);
      });

    cells.select('text')
      .attr('x', function(d) {
        return d.dx / 2;
      })
      .attr('y', function(d) {
        return d.dy / 2;
      })
      .attr('dy', '.35em')
      .text(function(d) {
          return d.name;
      })
      .style('opacity', function(d) {
        var textBounds = this.getBoundingClientRect();
        return d.dx - 2 > textBounds.width && textBounds.height < d.dy ? 1 : 0;
      });

    function dataOf(_this) {
      return d3.select(_this).data()[0];
    }

    function updateTooltip(mousePoint, data) {
      if (showTooltip) {
        updateTooltipContent();
        updateTooltipLocation();
      }

      function updateTooltipLocation() {
        var tooltipOffset = { x: 5, y: 20 };
        var mousePointInScreenCoordinates = {
          x: checkX(mousePoint[0]),
          y: checkY(mousePoint[1])
        };
        d3.select('#tooltip')
          .style('left', mousePointInScreenCoordinates.x + tooltipOffset.x + 'px')
          .style('top', mousePointInScreenCoordinates.y + tooltipOffset.y + 'px');

        function checkX(x) {
          var windowWidth = $(window).width() - 40;
          var tooltipWidth = $('#tooltip').width();
          var rightX = x + tooltipOffset.x + tooltipWidth;
          if (rightX > windowWidth) {
            var diff = rightX - windowWidth;
            x -= diff;
          }
          return x;
        }

        function checkY(y) {
          var windowHeight = $(window).height() - 30;
          var tooltipHeight = $('#tooltip').height();
          var bottomY = y + tooltipOffset.y + tooltipHeight;
          if (bottomY > windowHeight) {
            y -= tooltipOffset.y * -0.75;
            y -= tooltipHeight;
          }
          return y;
        }
      }

      function updateTooltipContent() {
        listItem(1).text(data.name);
        listItem(2).text(format(data.size));
        listItem(3).html('<pre>' + pathTreeOf(data) + '</pre>');
        displayTooltip(true);

        function listItem(n) {
          return tooltipList().select('li:nth-child(' + n + ')');
        }

        function tooltipList() {
          return d3.select('#tooltip ul');
        }

        function format(sizeInBytes) {
          return numeral(sizeInBytes).format('0 b');
        }

        function pathTreeOf(data) {
          var directoryNames = directoryNamesIn(data);
          var tree = '';
          var indentationLevel = 0;
          while (directoryNames.length) {
            var directoryName = directoryNames.shift();
            tree += directoryName;
            if (directoryNames.length) {
              tree += '\n' + indentation(indentationLevel);
            }
            indentationLevel += 1;
          }
          return tree;

          function indentation(n) {
            return Array(n + 2).join('   ');
          }
        }

        function directoryNamesIn(data) {
          var directoryNames = [];
          while (data.parent) {
            directoryNames.unshift(data.parent.name);
            data = data.parent;
          }
          return directoryNames;
        }
      }
    }
  }

  chart.data = function(data) {
    if (!arguments.length) return dataSet;
    dataSet = data;
    svg
      .selectAll('g')
      .remove();
    return chart;
  };

  chart.size = function(size) {
    width = size.width;
    height = size.height;
    drawTreemap();
    return chart;
  };

  chart.resizeDuration = function(resizeDuration) {
    _resizeDuration = resizeDuration;
    return chart;
  };

  chart.toggleTooltip = function() {
    showTooltip = !showTooltip;
    if (!showTooltip) displayTooltip(showTooltip);
    return chart;
  };

  function displayTooltip(showTooltip) {
    d3.select('#tooltip').classed('hidden', !showTooltip);
  }

  return chart;
}

module.exports = treemapChart;
