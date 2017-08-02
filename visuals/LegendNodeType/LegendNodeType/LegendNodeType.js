visualizationFunctions.LegendNodeType = function(element, data, opts) {
    var context = this;
    context.config = context.CreateBaseConfig();
    context.VisFunc = function() {
        d3.xml("visuals/LegendNodeType/LegendNodeType/legend.svg").mimeType("image/svg+xml").get(function(error, xml) {
            if (error) throw error;
            context.SVG = d3.select(xml.documentElement);
            element[0].appendChild(context.SVG.node());

            context.setTitle = function(text) {
                context.getTitle().text(text);
            }

            context.getTitle = function() {
                return context.SVG.selectAll("#title");
            }

            context.getG1 = function() {
                return context.SVG.selectAll("#g1");
            }
            context.getG2 = function() {
                return context.SVG.selectAll("#g2");
            }
            context.getG3 = function() {
                return context.SVG.selectAll("#g3");
            }
            context.getG4 = function() {
                return context.SVG.selectAll("#g4");
            }
            context.getG5 = function() {
                return context.SVG.selectAll("#g5");
            }

            context.getG1Val = function() {
                return context.getG1().selectAll("text");
            }
            context.getG2Val = function() {
                return context.getG2().selectAll("text");
            }
            context.getG3Val = function() {
                return context.getG3().selectAll("text");
            }
            context.getG4Val = function() {
                return context.getG4().selectAll("text");
            }
            context.getG5Val = function() {
                return context.getG5().selectAll("text");
            }

            context.setG1Val = function(val) {
                context.getG1Val().text(val);
            }
            context.setG2Val = function(val) {
                context.getG2Val().text(val);
            }
            context.setG3Val = function(val) {
                context.getG3Val().text(val);
            }
            context.setG4Val = function(val) {
                context.getG4Val().text(val);
            }
            context.setG5Val = function(val) {
                context.getG5Val().text(val);
            }

            context.setNote = function(text) {
                context.getNote().text(text);
            }
            context.SVG.attr("width", 150);
            context.SVG.attr("height", 150);
        });

        context.updateTypeColors = function(arr) {
            context.getG1().selectAll("rect").style("fill", arr[4])
            context.getG2().selectAll("rect").style("fill", arr[3])
            context.getG3().selectAll("rect").style("fill", arr[2])
            context.getG4().selectAll("rect").style("fill", arr[1])
            context.getG5().selectAll("rect").style("fill", arr[0])
        }

        context.updateText = function(arr) {
            context.setG1Val(arr[4])
            context.setG2Val(arr[3])
            context.setG3Val(arr[2])
            context.setG4Val(arr[1])
            context.setG5Val(arr[0])
        }

    }
    return context;
}
