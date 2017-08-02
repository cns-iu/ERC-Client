configs.barChart01 = {
    records: {
        colAggregator: "author"
    },
    bars: {
        styleEncoding: {
            size: {
                attr: "numPapers"
                    // attr: "weightFromEdges"
            },
            graphOffset: [10, 10]
        }
    },
    labels: {
        xAxis: {
            attr: "#Papers",
            orientation: "top"
        },
        yAxis: {
            attr: "",
            orientation: "right"
        },
    },
    orientation: "vertical"
}

events.barChart01 = function(ntwrk) {
    var labels = [];
    ntwrk.filteredData.records.data.forEach(function(d, i) {
        if (labels.indexOf(d.key) == -1) {
            labels.push(d.key);
        }
    })

    var newyAxis = d3.svg.axis()
        .scale(d3.scale.ordinal()
            .domain(labels)
            .range(ntwrk.chart.yscale().range()))
        .tickValues([])
        .ticks([])
    ntwrk.chart.chartYG().call(newyAxis)

    ntwrk.SVG.barGroups.each(function(d, i) {
        var currG = d3.select(this);
        var rect = d3.select(currG.selectAll("rect")[0][0])
        var offset = parseFloat(rect.attr("y")) - (parseFloat(rect.attr("height")) / 2) + parseFloat(rect.attr("height") * 1.25)
        currG.selectAll("rect").attr("fill", "white")
        currG.append("text")
            .attr("class", "wvf-label-mid")
            .attr("x", 4)
            .text(d.key)
            .attr("y", offset)
    });


    function showFilteredLabels() {
        forceNetwork01.SVG.nodeG.selectAll("text").style("display", "block")
        forceNetwork01.SVG.nodeG.selectAll("text").style("display", function(d1, i1) {
            if (!d1.keepLabel) {
                return "none"
            }
            return "block"
        });
    }
    ntwrk.SVG.barGroups.on("mouseover", function(d, i) {
        if (!forceNetwork01.isPopupShowing) {
            deselectSelection(forceNetwork01.SVG.nodeG);
            deselectSelection(forceNetwork01.SVG.edges);
            deselectSelection(ntwrk.SVG.barGroups);
            forceNetwork01.SVG.nodeG.selectAll("text").style("display", "none")
            var selected = forceNetwork01.SVG.nodeG.filter(function(d1, i1) {
                return d1.id == d.values.id
            })
            selectSelection(selected);
            selected.selectAll("text").style("display", "block");

            selectSelection(forceNetwork01.SVG.edges.filter(function(d1, i1) {
                return d.values.id == d1.source.id || d.values.id == d1.target.id;
            }))
            selectSelection(d3.select(this));
        }
    })

    ntwrk.SVG.barGroups.on("mouseout", function(d, i) {
        if (!forceNetwork01.isPopupShowing) {
            defaultSelection(forceNetwork01.SVG.nodeG);
            defaultSelection(forceNetwork01.SVG.edges);
            defaultSelection(ntwrk.SVG.barGroups);
            showFilteredLabels();
        }
    })

    ntwrk.SVG.barGroups.on("click", function(d, i) {
        var selected = findMatchingCoauthorNode(d, i);
        applyD3Event(selected.selectAll("circle"), "click")
    });

    function findMatchingCoauthorNode(d, i) {
        return forceNetwork01.SVG.nodeG.filter(function(d1, i1) {
            return d1.id == d.values.id
        });
    }

}
dataprep.barChart01 = function(ntwrk) {
    if (ntwrk.DataService.mapDatasource[ntwrk.attrs.ngDataField].toProcess) {
        var processedData = processAuthorSpec(ntwrk.filteredData);
        ntwrk.filteredData.records = processedData.nodes;
    }
}



configs.barChart02 = configs.barChart01
dataprep.barChart02 = dataprep.barChart01


events.barChart02 = function(ntwrk) {
    var labels = [];
    ntwrk.filteredData.records.data.forEach(function(d, i) {
        if (labels.indexOf(d.key) == -1) {
            labels.push(d.key);
        }
    })

    var newyAxis = d3.svg.axis()
        .scale(d3.scale.ordinal()
            .domain(labels)
            .range(ntwrk.chart.yscale().range()))
        .tickValues([])
        .ticks([])
    ntwrk.chart.chartYG().call(newyAxis)

    ntwrk.SVG.barGroups.each(function(d, i) {
        var currG = d3.select(this);
        var rect = d3.select(currG.selectAll("rect")[0][0])
        var offset = parseFloat(rect.attr("y")) - (parseFloat(rect.attr("height")) / 2) + parseFloat(rect.attr("height") * 1.25)
        currG.selectAll("rect").attr("fill", "white")
        currG.append("text")
            .attr("class", "wvf-label-mid")
            .attr("x", 4)
            .text(d.key)
            .attr("y", offset)
    });

    ntwrk.SVG.barGroups.on("mouseover", function(d, i) {
        if (!prosym01.isPopupShowing) {
        }
    })
    ntwrk.SVG.barGroups.on("mouseout", function(d, i) {
        if (!prosym01.isPopupShowing) {
        }
    })

    ntwrk.SVG.barGroups.on("click", function(d, i) {
        var selected = findMatchingCoauthorNode(d, i);
        applyD3Event(selected.selectAll("circle"), "click")
    });

    function applyD3Event(sel, evt) {
       $(sel[0]).d3Event(evt); 
    }

    function findMatchingCoauthorNode(d, i) {
        return prosym01.SVG.nodeG.filter(function(d1, i1) {
            return d1.id == d.values.id
        });
    }
}
