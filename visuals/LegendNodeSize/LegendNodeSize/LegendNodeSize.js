visualizationFunctions.LegendNodeSize = function(element, data, opts) {
    var context = this;
    context.config = context.CreateBaseConfig();
    // context.SVG = context.config.easySVG(element[0])
    context.VisFunc = function() {
        d3.xml("visuals/LegendNodeSize/LegendNodeSize/legend.svg").mimeType("image/svg+xml").get(function(error, xml) {
            if (error) throw error;
            context.SVG = d3.select(xml.documentElement);
            element[0].appendChild(context.SVG.node());

            context.setNodeSizes = function(arr) {
                var extent = d3.extent(arr);
                var avg = (extent[1] - extent[0]) / 2;
                context.getMaxNode()
                    .attr("r", extent[1])
                context.getMidNode()
                    .attr("r", avg)
                    .attr("cy", parseInt(context.getMaxNode().attr("cy")) + extent[1] - avg)
                context.getMinNode()
                    .attr("r", extent[0])
                    .attr("cy", parseInt(context.getMaxNode().attr("cy")) + extent[1] - extent[0])
            }
            context.getTitle = function() {
                return context.SVG.selectAll("#title");
            }

            context.getMaxG = function() {
                return context.SVG.selectAll("#maxG");
            }
            context.getMidG = function() {
                return context.SVG.selectAll("#midG");
            }
            context.getMinG = function() {
                return context.SVG.selectAll("#minG");
            }


            context.getMaxVal = function() {
                return context.getMaxG().selectAll("text");
            }
            context.getMidVal = function() {
                return context.getMidG().selectAll("text");
            }
            context.getMinVal = function() {
                return context.getMinG().selectAll("text");
            }
            context.getNote = function() {
                return context.SVG.selectAll("#note");
            }

            context.getMaxNode = function() {
                return context.SVG.selectAll("#maxNode");
            }
            context.getMidNode = function() {
                return context.SVG.selectAll("#midNode");
            }
            context.getMinNode = function() {
                return context.SVG.selectAll("#minNode");
            }

            context.setTitle = function(text) {
                context.getTitle().text(text);
            }
            context.setMaxVal = function(val) {
                context.getMaxVal().text(val);
            }
            context.setMidVal = function(val) {
                context.getMidVal().text(val);
            }
            context.setMinVal = function(val) {
                context.getMinVal().text(val);
            }
            context.setNote = function(text) {
                context.getNote().text(text);
            }

            //8 68 128

            context.SVG.attr("width", 150);
            context.SVG.attr("height", 150);
            // context.setNodeSizes([4, 64])
        });

        context.updateNodeSize = function(arr,zoom,viz) {
            var minNode = context.getMinNode();
            var midNode = context.getMidNode();
            var maxNode = context.getMaxNode();

            if (viz == "network" || viz == "scimap"){
                    minNode.transition()
  	                 .duration(100)
                        .attr("r", arr[0]*zoom);
                    midNode.transition()
  	                 .duration(100)
                        .attr("r", ((arr[0]+arr[1])/2)*zoom);
                    maxNode.transition()
  	                 .duration(100)
                        .attr("r", arr[1]*zoom);
                      }
            if (viz == "geomap"){
              var sortedArr = prosym01.spatialsankey.nodeSizeArr.sort();
              var max = sortedArr[sortedArr.length-1];
              var mid = (sortedArr[sortedArr.length-1] + sortedArr[0])/2;
              var min = sortedArr[0];
                      minNode.transition()
  	                     .duration(100)
                          .attr("r", min);
                      midNode.transition()
    	                 .duration(100)
                          .attr("r", mid);
                      maxNode.transition()
    	                 .duration(100)
                          .attr("r", max);
            }

              }

        context.updateTextFromFunc = function(viz){

           if(viz=="network"){
                var mid = (forceNetwork01.maxNumPapers + forceNetwork01.minNumPapers)/2;
                nodeSize.updateText([forceNetwork01.minNumPapers, mid, forceNetwork01.maxNumPapers]);
            }

            if(viz=="scimap"){
                var mid = (scimap01.maxValue + scimap01.minValue)/2;
                nodeSize.updateText([scimap01.minValue, mid, scimap01.maxValue]);
            }

            if(viz=="geomap"){
                var mid = (prosym01.minPapers + prosym01.maxPapers)/2;
                nodeSize.updateText([prosym01.minPapers, mid, prosym01.maxPapers]);
              }

        }

        context.updateText = function(arr) {
            context.setMinVal(Utilities.round(arr[0], 0))
            context.setMidVal(Utilities.round(arr[1], 0))
            context.setMaxVal(Utilities.round(arr[2], 0))
        }

    }
    return context;
}
