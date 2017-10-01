

head.js('visuals/D3ProportionalSymbol/D3ProportionalSymbol/d3.js')
head.js('visuals/D3ProportionalSymbol/D3ProportionalSymbol/leaflet.js')
head.js('visuals/D3ProportionalSymbol/D3ProportionalSymbol/spatialsankey.js')

visualizationFunctions.D3ProportionalSymbol = function(element, data, opts) {
  var context = this;
  this.VisFunc = function() {
 context.SVG.background = context.SVG.append("rect")
            .attr("opacity", .000001)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("x", 0)
            .attr("y", 0)


        nestData();
        context.SVG.g = context.SVG.append("g")
      
     context.config = context.CreateBaseConfig();
     context.update = function() {

      if (context.PrimaryDataAttr == "nodes") {

        if (true) {
          var nodeData = {};
          var edgeData = [];
          context.filteredData[context.PrimaryDataAttr].data[context.currCategory].forEach(function(d, i) {
            nodeData[i] = d;
          })
          context.filteredData.edges.data.forEach(function(d, i) {
            var s = Object.keys(nodeData).filter(function(d1, i1) {
              return nodeData[d1].values.children.filter(function(d2, i2) {
                return d2.id == d.source
              }).length > 0;
            })[0]

            var t = Object.keys(nodeData).filter(function(d1, i1) {
              return nodeData[d1].values.children.filter(function(d2, i2) {
                return d2.id == d.target
              }).length > 0;
            })[0]

            if (s == t) {
                            //do something about this?
                          } else {
                            var existingEdge = edgeData.filter(function(d1, i1) {
                              return ((d1.source == s) && (d1.target == t))
                            })
                            if (existingEdge.length > 0) {
                              existingEdge[0].d.push(d);
                            } else {
                              edgeData.push({
                                   "source": s,
                                    "target": t,
                                    "d": [d]
                                  })
                            }
                          }
                        });


        } 
      }


    }

    if (!context.edgeFunc) {
      context.edgeFunc = function(d, i, proj) {
        var s = context.SVG.nodeG.filter(".id-" + d.source).data()[0];
        var t = context.SVG.nodeG.filter(".id-" + d.target).data()[0];
        s.projected = s.projected || [0, 0];
        t.projected = t.projected || [0, 0];
        return Utilities.lineFunction([{
          x: s.projected[0],
          y: s.projected[1]
        }, {
          x: t.projected[0],
          y: t.projected[1]
        }])
      }
    }
 
    function nestData() {
      context.categories = context.config.meta.categories;
      context.categoryBank = {};

      context.categories.forEach(function(category, i) {
        context.categoryBank[category] = nest(category, i);
      })

      context.filteredData[context.PrimaryDataAttr].data = context.categoryBank;
      context.currCategory = context.categories[0];

      context.categoryScales = {};
      context.categories.forEach(function(d, i) {
        var sizeScale = d3.scale[context.config.meta[context.PrimaryDataAttr].styleEncoding.size.scaleType || "linear"]()
        .domain(d3.extent(context.filteredData[context.PrimaryDataAttr].data[d], function(d1, i1) {
          d1.sizeSum = d3.sum(d1.values.children, function(d2, i2) {
            return d2[context.config.meta[context.PrimaryDataAttr].styleEncoding.size.attr]
          })
          return d1.sizeSum;
        }))
        .range(context.config.meta[context.PrimaryDataAttr].styleEncoding.size.range)
        context.categoryScales[d] = {};
        context.categoryScales[d].size = sizeScale;
      });
    }

    function nest(category, i) {
      return d3.nest()
      .key(function(d) {
        return d[category];
      })
      .rollup(function(leaves) {
        var obj = {
          children: leaves
        };
        context.filteredData[context.PrimaryDataAttr].schema.forEach(function(d) {
          if (d.type == "numeric") {
            obj[d.name] = d3.mean(leaves, function(d1) {
              return d1[d.name];
            })
          }
        })
        return obj;
      })
      .entries(context.filteredData[context.PrimaryDataAttr].data);
    }

    context.update();
}
  //  k = context.filteredData.edges.data;
// Define the div for the tooltip
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);
  // Set leaflet map
   context.map = new L.map('map', {
    center: new L.LatLng(50,15),
    zoom: 4,
    layers: [
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      noWrap:true,
      minZoom: 4,
      maxZoom: 20,
      ext: 'png'
    })
    ]
  });

