visualizationFunctions.MapOfScience = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	// network.leaflet = network.config.easyLeafletMap(element[0], {
	// 	worldCopyJump: true,
	// 	minZoom: 2,
	// 	maxZoom: 8,
	// 	center: [39, -98],
	// 	zoom: 3,
	// 	closePopupOnClick: true
	// }, "").addInteractionLayer()
	// network.leaflet.map._initPathRoot();
	// network.SVG = d3.select(element[0]).select("svg")



	var zoom = d3.behavior.zoom()
		.scaleExtent([1, 10])
		.on("zoom", zoomed);

	var drag = d3.behavior.drag()
		.origin(function(d) {
			return d;
		})
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended);

	function zoomed() {
		network.SVG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

	function dragstarted(d) {
		d3.event.sourceEvent.stopPropagation();
		d3.select(this).classed("dragging", true);
	}

	function dragged(d) {
		d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
	}

	function dragended(d) {
		d3.select(this).classed("dragging", false);
	}

	network.SVG = d3.select(element[0])
		.append("svg")
		.attr("width", network.config.dims.width)
		.attr("height", network.config.dims.height)
		.call(zoom)
		.append("g")
		.attr("background", "#969696")
		.attr("class", "canvas " + opts.ngIdentifier)


	network.VisFunc = function() {
		network.SVG.background = network.SVG.append("rect")
			.attr("width", network.config.dims.fixedWidth)
			.attr("height", network.config.dims.fixedHeight)
			.attr("x", 0)
			.attr("y", 0)
			.attr("fill", "white")
			.attr("opacity", "1e-24")

		var useData = network.GetData()[network.PrimaryDataAttr].data;
		if (!opts.ngDataField) {
			useData = network.parentVis.GetData()[network.parentVis.PrimaryDataAttr].data;
			network.Scales = network.parentVis.Scales;
			if (!network.config.meta) {
				network.config.meta = network.parentVis.config.meta;
			}
		}
		network.nestedData = {
			disc: d3.nest()
				.key(function(d) {
					return parseInt(d[network.config.meta.visualization.disc]);
				})
				.rollup(function(leaves) {
					var obj = {
						children: leaves
					};
					network.GetData()[network.PrimaryDataAttr].schema.forEach(function(d) {
						if (d.type == "numeric") {
							obj[d.name] = d3.sum(leaves, function(d1) {
								return d1[d.name];
							})
						}
					})
					return obj;
				})
				.entries(useData),
			sub_disc: []
		}
		network.nestedData.disc.forEach(function(d, i) {
			d.values.nestedChildren = d3.nest()
				.key(function(d1) {
					return parseInt(d1[network.config.meta.visualization.sub_disc]);
				})
				.rollup(function(leaves) {
					var obj = {
						children: leaves
					};
					network.GetData()[network.PrimaryDataAttr].schema.forEach(function(d1) {
						if (d1.type == "numeric") {
							obj[d1.name] = d3.sum(leaves, function(d2) {
								return d2[d1.name];
							})
						}
					})
					return obj;
				}).entries(d.values.children);
			network.nestedData.sub_disc = network.nestedData.sub_disc.concat(d.values.nestedChildren);
		});
		$(element[0]).css({
			background: "#969696"
		})

		network.Scales.translateX = d3.scale.linear()
			.domain(d3.extent(underlyingScimapData.nodes, function(d) {
				return d.x
			}))
			.range([10, network.config.dims.fixedWidth - 10])
		network.Scales.translateY = d3.scale.linear()
			.domain(d3.extent(underlyingScimapData.nodes, function(d) {
				return d.y
			}))
			.range([network.config.dims.fixedHeight - 10, 10])
		network.Scales.sizeScale = d3.scale.linear()
			.domain(d3.extent(network.nestedData.sub_disc, function(d) {
				return d.values[network.config.meta[network.PrimaryDataAttr].styleEncoding.size.attr]
			}))
			.range([5, 16])



		network.SVG.underlyingNodes = network.SVG.selectAll(".underlyingNodes")
			.data(underlyingScimapData.nodes)
			.enter()
			.append("circle")
			.attr("class", function(d, i) {
				return "n subd_id" + d.subd_id + " disc_id" + d.disc_id;
			})
			.attr("cx", function(d, i) {
				return network.Scales.translateX(d.x);
			})
			.attr("cy", function(d, i) {
				return network.Scales.translateY(d.y);
			})
			.attr("r", 2)
			.attr("fill", function(d, i) {
				var disc = underlyingScimapData.disciplines.filter(function(d1, i1) {
					if (d.disc_id == d1.disc_id) {
						return d1;
					}
				})
				return disc[0].color;
			})

		network.SVG.underlyingLabels = network.SVG.selectAll(".underlyingLabels")
			.data(underlyingScimapData.labels)
			.enter()
			.append("text")
			.attr("class", "l")
			.attr("text-anchor", function(d, i) {
				var x = network.Scales.translateX(d.x);
				var m = d3.mean(network.Scales.translateX.range())
				if (x > m) {
					return "end";
				} else if (x < m) {
					return "start";
				}
				return "middle"
			})
			.text(function(d, i) {
				return d.disc_name;
			})

		var underlyingScimapDataNodesObj = {};
		underlyingScimapData.nodes.map(function(d, i) {
			// d.x = network.Scales.translateX(d.x);
			// d.y = network.Scales.translateX(d.y);
			underlyingScimapDataNodesObj[d.subd_id] = {
				x: d.x,
				y: d.y
			}
		})
		underlyingScimapData.edges.map(function(d, i) {
			d.source = "" + d.subd_id1 + ""
			d.target = "" + d.subd_id2 + ""
		})
		var fbundling = d3.ForceEdgeBundling()
			// .bundling_stiffness([new bundling stiffness: float value])
			// .iterations([new number of iterations to execute each cycle: int value])
			// .iterations_rate([new decrease rate for iteration number in each cycle: float value])
			// .cycles([new number of cycles to execute: int value])
			// .subdivision_points_seed([new number subdivision points in first cycle: int value])
			// .subdivision_rate([new rate of subdivision each cycle: float value])
			.subdivision_points_seed(2)
			.subdivision_rate(.4)			
			// .iterations(0)
			.iterations(1)
			.iterations_rate(2)
			.bundling_stiffness(0)
			.cycles(6)
			.step_size(1)

		.nodes(underlyingScimapDataNodesObj).edges(underlyingScimapData.edges);
		var results = fbundling();
		// network.SVG.underlyingEdges = network.SVG.selectAll(".underlyingEdges")
		// 	.data(results)
		// 	.enter()
		// 	.append("path")
		// .attr("class", function(d, i) {
		// 	console.log(d);
		// 	var sourceNode = d3.select(network.SVG.underlyingNodes.filter(".subd_id" + d.subd_id1)).node().data()[0];
		// 	var targetNode = d3.select(network.SVG.underlyingNodes.filter(".subd_id" + d.subd_id2)).node().data()[0];
		// 	return "e subd_id1" + d.subd_id1 + " subd_id2" + d.subd_id2 + " disc_id_s" + sourceNode.disc_id + " disc_id_t" + targetNode.disc_id;
		// });

		network.nestedData.sub_disc.forEach(function(d, i) {
			network.SVG.underlyingNodes.filter(".subd_id" + d.key)
				.attr("r", network.Scales.sizeScale(d.values[network.config.meta[network.PrimaryDataAttr].styleEncoding.size.attr]))
		});
		var d3line = d3.svg.line()
			.x(function(d, i) {
				return network.Scales.translateX(d.x);
			})
			.y(function(d) {
				return network.Scales.translateY(d.y);
			})
			.interpolate("monotone");
		network.SVG.underlyingEdges = network.SVG.append("g")
		for (var i = 0; i < results.length; i++) {
			network.SVG.underlyingEdges
				.append("path")
				.attr("d", d3line(results[i]))
				.style("stroke-width", 1.5)
				.style("stroke", "#000")
				.style("fill", "none")
				.style('stroke-opacity', .2);
		}


		network.SVG.update = function() {
			var d3line = d3.svg.line()
				.x(function(d, i) {
					return network.Scales.translateX(d.x) //* network.leaflet.map.getZoom();
				})
				.y(function(d) {
					return network.Scales.translateY(d.y) //* network.leaflet.map.getZoom();
				})
			network.SVG.underlyingNodes
				.attr("cx", function(d, i) {
					return network.Scales.translateX(d.x) //* network.leaflet.map.getZoom();
				})
				.attr("cy", function(d, i) {
					return network.Scales.translateY(d.y) //* network.leaflet.map.getZoom();
				})
				// network.SVG.underlyingEdges
				// 	.attr("d", function(d, i) {
				// 		var sourceNode = d3.select(network.SVG.underlyingNodes.filter(".subd_id" + d.subd_id1).node());
				// 		var targetNode = d3.select(network.SVG.underlyingNodes.filter(".subd_id" + d.subd_id2).node());
				// 		return Utilities.lineFunction([{
				// 			"x": sourceNode.attr("cx"),
				// 			"y": sourceNode.attr("cy")
				// 		}, {
				// 			"x": targetNode.attr("cx"),
				// 			"y": targetNode.attr("cy")
				// 		}])
				// 	})
			for (var i = 0; i < results.length; i++) {
				network.SVG.underlyingEdges
					.attr("d", d3line(results[i]))
			}

			network.SVG.underlyingLabels
				.attr("x", function(d, i) {
					return network.Scales.translateX(d.x) //* network.leaflet.map.getZoom();
				})
				.attr("y", function(d, i) {
					return network.Scales.translateY(d.y) //* network.leaflet.map.getZoom();
				})
		}

		network.SVG.update();
		network.SVG.underlyingNodes.moveToFront();
		network.SVG.underlyingLabels.moveToFront();
		// network.leaflet.map.on("viewreset", network.SVG.update);
	}
	return network;
}