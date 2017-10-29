/**
 * @namespace  HVBarChart
 * @type {Object}
 * @description Bar chart context can be flipped between a horizontal and vertical orientation. Options also allow stacked/non-stacked chart types depending on the configuration.
 */

 
 head.js('visuals/D3ProportionalSymbol/D3ProportionalSymbol/leaflet.js')
 visualizationFunctions.HVBarChart = function(element, data, opts) {
  var context = this;
  this.config = this.CreateBaseConfig();
  if(barChart02!=null)barChart02.click=0;
  this.VisFunc = function() {

    var chartOrientation = context.config.meta.orientation;
    if (chartOrientation == "vertical") {
      var newHeight = (22 * context.filteredData[context.PrimaryDataAttr].data.length)
      if (context.config.dims.fixedHeight < newHeight) {
        $(element[0]).parent().css({height: newHeight + 50});
      }
      context.config.dims.fixedHeight = newHeight;
    }
    context.SVG = context.config.easySVG(element[0])
    formatData();

    context.filteredData[context.PrimaryDataAttr].data.sort(function(a, b) {
      return b.values[context.config.meta.bars.styleEncoding.size.attr] - a.values[context.config.meta.bars.styleEncoding.size.attr];
    })

    var xOrientation = "top";
    context.chart = configureChartArea();
    context.SVG.barGroups = createBars();

    function formatData() {

      context.possibleRowValues = [];
      context.filteredData[context.PrimaryDataAttr].data.forEach(function(d, i) {
        if (context.possibleRowValues.indexOf(d[context.config.meta[context.PrimaryDataAttr].rowAggregator]) == -1) {
          context.possibleRowValues.push("" + d[context.config.meta[context.PrimaryDataAttr].rowAggregator])
        }
      })
      context.possibleRowValues.sort(function(a, b) {
        if (a > b) return 1
          return -1
      })

      function rollup(leaves) {
        var obj = { children: leaves };
        context.filteredData[context.PrimaryDataAttr].schema.forEach(function(d) {
          if (d.type == "numeric") {
            obj[d.name] = d3.sum(leaves, function(d1) {
              return d1[d.name];
            })
          }
        })
        return obj;
      }

      function nest(data, attr) {
        return d3.nest()
        .key(function(d) {
          return d[attr]
        })
        .rollup(rollup)
        .entries(data)
      }

      function getUnique(arr) {
        var u = {},
        a = [];
        for (var i = 0, l = arr.length; i < l; ++i) {
          if (u.hasOwnProperty(arr[i])) {
            continue;
          }
          a.push(arr[i]);
          u[arr[i]] = 1;
        }
        return a;

      }


      context.filteredData[context.PrimaryDataAttr].data = nest(context.filteredData[context.PrimaryDataAttr].data, context.config.meta[context.PrimaryDataAttr].colAggregator)
      context.filteredData[context.PrimaryDataAttr].data.forEach(function(d, i) {
        d[context.config.meta[context.PrimaryDataAttr].rowAggregator] = nest(d.values.children, context.config.meta[context.PrimaryDataAttr].rowAggregator)
      });

      context.filteredData[context.PrimaryDataAttr].data.forEach(function(d, i) {
        var list = d[context.config.meta[context.PrimaryDataAttr].rowAggregator].map(function(d1, i1) {
          return d1.key
        });
        var uniqueDifference = getUnique($(context.possibleRowValues).not(list).get());
        uniqueDifference.forEach(function(d1, i1) {
          var obj = new Object();
          obj.key = d1;
          obj.values = {
            children: []
          };
          d[context.config.meta[context.PrimaryDataAttr].rowAggregator].push(obj);
        })
      })
      context.filteredData[context.PrimaryDataAttr].data.forEach(function(d, i) {
        d[context.config.meta[context.PrimaryDataAttr].rowAggregator] = d[context.config.meta[context.PrimaryDataAttr].rowAggregator].sort(function(a, b) {
          return a.key.toString() > b.key.toString()
        });
      });
      context.filteredData[context.PrimaryDataAttr].data = context.filteredData[context.PrimaryDataAttr].data.sort(function(a, b) {
        return a.key - b.key
      });
    }

    function configureChartArea() {
      if (chartOrientation == "horizontal") {
        context.Scales.yScale = d3.scale.linear()
        .domain([d3.max(context.filteredData[context.PrimaryDataAttr].data, function(d, i) {
          return d.values[context.config.meta.bars.styleEncoding.size.attr]
        }), 0])
        context.Scales.xScale = d3.scale.linear()
        .domain([0, context.filteredData[context.PrimaryDataAttr].data.length])
      }
      if (chartOrientation == "vertical") {
        context.Scales.xScale = d3.scale.linear()
        .domain([0, d3.max(context.filteredData[context.PrimaryDataAttr].data, function(d, i) {
          return d.values[context.config.meta.bars.styleEncoding.size.attr]
        })])
        context.Scales.yScale = d3.scale.linear()
        .domain([0, context.filteredData[context.PrimaryDataAttr].data.length])
      }
      context.SVG.visG = context.SVG.append("g");
      var chart = Utilities.chartArea()
      .network(context)
      .selector(context.SVG.visG)
      .origin(context.config.meta.bars.styleEncoding.graphOffset)
      .end([context.config.dims.fixedWidth, context.config.dims.fixedHeight])
      .xscale(context.Scales.xScale)
      .xorientation(xOrientation)
      .xtitle(context.config.meta.labels.xAxis.attr, context.config.meta.labels.xAxis.orientation)
      .yscale(context.Scales.yScale)
      .ytitle(context.config.meta.labels.yAxis.attr, context.config.meta.labels.yAxis.orientation)
      chart();
      return chart;
    }

    function createBars() {
      return context.SVG.visG.append("g")
      .attr("transform", function(d, i) {
        if (chartOrientation == "horizontal") {
          return "translate(" + context.chart.xorigin()[0] + ", " + (context.chart.yorigin()[1] + d3.max(context.chart.yscale().range())) + ")"
        }
        if (chartOrientation == "vertical") {
          return "translate(" + (context.chart.xorigin()[0]) + ", " + (context.chart.xorigin()[1]) + ")"
        }
      })
      .selectAll("bars")
      .data(context.filteredData[context.PrimaryDataAttr].data)
      .enter()
      .append("g")
      .each(function(d, i) {
        var x = 0;
        var y = 0;
        var w = 0;
        var h = 0;
        var currG = d3.select(this);
        var prevX = 0;
        var prevY = 0;
        d[context.config.meta[context.PrimaryDataAttr].rowAggregator].forEach(function(d1, i1) {
          if (chartOrientation == "horizontal") {
            w = context.chart.xscale()(1) - 3;
            h = context.chart.yscale()(d3.max(context.chart.yscale().domain()) - d1.values[context.config.meta.bars.styleEncoding.size.attr]);
            x = context.chart.xscale()(i);
            if (xOrientation == "bottom") {
              y = context.chart.xscale()(0) - h;
              h = d3.max([h, 0]);
              y = d3.min([y + prevY, 0]);
            }
            if (xOrientation == "top") {
              y = -context.chart.yscale()(0) - prevY
            }
            prevY -= h
          }
          if (chartOrientation == "vertical") {
            w = context.chart.xscale()(d3.max([d1.values[context.config.meta.bars.styleEncoding.size.attr], 0]));
            h = context.chart.yscale()(1) - 3;
            x = context.chart.yscale()(0) + prevX;
            y = context.chart.yscale()(i);
            if (xOrientation == "bottom") {
              y = -context.chart.yscale()(i + 1);
            } else {
              y += 5;
            }
            prevX += w;
          }
          currG.append("rect")
          .attr("class", "wvf-rect bar-" + i + "-" + i1 + " " + d.key + " " + d1.key)
          .attr("x", x)
          .attr("y", y)
          .attr("width", w)
          .attr("height", h)
          .attr("fill", "white")
          if (chartOrientation == "vertical") {
            currG.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", context.config.dims.fixedWidth)
            .attr("height", h + 3.1)
            .attr("fill", "lightgrey")
            .style("opacity", .000001)
          }
          if (chartOrientation == "horizontal") {
            currG.append("rect")
            .attr("x", x)
            .attr("y", y - context.config.dims.fixedHeight)
            .attr("width", w)
            .attr("height", context.config.dims.fixedHeight)
            .attr("fill", "lightgrey")
            .style("opacity", .000001)
          }
        });
      })
      .on('mouseover', function(d,i){
       if(barChart02.click!=1){
         barChart02.SVG.selectAll("text.wvf-label-mid").attr("opacity",.25);

         d3.select(this).selectAll("text")[0][0].setAttribute("opacity",1);
         d3.select(this).selectAll("text")[0][0].style.fontWeight = "bold";
         d3.select(this).selectAll("text")[0][0].style.stroke = "black";
         d3.select(this).selectAll("text")[0][0].style.strokeWidth = ".5px";
         d3.select(this).selectAll("text")[0].parentNode.childNodes[0].style.fill = "darkgrey";
         prosym01.circs.transition().style('opacity',0);
         prosym01.circs.filter(function(d1,i1){
          if(d1.author === d.key)
          {


            var targetNodes=[];
            var targetNames=[];
            var nodelinks = prosym01.spatialsankey.links().filter(function(link){
              if (link.source == d1.id)
              {
                if ($.inArray(link.target,targetNodes)==-1)
                  targetNodes.push(link.target);
                return link.source;
              }

            });
            options = {'use_arcs': false, 'flip': false};
            beziers = prosym01.linklayer.selectAll("path").data(nodelinks);
            barChart02.link = prosym01.spatialsankey.link(options);

      // Draw new links
      beziers.enter()
      .append("path")
      .attr("d", barChart02.link)
      .attr('id', function(d){return d.id})
      .style("stroke-width", prosym01.spatialsankey.link().width());
      
      // Remove old links
      beziers.exit().remove(); 
      var circleUnderMouse = this;
      prosym01.circs.transition().style('opacity',function (d2) {  
       if(targetNodes.indexOf(d2.id)!=-1)
        targetNames.push(d2.author.toString());
      return (this === circleUnderMouse||targetNodes.indexOf(d2.id)!=-1) ? 0.7 : 0.2;
    }); 
      barChart02.SVG.barGroups.selectAll("text").forEach(function(d6,i6){

        if (targetNames.indexOf(d6[0].innerHTML)!=-1)
        {
          d6[0].setAttribute("opacity",1);
          
          d6[0].style.stroke = "black";
          
          d6.parentNode.childNodes[0].style.fill = "darkgrey";
        }

      })
    }
  })
                     //console.log(id);

                   }   })
      .on('mouseout', function(d,i){
        if(barChart02.click!=1){
         barChart02.SVG.selectAll("text").attr("opacity",1);
         barChart02.SVG.selectAll("text").style("stroke-width","0px");
         barChart02.SVG.selectAll("text").style("font-weight","bold");            
         barChart02.SVG.selectAll("rect").style("fill","lightgrey");
         prosym01.circs.transition().style('opacity',0.7);
                 // Remove links
                 prosym01.linklayer.selectAll("path").remove();
               }
             })

      .on('click',function(d,i){
        if(barChart02.click==0){
          barChart02.click=1;
          prosym01.click=1;
          barChart02.SVG.selectAll("text.wvf-label-mid").attr("opacity",.25);

          d3.select(this).selectAll("text")[0][0].setAttribute("opacity",1);
          d3.select(this).selectAll("text")[0][0].style.fontWeight = "bold";
          d3.select(this).selectAll("text")[0][0].style.stroke = "black";
          d3.select(this).selectAll("text")[0][0].style.strokeWidth = ".5px";
          d3.select(this).selectAll("text")[0].parentNode.childNodes[0].style.fill = "darkgrey";
          prosym01.circs.transition().style('opacity',0);
          prosym01.circs.filter(function(d1,i1){
            if(d1.author === d.key)
            {


              var targetNodes=[];
              var targetNames=[];
              var nodelinks = prosym01.spatialsankey.links().filter(function(link){
                if (link.source == d1.id)
                {
                  if ($.inArray(link.target,targetNodes)==-1)
                    targetNodes.push(link.target);
                  return link.source;
                }


              });
              options = {'use_arcs': false, 'flip': false};
              beziers = prosym01.linklayer.selectAll("path").data(nodelinks);
              barChart02.link = prosym01.spatialsankey.link(options);

      // Draw new links
      beziers.enter()
      .append("path")
      .attr("d", barChart02.link)
      .attr('id', function(d){return d.id})
      .style("stroke-width", prosym01.spatialsankey.link().width());
      
      // Remove old links
      beziers.exit().remove(); 
   // $("#zip-name").text(d.zip + "_");
    // if(d.tableD.length!=0) 
      // showPopup(d.tableD);
      prosym01.map.panTo(new L.LatLng(d.values.lat, d.values.lng))
      t = prosym01.filteredData.authors.data.filter(function(d1){
        return d1.author == d.key 
      })
       $("#zip-name").text(t[0].cutZip + "_");
      showPopup(t[0].tableD);
      var circleUnderMouse = this;
      prosym01.circs.transition().style('opacity',function (d2) {  
       if(targetNodes.indexOf(d2.id)!=-1)
        targetNames.push(d2.author.toString());
      return (this === circleUnderMouse||targetNodes.indexOf(d2.id)!=-1) ? 0.7 : 0.2;
    }); 

      barChart02.SVG.barGroups.selectAll("text").forEach(function(d6,i6){
    
        if (targetNames.indexOf(d6[0].innerHTML)!=-1)
        {
          d6[0].setAttribute("opacity",1);
          
          d6[0].style.stroke = "black";
          
          d6.parentNode.childNodes[0].style.fill = "darkgrey";
        }

      })
    }
  })
        }
        else{
          barChart02.click=0;
          prosym01.click=0;
          barChart02.SVG.selectAll("text").attr("opacity",1);
          barChart02.SVG.selectAll("text").style("stroke-width","0px");
          barChart02.SVG.selectAll("text").style("font-weight","bold");            
          barChart02.SVG.selectAll("rect").style("fill","lightgrey");
          prosym01.circs.transition().style('opacity',0.7);
                 // Remove links
                 prosym01.linklayer.selectAll("path").remove();
                 $(".popup").css({ display: "none" })

                 prosym01.map.panTo(new L.LatLng(40.737, -83.923));
                 if (prosym01.mark)prosym01.map.removeLayer(prosym01.mark);
               }

             })
    }
  }
  return context;
}