// Initialize the SVG layer
context.map._initPathRoot()

context.map.panTo(new L.LatLng(40.737, -83.923));




// Setup svg element to work with
var svg = d3.select("#map").select("svg");
prosym01.linklayer = svg.append("g"),
prosym01.nodelayer = svg.append("g");

// Load data asynchronosuly
d3.json("nodes.geojson", function(nodes) {
  d3.csv("links.csv", function(links) {

    // Setup spatialsankey object
    prosym01.spatialsankey = d3.spatialsankey()
    .lmap(context.map)
    .nodes(context.filteredData.authors.data)
    .links(context.filteredData.edges.data);


    context.Scales.nodeSizeScale = Utilities.makeDynamicScaleNew(d3.extent(prosym01.spatialsankey.nodeSizeArr, function(d, i) {
            return d;
        }), context.config.meta.nodes.styleEncoding.size.range)

    var mouseover = function(d){
       div.transition()    
                .duration(200)    
                .style("opacity", .7);    
        div.html(d.author + "<br/>" )  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px")
                .style("background","black") 
                .style("color","white");

              
if (prosym01.click==0){
       


      var targetNodes=[];
      var targetNames=[];
      // Get link data for this prosym01.node
      var nodelinks = prosym01.spatialsankey.links().filter(function(link){
         if (link.source == d.id)
          {
            if ($.inArray(link.target,targetNodes)==-1)
              targetNodes.push(link.target);
          return link.source;
          }
      });


      // Add data to link layer
      var beziers = prosym01.linklayer.selectAll("path").data(nodelinks);
      link = prosym01.spatialsankey.link(options);

      // Draw new links
      beziers.enter()
      .append("path")
      .attr("d", link)
      .attr('id', function(d){return d.id})
      .style("stroke-width", prosym01.spatialsankey.link().width());
      
      // Remove old links
      beziers.exit().remove();


      // Hide inactive nodes
      var circleUnderMouse = this;
      prosym01.circs.transition().style('opacity',function (d) {
        if(targetNodes.indexOf(d.id)!=-1)
          targetNames.push(d.author);
        return (this === circleUnderMouse|| targetNodes.indexOf(d.id)!=-1) ? 0.7 : 0;
      });


      barChart02.SVG.selectAll("text.wvf-label-mid").attr("opacity",.25);
      barChart02.SVG.barGroups.selectAll("text").forEach(function(d6,i6){
        
        if (d6[0].innerHTML == d.author.toString()){
          d6[0].setAttribute("opacity",1);
          d6[0].style.fontWeight = "bold";
          d6[0].style.stroke = "black";
          d6[0].style.strokeWidth = ".5px";
          d6.parentNode.childNodes[0].style.fill = "darkgrey";
        }
        if (targetName.indexOf(d6[0].innerHTML)!=-1)
        {
          d6[0].setAttribute("opacity",1);
          d6[0].style.fontWeight = "bold";
          d6[0].style.stroke = "black";
          d6[0].style.strokeWidth = ".5px";
          d6.parentNode.childNodes[0].style.fill = "darkgrey";
        }


      })


}

};

var mouseout = function(d) {
  div.transition()    
                .duration(500)    
                .style("opacity", 0); 
if (prosym01.click==0){
 barChart02.SVG.selectAll("text").attr("opacity",1);
 barChart02.SVG.selectAll("text").style("stroke-width","0px");
 barChart02.SVG.selectAll("text").style("font-weight","bold");            
 barChart02.SVG.selectAll("rect").style("fill","#eaeaea");

      // Remove links
      prosym01.linklayer.selectAll("path").remove();
      // Show all nodes
      prosym01.circs.transition().style('opacity', 0.7);

    }
    };

var click = function(d){
 if (prosym01.click==0){

 prosym01.click=1;
 barChart02.click=1;
barChart02.SVG.selectAll("text.wvf-label-mid").attr("opacity",.25);
      barChart02.SVG.barGroups.selectAll("text").forEach(function(d6,i6){
        if (d6[0].innerHTML == d.author.toString()){
          d6[0].setAttribute("opacity",1);
          d6[0].style.fontWeight = "bold";
          d6[0].style.stroke = "black";
          d6[0].style.strokeWidth = ".5px";
          d6.parentNode.childNodes[0].style.fill = "darkgrey";
        }


      })
      
      var targetNodes=[]
      // Get link data for this prosym01.node
      var nodelinks = prosym01.spatialsankey.links().filter(function(link){
          if (link.source == d.id)
          {
            if ($.inArray(link.target,targetNodes)==-1)
              targetNodes.push(link.target);
          return link.source;
          }
      });
  
      // Add data to link layer
      var beziers = prosym01.linklayer.selectAll("path").data(nodelinks);
      link = prosym01.spatialsankey.link(options);

      // Draw new links
      beziers.enter()
      .append("path")
      .attr("d", link)
      .attr('id', function(d){return d.id})
      .style("stroke-width", prosym01.spatialsankey.link().width());
      
      // Remove old links
      beziers.exit().remove();


      // Hide inactive nodes
      var circleUnderMouse = this;
      prosym01.circs.transition().style('opacity',function (d) {
        return (this === circleUnderMouse || targetNodes.indexOf(d.id)!=-1) ? 0.7 : 0;
      });



      if(d.tableD.length!=0)    
        showPopup(d.tableD);

    }
    else{
      prosym01.click=0;
      barChart02.click=0;
      barChart02.SVG.selectAll("text").attr("opacity",1);
 barChart02.SVG.selectAll("text").style("stroke-width","0px");
 barChart02.SVG.selectAll("text").style("font-weight","bold");            
 barChart02.SVG.selectAll("rect").style("fill","#eaeaea");

      // Remove links
      prosym01.linklayer.selectAll("path").remove();
      // Show all nodes
      prosym01.circs.transition().style('opacity', 0.7);
    
        $(".popup").css({ display: "none" })
     
    }
      
};



    // Draw nodes
    prosym01.node = prosym01.spatialsankey.node()
    prosym01.circs = prosym01.nodelayer.selectAll("circle")
    .data(prosym01.spatialsankey.nodes())
    .enter()
    .append("circle")
    .attr("cx", prosym01.node.cx)
    .attr("cy", prosym01.node.cy)
    .attr("r", prosym01.node.r)
    .style("fill", prosym01.node.fill)
    .attr("opacity", 0.7)
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
    .on("click",click)
    .attr("class",function(d){
      return d.author;
    });
// prosym01.SVG.nodeG = prosym01.circs;

prosym01.click=0;
    // Adopt size of drawn objects after leaflet zoom reset
    var zoomend = function(){
      prosym01.linklayer.selectAll("path").attr("d", prosym01.spatialsankey.link());

      prosym01.circs.attr("cx", prosym01.node.cx)
      .attr("cy", prosym01.node.cy);
    };

    context.map.on("zoomend", zoomend);
  });
});
var options = {'use_arcs': false, 'flip': false};
d3.selectAll("input").forEach(function(x){
  options[x.name] = parseFloat(x.value);
})

d3.selectAll("input").on("click", function(){
  options[this.name] = parseFloat(this.value);
});


this.configSchema = {
        records: {
            styleEncoding: {
                size: {
                    attr: "id",
                    range: [4, 10],
                    scaleType: "linear"
                }
            }
        },
        //optional. Primary data attr must be "nodes"
        edges: {
            styleEncoding: {
                size: {
                    attr: "weight",
                    range: [.5, 2]
                }
            }
        },
        identifier: "id",
        lat: "lat",
        lng: "lng",
        categories: ["id"]
    }
    context.config = context.CreateBaseConfig();
    context.SVG = context.config.easySVG(element[0], {
        zoomable: true,
        zoomLevels: [.5, 20],
    })

return this;
}










