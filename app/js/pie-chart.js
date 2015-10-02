var d3 = require('d3');

function pieChart(svg) {
  var chart = {};
  var dataSet;
  var _colors = d3.scale.category10();
  var _radius = 100, _innerRadius = 0;
  var _transitionDuration = 500;

  function drawPieChart() {
    if (!dataSet) return;

    svg
      .selectAll('g.arc')
      .remove();

    svg
      .attr('height', _radius * 2)
      .attr('width', _radius * 2);

    var pie = d3.layout.pie()
      .sort(function(d) {
        return d.id;
      })
      .value(function(d) {
        return d.value;
      });

    var arc = d3.svg.arc()
      .outerRadius(_radius)
      .innerRadius(_innerRadius);

    var arcs = svg.selectAll("g.arc")
      .data(pie(dataSet))
      .enter()
      .append("g")
      .attr("class", "arc")
      .attr("fill", function(d, i) {
        return _colors(i);
      })
      .attr("transform", "translate(" + _radius + "," + _radius + ")");

    arcs.append("path")
      .transition()
      .duration(_transitionDuration)
      .attrTween('d', function(d) {
        var currentArc = this.__current__;
        if (!currentArc) {
          currentArc = {
            startAngle: 0,
            endAngle: 0
          };
        }
        var interpolate = d3.interpolate(currentArc, d);
        this.__current__ = interpolate(1);
        return function (t) {
          return arc(interpolate(t));
        };
      });

    arcs.append("text")
      .attr('dy', '.35em')
      .attr("transform", function(d) {
        return "translate(" + arc.centroid(d) + ")";
      })
      .text(function(d) {
        return d.data.name ? d.data.name : d.data.id;
      });
    }

  chart.data = function(data) {
    dataSet = data;
    drawPieChart();
    return chart;
  };

  chart.radius = function(radius) {
    _radius = radius;
    drawPieChart();
    return chart;
  };

  chart.innerRadius = function(innerRadius) {
    _innerRadius = innerRadius;
    drawPieChart();
    return chart;
  };

  chart.colors = function(colors) {
    _colors = colors;
    drawPieChart();
    return chart;
  };

  chart.transitionDuration = function(transitionDuration) {
    _transitionDuration = transitionDuration;
    return chart;
  };

  return chart;
}

module.exports = pieChart;
