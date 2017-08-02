visualizationFunctions.ForceNetwork = function(element, data, opts) {
    var context = this;
    //TODO: Not all events are unbound properly. Resetting the visualization just doesn't work. Do data filters instead if you need :)
    this.VisFunc = function() {
        context.SVG = context.config.easySVG(element[0], {
                zoomable: true,
                zoomLevels: [.5, 20],
                background: false
            }).attr("transform", "translate(" + (context.config.margins.left + context.config.dims.width / 2) + "," + (context.config.margins.top + context.config.dims.height / 2) + ")")


        context.Scales.nodeSizeScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.nodes.data, function(d, i) {
            return d[context.config.meta.nodes.styleEncoding.size.attr]
        }), context.config.meta.nodes.styleEncoding.size.range)

        context.Scales.nodeTextScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.nodes.data, function(d, i) {
            return d[context.config.meta.labels.styleEncoding.size.attr]
        }), context.config.meta.labels.styleEncoding.size.range)

        context.Scales.nodeColorScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.nodes.data, function(d, i) {
            return d[context.config.meta.nodes.styleEncoding.color.attr]
        }), context.config.meta.nodes.styleEncoding.color.range)

        context.Scales.edgeSizeScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.edges.data, function(d, i) {
            return d[context.config.meta.edges.styleEncoding.strokeWidth.attr]
        }), context.config.meta.edges.styleEncoding.strokeWidth.range)

        context.Scales.edgeColorScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.edges.data, function(d, i) {
            return d[context.config.meta.edges.styleEncoding.color.attr]
        }), context.config.meta.edges.styleEncoding.color.range)
        context.Scales.edgeOpacityScale = Utilities.makeDynamicScaleNew(d3.extent(context.filteredData.edges.data, function(d, i) {
            return d[context.config.meta.edges.styleEncoding.opacity.attr]
        }), context.config.meta.edges.styleEncoding.opacity.range)



        var k = Math.sqrt(context.filteredData.nodes.data.length / (context.config.dims.width * context.config.dims.height));

        context.SVG.background = context.SVG.append("rect")
            .attr("opacity", .000001)
            // .attr("fill", "red")
            .attr("width", "400%")
            .attr("height", "400%")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(" + -(context.config.margins.left + context.config.dims.width) + "," + -(context.config.margins.top + context.config.dims.height) + ")")
        context.SVG.force = null;
        context.SVG.force = d3.layout.force()
            .nodes(context.filteredData.nodes.data)
            .links(context.filteredData.edges.data)
            .linkDistance(context.config.meta.visualization.forceLayout.linkDistance || 20)
            .charge(0)
            .on("tick", tick)

        context.SVG.nodeG = context.SVG.selectAll(".node"),
            context.SVG.edges = context.SVG.selectAll(".link")



        function tick() {
            if (!context.SVG.force.lock) {
                context.SVG.nodeG.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")"
                })
                context.SVG.edges.attr("d", function(d, i) {
                    return Utilities.lineFunction([{
                        "x": d.source.x,
                        "y": d.source.y
                    }, {
                        "x": d.target.x,
                        "y": d.target.y
                    }])
                });
            }
        }

        context.SVG.force.restart = function() {
            context.SVG.nodeG = context.SVG.nodeG.data(context.SVG.force.nodes());
            context.SVG.edges = context.SVG.edges.data(context.SVG.force.links());

            var nodeRef = context.SVG.nodeG.enter().insert("g", ".nodeG")
                .attr("class", function(d, i) {
                    return "node g g" + d[context.config.meta.nodes.identifier.attr];
                })
            nodeRef.call(context.SVG.force.drag()
                .on("dragstart", function() {
                    d3.event.sourceEvent.stopPropagation();
                })
            )
            nodeRef.append("circle")
                .attr("class", function(d, i) {
                    return d[context.config.meta.labels.identifier.attr] + " wvf-node wvf-node" + d[context.config.meta.nodes.identifier.attr];
                })
                .attr("r", function(d, i) {
                    return context.Scales.nodeSizeScale(d[context.config.meta.nodes.styleEncoding.size.attr])
                })
                .style("fill", function(d, i) {
                    return context.Scales.nodeColorScale(d[context.config.meta.nodes.styleEncoding.color.attr])
                })

            nodeRef.append("text")
            
                .attr("class", "wvf-label")
                .style("pointer-events", "none")
                .text(function(d, i) {
                    return d[context.config.meta.labels.identifier.attr]
                })
                .attr("x", 10)
                .attr("y", 5)
                .attr("display", "none")
                .style("font-size", function(d, i) {
                    return context.Scales.nodeTextScale(d[context.config.meta.labels.styleEncoding.size.attr])
                })


            context.SVG.nodeG.exit().each(function(d, i) {
                context.filteredData.edges.data.forEach(function(d1, i1) {
                    if ((d1.source.id == d.id) || (d1.target.id == d.id)) {
                        delete context.filteredData.edges.data[i1];
                    }
                })
            }).remove();

            context.SVG.edges.enter().insert("path", ".link")
                .attr("class", function(d, i) {
                    return "" + " link wvf-edge s s" + d.source + " t t" + d.target;
                })
                .style("stroke-width", function(d, i) {
                    return context.Scales.edgeSizeScale(d[context.config.meta.edges.styleEncoding.strokeWidth.attr])
                })
                // .attr("stroke", function(d, i) {
                //     return context.Scales.edgeColorScale(d[context.config.meta.edges.styleEncoding.color.attr])
                // })
                .attr("opacity", function(d, i) {
                    return context.Scales.edgeOpacityScale(d[context.config.meta.edges.styleEncoding.opacity.attr])
                })

            context.SVG.edges.exit().remove();
            context.SVG.nodeG.moveToFront();
        }


        context.SVG.nodeG.on("mouseover.labels", function(d, i) {
            d3.select(this).selectAll("text").attr("display", "block");
        })
        context.SVG.nodeG.on("mouseout.labels", function(d, i) {
            d3.select(this).selectAll("text").attr("display", "none");
        })
        context.SVG.nodeG.on("mouseup.pinNodes", function(d, i) {
            if (d3.event.shiftKey) {
                d.fixed = true;
            } else {
                d.fixed = false;
            }
        })
        context.SVG.nodeG.on("click.showEdges", function(d, i) {
            context.SVG.edges
                .classed("selected", false)
                .classed("deselected", true)

            context.SVG.edges.filter(function(d1, i1) {
                return d.id == d1.source.id || d.id == d1.target.id
            }).classed("selected", true).classed("deselected", false)
        })



        //TODO: Fix this. Is it an issue with the canvas dimensions?
        function forceBoundsCollisionCheck(val, lim, off) {
            var offset = 0;
            if (off) {
                offset = off;
            }
            if (val <= -lim / 2 - offset) return -lim / 2 - offset;
            if (val >= lim / 2 - offset) return lim / 2 - offset;
            return val;
        };
        context.SVG.force.start();

        context.easeForceInterval = null;
        var intervalIteration = 0;
        var maxIntervalIteration = 6;
        context.easeForceInterval = setInterval(function() {
            if (intervalIteration >= maxIntervalIteration) {
                clearInterval(context.easeForceInterval)
            } else {
                context.SVG.force.stop()
                context.SVG.force
                    .charge((context.config.meta.visualization.forceLayout.charge || -20 / k) / maxIntervalIteration * intervalIteration)
                    .gravity((context.config.meta.visualization.forceLayout.gravity || 100 * k) / maxIntervalIteration * intervalIteration)
                context.SVG.force.start()
                intervalIteration += 1;
            }
        }, 250);

        // context.SVG.force.stop()
        // context.SVG.force
        //     .charge((context.config.meta.visualization.forceLayout.charge || -10 / k) / maxIntervalIteration * intervalIteration)
        //     .gravity((context.config.meta.visualization.forceLayout.gravity || 100 * k) / maxIntervalIteration * intervalIteration)
        // context.SVG.force.start()

        context.SVG.force.restart();

    }

    this.configSchema = {
        nodes: {
            styleEncoding: {
                size: {
                    attr: "id",
                    range: [1, 1],
                    scale: "linear"
                },
                color: {
                    attr: "id",
                    range: ["black", "black"]
                }
            },
            identifier: {
                attr: "id"
            },
            prettyMap: {}
        },
        edges: {
            styleEncoding: {
                strokeWidth: {
                    attr: "id",
                    range: [1, 1]
                },
                opacity: {
                    attr: "id",
                    range: [1, 1]
                },
                color: {
                    attr: "id",
                    range: ["black", "black"]
                }
            },
            identifier: {
                attr: "id"
            },
            prettyMap: {}
        },
        labels: {
            identifier: {
                attr: "id"
            }
        },
        visualization: {
            forceLayout: {}
        }
    }
    this.config = this.CreateBaseConfig();


    return context;
}
