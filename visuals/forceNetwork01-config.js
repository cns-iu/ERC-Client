configs.forceNetwork01 = {
    nodes: {
        styleEncoding: {
            size: {
                attr: "numPapers",
                range: [2, 10],
                scale: "linear"
            },
            color: {
                //TODO: Color code year of publication
                attr: "firstYearPublished",
                range: ["#61899E", "#D9D9D9"]
            }
        },
        identifier: {
            attr: "id" //Unique identifier
        }
    },
    edges: {
        styleEncoding: {
            strokeWidth: {
                attr: "weight",
                range: [1, 5]
            },
            opacity: {
                attr: "weight",
                range: [.375, 1]
            },
        },
        identifier: {
            attr: "id"
        }
    },
    labels: {
        identifier: {
            attr: "author"
        },
        styleEncoding: {
            size: {
                attr: "numPapers",
                range: [23, 35],
                scale: "linear"
            }
        }
    },
    visualization: {
        forceLayout: {
            linkStrength: 0.9,
            friction: .9,
            linkDistance: 25,
            theta: 0,
            alpha: .2
        }
    }
}

events.forceNetwork01 = function(ntwrk) {
    ntwrk.isPopupShowing = false;
    setTimeout(function() {
        configureDOMElements();
    }, 500);

    ntwrk.SVG.nodeG.each(function(d, i) {
        if (d.firstYearPublished == null) {
            d3.select(this).selectAll("circle").attr("fill", "white");
        }
    });

    ntwrk.SVG.nodeG.selectAll("text").style("pointer-events", "none")

    ntwrk.nodeClickEvent = function(d, i) {
        var tableData = [];

        ntwrk.filteredData.records.data.filter(function(d1, i1) {
            return (d1.author_ids.indexOf(d.idd) > -1);
        }).forEach(function(d1, i1) {
            var authNodes = [];
            d1.author_ids.forEach(function(d2, i2) {
                var authNode = ntwrk.filteredData.nodes.data.find(function(d4, i4) {
                    return (d2 == d4.idd);
                });

                if (authNode.idd != d.idd) authNodes.push(authNode.author);
            })
            if (d1.url !=null){
            tableData.push({
                authors: authNodes.join("; "),
                year: d1.year,
                title: d1.title,
                journal: d1.journal,
                url: d1.url,
                class: "enabled"

            })
        }
        else{
              tableData.push({
                authors: authNodes.join("; "),
                year: d1.year,
                title: d1.title,
                journal: d1.journal,
                url: "#",
                class: "disabled"

            })
        }

        })

        $("#popup-name").text(d[configs.forceNetwork01.labels.identifier.attr])
        //in Injectors.js. Makes it easier to do this across visualizations.
        showPopup(tableData);
        ntwrk.isPopupShowing = true;

    }
    ntwrk.edgeMouseover = function(d, i) {
        if (!ntwrk.isPopupShowing) {
            deselectSelection(ntwrk.SVG.edges);
            deselectSelection(ntwrk.SVG.nodeG);
            deselectSelection(barChart01.SVG.barGroups);
            selectSelection(d3.select(this));
            selectSelection(barChart01.SVG.barGroups.filter(function(d1, i1) {
                return d.source.id == d1.values.id || d.target.id == d1.values.id;
            }));

            var selectedNode = ntwrk.SVG.nodeG.filter(function(d1, i1) {
                return d.source.id == d1.id || d.target.id == d1.id;
            });
            selectSelection(selectedNode);
            selectedNode.selectAll("text").style("display", "block");

        }
    }
    ntwrk.edgeMouseout = function() {
        if (!ntwrk.isPopupShowing) {
            defaultSelection(ntwrk.SVG.nodeG);
            defaultSelection(ntwrk.SVG.edges);
            defaultSelection(barChart01.SVG.barGroups);
            showFilteredLabels();
        }
    }
    ntwrk.nodeMouseover = function(d, i) {
        if (!ntwrk.isPopupShowing) {
            d3.select(this).moveToFront();
            deselectSelection(ntwrk.SVG.edges);
            deselectSelection(ntwrk.SVG.nodeG);
            deselectSelection(barChart01.SVG.barGroups);

            var selectedEdges = ntwrk.SVG.edges.filter(function(d1, i1) {
                return d.id == d1.source.id || d.id == d1.target.id
            });
            selectedEdges.each(function(d1, i1) {
                selectSelection(barChart01.SVG.barGroups.filter(function(d2, i2) {
                    return d1.source.id == d2.values.id || d1.target.id == d2.values.id
                }));
            });
            selectSelection(selectedEdges);
            selectSelection(d3.select(this));
            ntwrk.SVG.nodeG.selectAll("text").style("display", "none");
            d3.select(this).selectAll("text").style("display", "block");
        }
    }
    ntwrk.nodeMouseout = function() {
        if (!ntwrk.isPopupShowing) {
            defaultSelection(ntwrk.SVG.nodeG);
            defaultSelection(ntwrk.SVG.edges);
            defaultSelection(barChart01.SVG.barGroups);
            showFilteredLabels();
        }
    }

    function updateNodes(val, orderedSizeCoding) {
        var p = orderedSizeCoding[Math.floor(val / 100 * orderedSizeCoding.length)];
        // ntwrk.filteredData.nodes.data = ntwrk.allNodes.filter(function(d, i) {
        //     return (d[configs.forceNetwork01.nodes.styleEncoding.size.attr] > p);
        // });
        ntwrk.filteredData.nodes.data = [];
        ntwrk.SVG.force.restart();
    }

    function updateLabelVisibility(val, orderedSizeCoding) {
        ntwrk.SVG.nodeG.selectAll("text").style("display", "none").classed("deselected", false).classed("selected", false);
        ntwrk.SVG.nodeG.selectAll("text").style("display", function(d, i) {
            if (d[configs.forceNetwork01.nodes.styleEncoding.size.attr] >= val) {
                d.keepLabel = true;
                return "block"
            } else {
                d.keepLabel = false;
                return "none"
            }
        });
    }

    function showFilteredLabels() {
        ntwrk.SVG.nodeG.selectAll("text").style("display", "block")
        ntwrk.SVG.nodeG.selectAll("text").style("display", function(d1, i1) {
            if (!d1.keepLabel) {
                return "none"
            }
            return "block"
        });
    }

    function configureDOMElements() {

        $('.drawer').drawer();

        var orderedSizeCoding = [];
        ntwrk.filteredData.nodes.data.forEach(function(d, i) {
            orderedSizeCoding.push(d[configs.forceNetwork01.nodes.styleEncoding.size.attr]);
        })
        orderedSizeCoding.sort(function(a, b) {
            return Number(a) - Number(b);
        });
        console.log(orderedSizeCoding);

        var $range = $("#range");
        $range.ionRangeSlider({
            min: d3.min(orderedSizeCoding),
            max: d3.max(orderedSizeCoding),
            from: d3.mean(orderedSizeCoding),
            // type: 'double',
            step: 1,
            grid: false,
            onChange: function(newVal) {
                updateLabelVisibility(newVal.from, orderedSizeCoding)
            }
        });

        ntwrk.allNodes = [].concat(ntwrk.filteredData.nodes.data);
        ntwrk.allEdges = [].concat(ntwrk.filteredData.edges.data);
        updateLabelVisibility(d3.mean(orderedSizeCoding), orderedSizeCoding);

        slider = $("#range").data("ionRangeSlider");
        var sliderFormElem = $("#sliderForm");
        var sliderFormScope = angular.element(sliderFormElem).scope();
        nodeSize.setTitle("#Papers")
        nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
        nodeSize.updateNodeSize(configs.forceNetwork01.nodes.styleEncoding.size.range,ntwrk.zoom.scale());
        nodeSize.updateTextFromFunc("network");

        edgeSize.setTitle("#Co-authored Papers")
        edgeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
        edgeSize.updateEdgeSize(configs.forceNetwork01.edges.styleEncoding.strokeWidth.range,ntwrk.zoom.scale());
        edgeSize.updateTextFromFunc();

        nodeColor.setTitle("Year of First Publication")
        nodeColor.updateStopColors(configs.forceNetwork01.nodes.styleEncoding.color.range)
        nodeColor.updateText([d3.min(ntwrk.Scales.nodeColorScale.domain()), d3.mean(ntwrk.Scales.nodeColorScale.domain()), d3.max(ntwrk.Scales.nodeColorScale.domain())])

        var roleColor = ["#35618f", "#bde267", "#60409b", "#3dcdc1","#d3d3d3"];
        nodeType.setTitle("Author Type")

        nodeType.updateTypeColors(roleColor)
        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }

        ntwrk.SVG.nodeG.selectAll("circle").style("stroke", function(d, i) {
          switch (d.role) {
            case "other": return roleColor[0]; break;
            case "faculty": return roleColor[1]; break;
            case "postdoc": return roleColor[2]; break;
            case "staff": return roleColor[3]; break;
            case "student": return roleColor[4]; break;
            default: return roleColor[0]; break;
          }
        })


        barChart01.SVG.barGroups.selectAll("rect").style("stroke", function(d, i) {

          switch (d.values.children[0].role) {
            case "other": return roleColor[0]; break;
            case "faculty": return roleColor[1]; break;
            case "postdoc": return roleColor[2]; break;
            case "staff": return roleColor[3]; break;
            case "student": return roleColor[4]; break;
            default: return roleColor[0]; break;
          }
        })

        //Faculty, Student, Unknown
        var typeArr = ["Other","Faculty","Postdoc","Staff","Student"];
        ntwrk.filteredData.nodes.data.forEach(function(d, i) { if (d.role == null) d.role = "Other"})
        // ntwrk.filteredData.nodes.data.forEach(function(d, i) { if (typeArr.indexOf(toTitleCase(d.role)) == -1) typeArr.push(toTitleCase(d.role))})
        nodeType.updateText(typeArr)
        ntwrk.SVG.on("mousewheel", function() {
            setTimeout(function() {

                nodeSize.updateNodeSize(configs.forceNetwork01.nodes.styleEncoding.size.range, ntwrk.zoom.scale());

                nodeSize.updateTextFromFunc(function(d) {
                    return ntwrk.Scales.nodeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
                });
                // edgeSize.updateTextFromFunc(function(d) {
                //     return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
                // });
                nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
                edgeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
            }, 10);
        });
    }

    ntwrk.SVG.edges.on("mouseover", ntwrk.edgeMouseover)
    ntwrk.SVG.edges.on("mouseout", ntwrk.edgeMouseout)
    ntwrk.SVG.nodeG.on("mouseover", ntwrk.nodeMouseover)
    ntwrk.SVG.nodeG.on("mouseout", ntwrk.nodeMouseout)
    ntwrk.SVG.nodeG.selectAll("circle").on("click", ntwrk.nodeClickEvent)
    ntwrk.SVG.nodeG.selectAll("rect").on("click", ntwrk.nodeClickEvent)

    ntwrk.SVG.background.on("click", function() {

        $(".popup").css({ display: "none" })
        ntwrk.isPopupShowing = false;
        ntwrk.nodeMouseout();
         $("#colorpicker").hide();
    })
}

dataprep.forceNetwork01 = function(ntwrk) {
    if (ntwrk.DataService.mapDatasource[ntwrk.attrs.ngDataField].toProcess) {
        var processedData = processAuthorSpec(ntwrk.filteredData);
        ntwrk.filteredData.nodes = processedData.nodes;
        ntwrk.filteredData.edges = processedData.edges;
    }
    ntwrk.maxNumPapers = 0;
    ntwrk.minNumPapers = 0;
    ntwrk.filteredData.nodes.data.forEach(function(d){
        if (d.numPapers>ntwrk.maxNumPapers){
            ntwrk.maxNumPapers = d.numPapers;
        }
        if(d.numPapers<ntwrk.minNumPapers){
            ntwrk.minNumPapers = d.numPapers;
        }
    })

    ntwrk.maxEdgeWeight = 0;
    ntwrk.minEdgeWeight = 1;
    ntwrk.filteredData.edges.data.forEach(function(d){
        if (d.weight>ntwrk.maxEdgeWeight){
            ntwrk.maxEdgeWeight = d.weight;
        }
        if(d.weight<ntwrk.minEdgeWeight){
            ntwrk.minEdgeWeight = d.weight;

        }
    })

    }
