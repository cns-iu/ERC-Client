head.js('visuals/D3ProportionalSymbol/D3ProportionalSymbol/us.js');
head.js('visuals/D3ProportionalSymbol/D3ProportionalSymbol/topojson.js');
head.js('visuals/D3ProportionalSymbol/D3ProportionalSymbol/d3-ForceEdgeBundling.js')


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

        var shapeData = usShapeData;
        context.projection = d3.geo.equirectangular()
            .scale(context.config.dims.fixedWidth/4)
            .translate([context.config.dims.fixedWidth / 2+190, context.config.dims.fixedHeight / 2])

        context.SVG.pathG = context.SVG.g.selectAll("path")
            .data(topojson.feature(shapeData, shapeData.objects.countries).features)
            .enter()

        context.SVG.path = context.SVG.pathG
            .append("path")
            .classed("feature wvf-area", true)
            .attr("d", d3.geo.path()
                .projection(context.projection))

        // .on("click", clicked)

        context.update = function() {
            try { context.SVG.nodeG.selectAll("*").remove(); } catch (e) {};
            try { context.SVG.edges.selectAll("*").remove(); } catch (e) {};

            context.SVG.nodeG = context.SVG.g.selectAll(".nodeG")
                .data(context.filteredData[context.PrimaryDataAttr].data[context.currCategory])
                .enter()
                .append("g")
                .attr("class", function(d, i) {
                    var outStr = "";
                    d.values.children.forEach(function(d1, i1) {
                        outStr += "id-" + d1[context.config.meta.identifier] + " ";
                    })
                    return "node " + outStr;
                })
                .attr("transform", function(d, i) {
                    var arr = [d.values[context.config.meta.lng], d.values[context.config.meta.lat]]
                    d.projected = context.projection(arr)
                    if (d.projected == null) {
                        d3.select(context).remove()
                    } else {
                        d.x = d.projected[0];
                        d.y = d.projected[1];
                        return "translate(" + (d.projected[0]) + "," + (d.projected[1]) + ")"
                    }
                })

            context.SVG.nodes = context.SVG.nodeG
                .append("circle")
                .classed("wvf-node", true)
                .attr("r", function(d, i) {
                    return context.categoryScales[context.currCategory].size(d.sizeSum)
                })
                .attr("fill", "#0BBCCE")
            var toBundle = false;
            if (context.PrimaryDataAttr == "nodes") {
                if (context.config.meta.edges) {
                    if (context.config.meta.edges.bundle) {
                        toBundle = true;
                    }
                }
                if (toBundle) {
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
                                    //TODO: This needs to change to find the node id. 
                                    "source": s,
                                    "target": t,
                                    "d": [d]
                                })
                            }
                        }
                    });
                    var fbundling = d3.ForceEdgeBundling()
                        .step_size(10)
                        .compatibility_threshold(.05)
                        .bundling_stiffness(1)
                        .step_size(.1)
                        .cycles(8)
                        .iterations(90)
                        .iterations_rate(.0125)
                        .subdivision_points_seed(1)
                        .subdivision_rate(2)
                        .nodes(nodeData)
                        .edges(edgeData);

                    var results = fbundling();
                    context.SVG.edgeG = context.SVG.g.selectAll(".edge")
                        .data(results)
                        .enter()
                        .append("path")
                        .attr("class", "wvf-edge")
                        .attr("d", function(d, i) {

                            return Utilities.lineFunction(d);
                        })
                        .attr("opacity", .2)

                } else {
                    context.Scales.edgeSizeScale = d3.scale[context.config.meta.edges.styleEncoding.size.scaleType || "linear"]()
                        .domain(d3.extent(context.filteredData.edges.data, function(d1, i1) {
                            return d1[context.config.meta.edges.styleEncoding.size.attr];
                        }))
                        .range(context.config.meta.edges.styleEncoding.size.range)

                    context.SVG.edges = context.SVG.g.selectAll(".edge")
                        .data(context.filteredData.edges.data)
                        .enter()
                        .append("path")
                        .attr("class", "wvf-edge")
                        .attr("d", context.edgeFunc)
                        .attr("stroke-width", function(d, i) {
                            return context.Scales.edgeSizeScale(d[context.config.meta.edges.styleEncoding.size.attr])
                        })
                        .attr("opacity", .4)

                }
            }

            context.SVG.nodeG.moveToFront();
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











//Some scratch code for edge bundling. Mostly fixable...mostly. 


// configs.prosym01.bundle =     [
// {
//     bundleType: "state",
//     data: statesData.records.data,
//     attr: "name"
// },
// // {
// //     bundleType: "region",
// //     attr: "region"
// // }, 
// {
//     bundleType: "zip",
//     attr: "zip"
// }, 
// {
//     bundleType: "id",
//     attr: "id"
// }],




// var levels = configs.prosym01.bundle.map(function(d, i) {
//     return d.bundleType; })

// function createNodeHierarchy() {
//     var unbundledData = [];
//     configs.prosym01.bundle.forEach(function(d, i) {
//         //Map custom data if it exists
//         if (d.data) {
//             d.data.forEach(function(d1, i1) {
//                 d1[d.bundleType] = d1[d.attr]
//                 unbundledData.push({
//                     bundleVal: d1[d.bundleType],
//                     bundleType: d.bundleType,
//                     children: [],
//                     parent: "",
//                     level: i + 1,
//                     data: d1
//                 })
//             })
//         } else {

