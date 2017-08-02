configs.prosym01 = {
    nodes: {
        styleEncoding: {
            size: {
                attr: "numPapers",
                range: [4, 10],
                scaleType: "linear"
            }
        }
    },

    edges: {
        styleEncoding: {
            size: {
                attr: "weight",
                range: [.5, 2]
            }
        }
    },
    identifier: "id", //Unique identifier
    lat: "lat",
    lng: "lng",
    categories: ["cutZip"]
}


dataprep.prosym01 = function(ntwrk) {
    if (ntwrk.DataService.mapDatasource[ntwrk.attrs.ngDataField].toProcess) {
        var processedData = processAuthorSpec(ntwrk.filteredData);
        ntwrk.filteredData.nodes = processedData.nodes;
        ntwrk.filteredData.edges = processedData.edges;
    }

    ntwrk.filteredData.nodes.data.forEach(function(d, i) {
        d.cutZip = d.zip.toString().slice(0, 4);
    });
    ntwrk.PrimaryDataAttr = "nodes";
}

events.prosym01 = function(ntwrk) {
    ntwrk.SVG.nodeG.style("fill", "#d9d9d9")
    var yearMin = Number.POSITIVE_INFINITY
    var yearMax = Number.NEGATIVE_INFINITY
    ntwrk.SVG.nodeG.filter(function(d, i) {
        d.values.children.forEach(function(d1, i1) {
            if (d1.firstYearPublished < yearMin) {
                yearMin = d1.firstYearPublished;
            }
            if (d1.firstYearPublished > yearMax) {
                yearMax = d1.firstYearPublished;
            }
        })
    })
    ntwrk.Scales.nodeColorScale = d3.scale.linear()
        .domain([yearMin, yearMax])
        .range(["#61899e", "#d9d9d9"])

    ntwrk.SVG.nodeG.each(function(d, i) {
        var currMin = d3.min(d.values.children, function(d1, i1) {            
            return d1.firstYearPublished;
        })
        d3.select(this).selectAll("circle").attr("fill", ntwrk.Scales.nodeColorScale(currMin))
    })




    ntwrk.isPopupShowing = false;

    setTimeout(function() {
        configureDOMElements();
    }, 500)

    ntwrk.nodeClickEvent = function(d, i) {
        
        var tableData = [];

        $("#zip-name").text(d.key + "_");
        var auths = [];
        d.values.children.forEach(function(d1, i1) {
            auths.push(d1.idd);
        });

        var pubs = [];
        ntwrk.filteredData.records.data.forEach(function(d1, i1) {
            auths.forEach(function(d2, i2) {
                if (d1.author_ids.indexOf(d2) && pubs.indexOf(d1) == -1) {
                    pubs.push(d1);
                }
            })
        })

        pubs.forEach(function(d1, i1) {
            var authNames = [];
            d1.author_ids.forEach(function(d2, i2) {
                authNames.push(ntwrk.filteredData.authors.data.find(function(d4, i4) {
                    return d4.idd == d2;
                }).author)
            })
            tableData.push({
                authors: authNames.join("; "),
                year: d1.year,
                title: d1.title,
                journal: d1.journal
            })
        })


        //in Injectors.js. Makes it easier to do this across visualizations.    
        showPopup(tableData);
        ntwrk.isPopupShowing = true;        
    }
    ntwrk.edgeMouseover = function(d, i) {
        if (!ntwrk.isPopupShowing) {
            deselectSelection(ntwrk.SVG.edges);
            deselectSelection(ntwrk.SVG.nodeG);
            deselectSelection(barChart02.SVG.barGroups);
            selectSelection(d3.select(this));
            selectSelection(barChart02.SVG.barGroups.filter(function(d1, i1) {
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
            defaultSelection(barChart02.SVG.barGroups);
        }
    }
    ntwrk.nodeMouseover = function(d, i) {
        if (!ntwrk.isPopupShowing) {
            d3.select(this).moveToFront();
            deselectSelection(ntwrk.SVG.edges);
            deselectSelection(ntwrk.SVG.nodeG);
            deselectSelection(barChart02.SVG.barGroups);
            selectSelection(d3.select(this));

            
            
            d.values.children.forEach(function(d1, i1) {
                selectSelection(barChart02.SVG.barGroups.filter(function(d2, i2) {
                    return d1.author == d2.key
                }))
            })
        }
    }
    ntwrk.nodeMouseout = function() {
        if (!ntwrk.isPopupShowing) {
            defaultSelection(ntwrk.SVG.nodeG);
            defaultSelection(ntwrk.SVG.edges);
            defaultSelection(barChart02.SVG.barGroups);
        }
    }

    ntwrk.SVG.edges.on("mouseover", ntwrk.edgeMouseover)
    ntwrk.SVG.edges.on("mouseout", ntwrk.edgeMouseout)
    ntwrk.SVG.nodeG.on("mouseover", ntwrk.nodeMouseover)
    ntwrk.SVG.nodeG.on("mouseout", ntwrk.nodeMouseout)
    ntwrk.SVG.nodeG.selectAll("circle").on("click", ntwrk.nodeClickEvent)
    ntwrk.SVG.nodeG.selectAll("rect").on("click", ntwrk.nodeClickEvent)


    function configureDOMElements() {
        $('.drawer').drawer();

        nodeSize.setTitle("#Papers")
        nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
        nodeSize.updateNodeSize(configs.prosym01.nodes.styleEncoding.size.range);
        nodeSize.updateTextFromFunc(function(d) {
            return ntwrk.categoryScales[ntwrk.currCategory].size.invert(d / 2) / ntwrk.zoom.scale();
        });

        edgeSize.setTitle("#Co-authored Papers")
        edgeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
        edgeSize.updateEdgeSize(configs.prosym01.edges.styleEncoding.size.range);
        edgeSize.updateTextFromFunc(function(d) {
            return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
        });

        // nodeColor.setTitle("Year of First Publication")
        // nodeColor.updateStopColors(configs.prosym01.nodes.styleEncoding.color.range)
        // nodeColor.updateText([d3.min(ntwrk.Scales.nodeColorScale.domain()), d3.mean(ntwrk.Scales.nodeColorScale.domain()), d3.max(ntwrk.Scales.nodeColorScale.domain())])

        ntwrk.SVG.on("mousewheel", function() {
            setTimeout(function() {
                nodeSize.updateTextFromFunc(function(d) {
                    return ntwrk.categoryScales[ntwrk.currCategory].size.invert(d / 2) / ntwrk.zoom.scale();
                });
                edgeSize.updateTextFromFunc(function(d) {
                    return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
                });
                nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
                edgeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
            }, 10);
        });
    }
    ntwrk.SVG.background.on("click", function() {
        $(".popup").css({ display: "none" })
        ntwrk.isPopupShowing = false;
    })
}

var statesData = {
    "records": {
        "schema": [{
            "name": "name",
            "type": "string"
        }, {
            "name": "lat",
            "type": "numeric"
        }, {
            "name": "lng",
            "type": "numeric"
        }],
        "data": [{
            "name": "Alabama",
            "lat": 32.614471,
            "lng": -86.68074
        }, {
            "name": "Alaska",
            "lat": 62.890301,
            "lng": -149.054077
        }, {
            "name": "Arizona",
            "lat": 34.168091,
            "lng": -111.930344
        }, {
            "name": "Arkansas",
            "lat": 34.751888,
            "lng": -92.131348
        }, {
            "name": "California",
            "lat": 37.271832,
            "lng": -119.270203
        }, {
            "name": "Colorado",
            "lat": 38.997841,
            "lng": -105.550911
        }, {
            "name": "Connecticut",
            "lat": 41.515572,
            "lng": -72.757477
        }, {
            "name": "Delaware",
            "lat": 39.145199,
            "lng": -75.41861
        }, {
            "name": "Florida",
            "lat": 27.975639,
            "lng": -81.541183
        }, {
            "name": "Georgia",
            "lat": 32.678131,
            "lng": -83.222931
        }, {
            "name": "Hawaii",
            "lat": 19.58964,
            "lng": -155.434036
        }, {
            "name": "Idaho",
            "lat": 45.494419,
            "lng": -114.143219
        }, {
            "name": "Illinois",
            "lat": 39.739281,
            "lng": -89.504128
        }, {
            "name": "Indiana",
            "lat": 39.766201,
            "lng": -86.441254
        }, {
            "name": "Iowa",
            "lat": 41.938221,
            "lng": -93.3899
        }, {
            "name": "Kansas",
            "lat": 38.498058,
            "lng": -98.320213
        }, {
            "name": "Kentucky",
            "lat": 37.822399,
            "lng": -85.691101
        }, {
            "name": "Louisiana",
            "lat": 30.97226,
            "lng": -91.521797
        }, {
            "name": "Maine",
            "lat": 45.262379,
            "lng": -69.008301
        }, {
            "name": "Maryland",
            "lat": 38.823399,
            "lng": -75.923759
        }, {
            "name": "Massachusetts",
            "lat": 42.163891,
            "lng": -71.717941
        }, {
            "name": "Michigan",
            "lat": 43.742691,
            "lng": -84.62162
        }, {
            "name": "Minnesota",
            "lat": 46.441929,
            "lng": -93.365471
        }, {
            "name": "Mississippi",
            "lat": 32.585159,
            "lng": -89.876381
        }, {
            "name": "Missouri",
            "lat": 38.304611,
            "lng": -92.436653
        }, {
            "name": "Montana",
            "lat": 46.67944,
            "lng": -110.044472
        }, {
            "name": "Nebraska",
            "lat": 41.500839,
            "lng": -99.680771
        }, {
            "name": "Nevada",
            "lat": 38.50246,
            "lng": -117.02272
        }, {
            "name": "New Hampshire",
            "lat": 44.001301,
            "lng": -71.632828
        }, {
            "name": "New Jersey",
            "lat": 40.14278,
            "lng": -74.726723
        }, {
            "name": "New Mexico",
            "lat": 34.166161,
            "lng": -106.026123
        }, {
            "name": "New York",
            "lat": 40.71455,
            "lng": -74.007124
        }, {
            "name": "North Carolina",
            "lat": 35.21941,
            "lng": -80.018333
        }, {
            "name": "North Dakota",
            "lat": 47.467731,
            "lng": -100.301712
        }, {
            "name": "Ohio",
            "lat": 40.190269,
            "lng": -82.669403
        }, {
            "name": "Oklahoma",
            "lat": 35.30896,
            "lng": -98.716942
        }, {
            "name": "Oregon",
            "lat": 44.114552,
            "lng": -120.514908
        }, {
            "name": "Pennsylvania",
            "lat": 40.99464,
            "lng": -77.604507
        }, {
            "name": "Rhode Island",
            "lat": 41.661171,
            "lng": -71.555771
        }, {
            "name": "South Carolina",
            "lat": 33.624981,
            "lng": -80.947441
        }, {
            "name": "South Dakota",
            "lat": 44.212391,
            "lng": -100.247101
        }, {
            "name": "Tennessee",
            "lat": 35.83062,
            "lng": -85.978554
        }, {
            "name": "Texas",
            "lat": 31.168989,
            "lng": -100.07679
        }, {
            "name": "Utah",
            "lat": 39.499611,
            "lng": -111.54705
        }, {
            "name": "Vermont",
            "lat": 43.871769,
            "lng": -72.451218
        }, {
            "name": "Virginia",
            "lat": 38.003349,
            "lng": -79.771446
        }, {
            "name": "Washington",
            "lat": 47.3917,
            "lng": -121.5708
        }, {
            "name": "West Virginia",
            "lat": 38.920101,
            "lng": -80.181808
        }, {
            "name": "Wisconsin",
            "lat": 44.727242,
            "lng": -90.101562
        }, {
            "name": "Wyoming",
            "lat": 43.00032,
            "lng": -107.554626
        }]
    },
    "topology": "table"
}

