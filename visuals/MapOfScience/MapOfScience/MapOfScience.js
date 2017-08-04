head.js({
    'underlyingScimapData': 'visuals/MapOfScience/MapOfScience/underlyingScimapData.js'
}, {
    'disc_lookup': 'visuals/MapOfScience/MapOfScience/disc_lookup.js'
});




// head.js('visuals/MapOfScience/MapOfScience/mingle/graph.js');
// head.js('visuals/MapOfScience/MapOfScience/mingle/mingle.js');
// head.js('visuals/MapOfScience/MapOfScience/mingle/kdtree.js');

visualizationFunctions.MapOfScience = function(element, data, opts) {
    var context = this;
    this.config = this.CreateBaseConfig();
    this.VisFunc = function() {
        this.SVG = this.config.easySVG(element[0], {
            zoomable: true,
            zoomLevels: [.5, 20],
            background: false
        })
        head.ready('disc_lookup', function() {
            context.SVG.background = context.SVG.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "white")
                .attr("opacity", .00000001)
            var defaultNodeSize = 1;
            underlyingScimapData.nodes.forEach(function(d, i) {
                d.disc_name = underlyingScimapData.disciplines.filter(function(d1, i1) {
                    return d.disc_id == d1.disc_id
                })[0].disc_name
            })
            context.nestedData = nestDiscChildData(nestDiscData(context.filteredData[context.PrimaryDataAttr].data));
            createScales();
            context.SVG.underlyingNodeG = createNodes(underlyingScimapData);
            context.SVG.underlyingNodes = context.SVG.underlyingNodeG.selectAll("circle");
            // results = bundleData(underlyingScimapData);
            context.SVG.underlyingEdges = createEdges(underlyingScimapData);
            context.SVG.underlyingLabels = createLabels(underlyingScimapData);
            // context.SVG.underlyingEdges = context.SVG.underlyingEdgeG.selectAll("path");

            function nestDiscData(data) {
                data.forEach(function(d, i) {
                    var disc = disc_lookup.records.data.filter(function(d1, i1) {
                        return d[context.config.meta.visualization.subd_id] == d1.subd_id
                    })
                    d.disc_id = disc[0].disc_id;
                    // console.log(d);
                })

                return {
                    disc: d3.nest()
                        .key(function(d) {
                            return parseInt(d.disc_id);
                        })
                        .rollup(function(leaves) {
                            var obj = {
                                children: leaves
                            };
                            context.filteredData[context.PrimaryDataAttr].schema.forEach(function(d) {
                                if (d.type == "numeric") {
                                    obj[d.name] = d3.sum(leaves, function(d1) {
                                        return d1[d.name];
                                    })
                                }
                            })
                            return obj;
                        })
                        .entries(data),
                    sub_disc: []
                }
            }

            function nestDiscChildData(data) {
                data.disc.forEach(function(d, i) {
                    d.values.nestedChildren = d3.nest()
                        .key(function(d1) {
                            return parseInt(d1[context.config.meta.visualization.subd_id]);
                        })
                        .rollup(function(leaves) {
                            var obj = {
                                children: leaves
                            };
                            context.filteredData[context.PrimaryDataAttr].schema.forEach(function(d1) {
                                if (d1.type == "numeric") {
                                    obj[d1.name] = d3.sum(leaves, function(d2) {
                                        return d2[d1.name];
                                    })
                                }
                            })
                            return obj;
                        }).entries(d.values.children);
                    data.sub_disc = data.sub_disc.concat(d.values.nestedChildren);
                });
                return data;
            }

            function createScales() {
                context.Scales.translateX = d3.scale.linear()
                    .domain(d3.extent(underlyingScimapData.nodes, function(d) {
                        return d.x
                    }))
                    .range([10, context.config.dims.fixedWidth - 10])
                context.Scales.translateY = d3.scale.linear()
                    .domain(d3.extent(underlyingScimapData.nodes, function(d) {
                        return d.y
                    }))
                    .range([context.config.dims.fixedHeight - 10, 10])
                context.Scales.sizeScale = d3.scale.linear()
                    .domain(d3.extent(context.nestedData.sub_disc, function(d) {
                        return d.values[context.config.meta[context.PrimaryDataAttr].styleEncoding.size.attr]
                    }))
                    .range(context.config.meta[context.PrimaryDataAttr].styleEncoding.size.range || [2, 16])
            }


            function createNodes(underlyingData) {
                var nodeG = context.SVG.selectAll(".underlyingNodes")
                    .data(underlyingData.nodes)

                nodeG.enter()
                    .append("g")
                    .attr("class", function(d, i) {
                        return "wvf-node-g subd_id" + d.subd_id + " disc_id" + d.disc_id;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(" + context.Scales.translateX(d.x) + "," + context.Scales.translateY(d.y) + ")"
                    })

                nodeG
                    .append("circle")
                    .attr("r", defaultNodeSize)
                    .attr("class", function(d, i) {
                        return "wvf-node subd_id" + d.subd_id + " disc_id" + d.disc_id;
                    })
                    .attr("fill", function(d, i) {
                        var disc = underlyingData.disciplines.filter(function(d1, i1) {
                            if (d.disc_id == d1.disc_id) {
                                return d1;
                            }
                        })
                        return disc[0].color;
                    })
                    .property("x", function(d, i) {
                        return context.Scales.translateX(d.x)
                    })
                    .property("y", function(d, i) {
                        return context.Scales.translateY(d.y)
                    })
                nodeG.append("text")
                    .attr("class", "subd subd_label")
                    .text(function(d, i) {
                        return d.subd_name
                    })
                    .attr("x", 0)
                    .attr("y", -defaultNodeSize)
                    .attr("text-anchor", "middle")
                return nodeG
            }

            function createLabels(underlyingData) {
                return context.SVG.selectAll(".underlyingLabels")
                    .data(underlyingData.labels)
                    .enter()
                    .append("text")
                    .attr("class", "wvf-label")
                    .attr("text-anchor", function(d, i) {
                        var x = context.Scales.translateX(d.x);
                        var m = d3.mean(context.Scales.translateX.range())
                        if (x > m) {
                            return "end";
                        } else if (x < m) {
                            return "start";
                        }
                        return "middle"
                    })
                    .attr("x", function(d, i) {
                        return context.Scales.translateX(d.x)
                    })
                    .attr("y", function(d, i) {
                        return context.Scales.translateY(d.y)
                    })
                    .style("fill", function(d, i) {
                        return d.color
                    })
                    .text(function(d, i) {
                        return d.disc_name;
                    })
                    .style("pointer-events", "none")
            }

            function createEdges(underlyingData) {
                var newEdges = [];

                // underlyingScimapData.edges.forEach(function(d, i) {
                //     var sourceNode = underlyingScimapData.nodes.filter(function(d1, i1) {
                //         return d1.subd_id == d.subd_id1;
                //     })[0];
                //     var targetNode = underlyingScimapData.nodes.filter(function(d1, i1) {
                //         return d1.subd_id == d.subd_id2;
                //     })[0];

                //     var sourceDisc = underlyingScimapData.labels.filter(function(d1, i1) {
                //         return d1.disc_id == sourceNode.disc_id;
                //     })[0];

                //     var targetDisc = underlyingScimapData.labels.filter(function(d1, i1) {
                //         return d1.disc_id == targetNode.disc_id;
                //     })[0];



                //     newEdges.push([
                //         context.Scales.translateX(sourceNode.x),
                //         context.Scales.translateY(sourceNode.y),
                //         context.Scales.translateX(sourceDisc.x),
                //         context.Scales.translateY(sourceDisc.y)
                //     ])

                //     newEdges.push([
                //         context.Scales.translateX(sourceDisc.x),
                //         context.Scales.translateY(sourceDisc.y),
                //         context.Scales.translateX(targetDisc.x),
                //         context.Scales.translateY(targetDisc.y)
                //     ])

                //     newEdges.push([
                //         context.Scales.translateX(targetDisc.x),
                //         context.Scales.translateY(targetDisc.y),
                //         context.Scales.translateX(targetNode.x),
                //         context.Scales.translateY(targetNode.y)
                //     ])

                // })

                // var edgeMap = [];
                // newEdges.forEach(function(d1, i1) {
                //     edgeMap.push({
                //         id: i1,
                //         name: i1,
                //         data: {
                //             coords: d1,
                //             weight: d1.Weight
                //         }
                //     })
                // })

                // var bundle = new Bundler();
                // bundle.setNodes(edgeMap);
                // bundle.buildNearestNeighborGraph();
                // bundle.MINGLE();

                // context.SVG.edges = context.SVG.append("g");
                // bundle.graph.each(function(node) {
                //     var edges = node.unbundleEdges(1);
                //     edges.forEach(function(d, i) {
                //         var lineArr = [];
                //         d.forEach(function(d1, i1) {
                //             lineArr.push({
                //                 x: d1.pos[0],
                //                 y: d1.pos[1]
                //             })
                //         })
                //         context.SVG.edges.append("path")
                //             // .attr("class", "wvf-edge")
                //             .attr("opacity", .2)
                //             .attr("stroke", "grey")
                //             .attr("stroke-width", .5)
                //             .attr("fill", "none")
                //             .attr("d", Utilities.lineFunction(lineArr))
                //             .on("click.remove", function(d, i) {
                //                 d3.select(this).remove();
                //             })
                //     })
                // })






                return context.SVG.selectAll("path")
                    .append("g")
                    .data(underlyingData.edges)
                    .enter()
                    .append("path")
                    .attr("class", function(d1, i1) {
                        return "wvf-edge s" + d1.subd_id1 + " t" + d1.subd_id2;
                    }).attr("d", function(d, i) {
                        var sourceNode = context.SVG.underlyingNodes.filter(".subd_id" + d.subd_id1)
                        var targetNode = context.SVG.underlyingNodes.filter(".subd_id" + d.subd_id2)
                        return Utilities.lineFunction([{
                            "x": sourceNode.property("x"),
                            "y": sourceNode.property("y")
                        }, {
                            "x": targetNode.property("x"),
                            "y": targetNode.property("y")
                        }])
                    })
                    .on("mouseover", function(d, i) {
                        context.SVG.underlyingLabels.classDeselect();
                        context.SVG.underlyingEdges.classDeselect();
                        d3.select(this).classSelect();
                        context.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id1).classSelect().selectAll("text").classSelect();
                        context.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id2).classSelect().selectAll("text").classSelect();

                    }).on("mouseout", function(d, i) {
                        context.SVG.selectAll("*").classDefault();
                        context.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id1).classSelect().selectAll("text").classDeselect();
                        context.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id2).classSelect().selectAll("text").classDeselect();
                    })
            }

    
            context.SVG.applyNodeEvents = function(sel) {
                sel.on("mouseover", function(d, i) {
                        context.SVG.underlyingNodes.classDeselect();
                        // context.SVG.underlyingEdges.classDeselect();
                        context.SVG.underlyingLabels.classDeselect();
                        d3.select(this).classSelect();
                        context.SVG.underlyingEdges.filter(".s" + d.subd_id).mergeSelections(context.SVG.underlyingEdges.filter(".t" + d.subd_id)).each(function(d, i) {
                            context.SVG.underlyingNodeG.filter(".subd_id" + d.subd_id1 + ", .subd_id" + d.subd_id2).selectAll("*").classSelect();
                            // d3.select(this).classSelect();
                        })
                    })
                    .on("mouseout", function(d, i) {
                        context.SVG.selectAll("*").classDefault();
                    })
                    
            }
            context.SVG.applyNodeEvents(context.SVG.underlyingNodeG)
            

            context.SVG.update = function(newData) {
                if (newData) {
                    context.nestedData = nestDiscChildData(nestDiscData(newData));
                    createScales();
                }

                context.SVG.underlyingNodes
                    .attr("r", defaultNodeSize)

                

                context.SVG.recalculateMaxGlobalDomain(function(d) {
                    return d[context.config.meta[context.PrimaryDataAttr].styleEncoding.size.attr]
                })
                context.SVG.updateNodeR(function(d) {
                    return d[context.config.meta[context.PrimaryDataAttr].styleEncoding.size.attr]
                })
            }

            
            context.SVG.recalculateMaxGlobalDomain = function(func) {
                rVals = [];
                context.nestedData.sub_disc.forEach(function(d, i) {
                    var rVal = 0;
                    d.values.children.forEach(function(d1, i1) {
                        rVal += func(d1) || 0;
                    })
                    rVals.push(rVal);
                })
                context.SVG.maxGlobalDomain = d3.extent(rVals);
            }
            context.SVG.recalculateMaxGlobalDomain(function(d) {
                return d[context.config.meta[context.PrimaryDataAttr].styleEncoding.size.attr];
            })

            context.SVG.updateNodeR = function(func) {
                context.nestedData.sub_disc.forEach(function(d, i) {
                    var rVal = 0;
                    d.values.children.forEach(function(d1, i1) {
                        rVal += func(d1) || 0;
                    })
                    d.rScaleVal = rVal;
                });

                if (context.SVG.maxGlobalDomain[0] == context.SVG.maxGlobalDomain[1]) {
                    if (context.SVG.maxGlobalDomain[0] >= 0) {
                        context.SVG.maxGlobalDomain[0] = 0
                    } else {
                        context.SVG.maxGlobalDomain[1] = 0
                    }
                }
                var scale = Utilities.makeDynamicScaleNew(context.SVG.maxGlobalDomain, context.config.meta[context.PrimaryDataAttr].styleEncoding.size.range || [2, 24], "linear");
                context.nestedData.sub_disc.forEach(function(d, i) {
                    var currNode = context.SVG.underlyingNodeG.filter(".subd_id" + d.key)

                    try {
                        currNode.selectAll("circle").attr("r", scale(d.rScaleVal))
                        currNode.selectAll("text").attr("y", -scale(d.rScaleVal))
                    } catch (e) {
                        currNode.selectAll("circle").attr("r", defaultNodeSize)
                    }
                })
            }

            context.SVG.underlyingNodeG.moveToFront();
            context.SVG.underlyingLabels.moveToFront();

            context.SVG.update();
        })
    }
    return context;
}




d3.selection.prototype.classSelect = function() {
    return this.each(function() {
        d3.select(this).classed("deselected", false).classed("selected", true);
    });
}

d3.selection.prototype.classDeselect = function() {
    return this.each(function() {
        d3.select(this).classed("selected", false).classed("deselected", true);
    });
}

d3.selection.prototype.classDefault = function() {
    return this.each(function() {
        d3.select(this).classed("selected", false).classed("deselected", false);
    });
}