//             ntwrk.filteredData.nodes.data.forEach(function(d1, i1) {
//                 var obj = {
//                     bundleVal: d1[d.bundleType],
//                     bundleType: d.bundleType,
//                     children: [],
//                     parent: "",
//                     level: i + 1,
//                     data: d1
//                 };
//                 // if (unbundledData.indexOf(obj) == -1) {
//                     unbundledData.push(obj);
//                 // }
//             })
//             //Convert into bundlable object and add to unbundledData
//             // list.forEach(function(d1, i1) {
//             //     unbundledData.push({
//             //         bundleVal: d1,
//             //         bundleType: d.bundleType,
//             //         children: [],
//             //         parent: "",
//             //         level: i + 1
//             //     })
//             // })
//         }
//     });

//     console.log(unbundledData);
//     var bundledData = {
//         "": {
//             bundleVal: "",
//             bundleType: "",
//             children: [],
//             parent: null,
//             level: 0
//         }
//     };

//     configs.prosym01.bundle.reverse().forEach(function(d, i) {
//         if (i == 0) {
//             unbundledData.filter(function(d1, i1) {
//                 return d1.bundleType == d.bundleType;
//             }).forEach(function(d1, i1) {
//                 var bundledNode = {
//                     bundleVal: d1.bundleVal,
//                     bundleType: d.bundleType,
//                     children: [],
//                     parent: bundledData[""],
//                     data: ntwrk.filteredData.nodes.data.filter(function(d2, i2) {
//                         return d2[d.bundleType] == d1.bundleVal })[0]
//                 }
//                 bundledNode[configs.prosym01.bundle[1].bundleType] = bundledNode.data[configs.prosym01.bundle[1].bundleType]
//                 bundledData[d.bundleType + "-" + d1.bundleVal] = bundledNode;
//             })
//         }
//         if (i > 0) {
//             var foundChildren = unbundledData.filter(function(d1, i1) {
//                 return d.bundleType == d1.bundleType
//             })

//             foundChildren.forEach(function(d1, i1) {
//                 var bundledNode = {
//                     bundleVal: d1.bundleVal,
//                     bundleType: d.bundleType,
//                     parent: bundledData[""],
//                     data: d1.data
//                 }
//                 bundledData[d.bundleType + "-" + d1.bundleVal] = bundledNode;
//                 var childrensChildren = Object.keys(bundledData).filter(function(d2, i2) {
//                     var curr = bundledData[d2];
//                     return curr[d1.bundleType] == d1.bundleVal;
//                 })
//                 var fixedChildren = [];
//                 childrensChildren.forEach(function(d2, i2) {
//                     bundledData[d2].parent = bundledData[d.bundleType + "-" + d1.bundleVal];
//                     fixedChildren.push(bundledData[d2])
//                 })
//                 bundledData[d.bundleType + "-" + d1.bundleVal].children = fixedChildren;

//                 if (configs.prosym01.bundle.length - 1 == i) {
//                     bundledData[""].children.push(bundledNode);
//                 } else {
//                         bundledData[d.bundleType + "-" + d1.bundleVal][configs.prosym01.bundle[i + 1].bundleType] = bundledData[d.bundleType + "-" + d1.bundleVal].data[configs.prosym01.bundle[i + 1].bundleType]
//                 }


//             })
//         }
//         console.log(bundledData);
//     })


//     Object.keys(bundledData).filter(function(d, i) {
//         //Remember the bundle object is reversed
//         return bundledData[d].bundleType == configs.prosym01.bundle[0].bundleType;
//     }).forEach(function(d, i) {
//         bundledData[d].lat = bundledData[d].data.lat;
//         bundledData[d].lng = bundledData[d].data.lng;
//     })
//     Object.keys(bundledData).filter(function(d, i) {
//         return bundledData[d].children.length > 0
//     }).forEach(function(d, i) {
//         if (bundledData[d].bundleVal == "") {

//         } else {
//             bundledData[d].lat = d3.mean(bundledData[d].children, function(d1, i1) {
//                 return d1.lat });
//             bundledData[d].lng = d3.mean(bundledData[d].children, function(d1, i1) {
//                 return d1.lng });
//         }
//     })

//     bundledData[""].lat = d3.mean(bundledData[""].children.filter(function(d, i) {
//         return d.lat != null;
//     }), function(d, i) {
//         return d.lat
//     })
//     bundledData[""].lng = d3.mean(bundledData[""].children.filter(function(d, i) {
//         return d.lng != null;
//     }), function(d, i) {
//         return d.lng
//     })
//     // bundledData[""].lat = 38.75;
//     // bundledData[""].lng = -98.5;

//     return bundledData;

// }


// function createEdgeHierarchy(bundledNodes) {
//     ntwrk.filteredData.edges.data.forEach(function(d, i) {
//         d.source = bundledNodes["id-" + d.source]
//         d.target = bundledNodes["id-" + d.target]
//     })
//     return ntwrk.filteredData.edges.data;
// }



// var bundle = d3.layout.bundle();
// ntwrk.bundledNodes = createNodeHierarchy();
// ntwrk.bundledEdges = bundle(createEdgeHierarchy(ntwrk.bundledNodes))
// 
// 
//     ntwrk.SVG.selectAll(".link")
// .data(ntwrk.bundledEdges)
// .enter()
// .append("path")
// .attr("class", "link")
// .attr("d", function(d, i) {
//     var edgeData = [];
//     console.log(d);
//     d.forEach(function(d1, i1) {
//         var proj = ntwrk.projection([d1.lng, d1.lat])
//         edgeData.push({
//             "x": proj[0],
//             "y": proj[1]
//         })
//     })

//     return Utilities.lineFunction(edgeData);
// }).attr("fill", "none")
// .attr("stroke", "#0DFF6A")
// .classed("edge", true)
// .attr("opacity", .125)
