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
            context.setNodeSizes([4, 64])
        });

        context.updateNodeSize = function(arr) {          
            var minNode = context.getMinNode();
            var midNode = context.getMidNode();
            var minNodeSize = (64 * arr[0]) / arr[1];
            var midNodeSize = (64 + minNodeSize) / 2;

            minNode
                .attr("r", minNodeSize)
                .attr("cy", 174 - minNodeSize)
            
            midNode
                .attr("r", midNodeSize)
                .attr("cy", 174 - midNodeSize)
            context.getMidG().attr("transform", "translate(70," + (174 - (midNodeSize * 2)) + ")")
            context.getMinG().attr("transform", "translate(70," + (174 - (minNodeSize * 2)) + ")")
        }

        context.updateTextFromFunc = function(viz){
           
           if(viz=="network"){
                var max = forceNetwork01.Scales.nodeSizeScale(forceNetwork01.maxNumPapers)*forceNetwork01.zoom.scale();
                m = (forceNetwork01.maxNumPapers - forceNetwork01.minNumPapers)/2;
                var mean = forceNetwork01.Scales.nodeSizeScale(m)*forceNetwork01.zoom.scale();
                var min = forceNetwork01.Scales.nodeSizeScale(forceNetwork01.minNumPapers)*forceNetwork01.zoom.scale();
                nodeSize.updateText([min, mean, max]);
            }

            if(viz=="scimap"){
                var max = scimap01.Scales.rScale(scimap01.maxValue)*scimap01.zoom.scale();
                m = (scimap01.maxValue - scimap01.minValue)/2;
                var mean = scimap01.Scales.rScale(m)*scimap01.zoom.scale();
                var min = scimap01.Scales.rScale(scimap01.minValue)*scimap01.zoom.scale();
                nodeSize.updateText([min, mean, max]);
            }

            if(viz=="geomap"){
                var max = prosym01.spatialsankey.nodeSizeArr.sort()[prosym01.spatialsankey.nodeSizeArr.length-1]*prosym01.map.getZoom();
                m = (prosym01.spatialsankey.nodeSizeArr.sort()[prosym01.spatialsankey.nodeSizeArr.length-1] - prosym01.spatialsankey.nodeSizeArr.sort()[0])/2;
                var mean = m*prosym01.map.getZoom();;
                var min = prosym01.spatialsankey.nodeSizeArr.sort()[0]*prosym01.map.getZoom();;
                nodeSize.updateText([min, mean, max]);
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
