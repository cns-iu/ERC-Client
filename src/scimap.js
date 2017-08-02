var config;
$(document).ready(function() {
	config = setConfig();
	setTimeout(function() {
		config.updateLegendItems();
	}, 1000);
	$(window).resize(function() {
		config.resizeVis();
	});
});

function initMap(data) {
	head.load('src/data/underlyingScimapData.js', function() {
		container = new leafletMap('map-main', {
			minZoom: 0,
			maxZoom: 8,
			zoom: 2,
			center: [50, 50],
			worldCopyJump: false,
			unloadInvisibleTiles: false,
			bounceAtZoomLimits: false,
			zoomControl: true
		});
		var config = setConfig();
		underlyingData.nodes.forEach(function(d, i) {
			d.ids = [];
			d.size = 0;
		});
		data.records.data.forEach(function(d, i) {
			underlyingData.nodes.filter(function(node) {
				if (node.subd_id == d[meta.categorization[1]]) {
					node[meta.summary[meta.categorization[1]].content[0].field] = container.aggregates[meta.summary[meta.categorization[1]].content[0].operator](node[meta.summary[meta.categorization[1]].content[0].field] || 0,d[meta.summary[meta.categorization[1]].content[0].field]);
					node.size = d[meta.sizeCoding[0]];
					node.ids.push(d);
				}
			});
		});
		initSVG = container.initSVG();
		var svg = initSVG.svg();
		var white = initSVG.white();
		selectors = {
			"node": svg.selectAll("nodes")
				.data(underlyingData.nodes),
			"edge": svg.selectAll("edges")
				.data(underlyingData.edges),
			"title": svg.selectAll("titles")
				.data(underlyingData.labels)
		};
		svgNode = initNode(selectors.node);
		svgEdge = initEdge(selectors.edge);
		svgTitle = initTitle(selectors.title);
		update(selectors);
	});
}

function toggleLabels() {
	if (svgTitle) {
		svgTitle.remove();
		svgTitle = null;
	} else {
		svgTitle = initTitle();
	}
}

function initNode(selector) {
	return selector
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("id", function(d, i) {
			return "nodeid" + d.subd_id;
		})
		.attr("disc", function(d, i) {
			return "disc" + d[meta.categorization[0]];
		})
		.attr("r", function(d, i) {
			return 3;
		})
		.attr("fill", function(d) {
			return underlyingData.disciplines[parseInt(d.disc_id)].color;
		})
		.attr("ids", function(d, i) {
			return [];
		})
		.on("click", function(d, i) {
			d3.selectAll(".inactive").classed("inactive", false);
			if (d.ids.length > 0) {
				var thisDisc = underlyingData.disciplines[parseInt(d[meta.categorization[0]])];
				for (var key in thisDisc) {
					if (!d[key]) d[key] = thisDisc[key];
				}
				var node = d3.select(this);
				var popupAnchor = [Number(node.attr("cx")), Number(node.attr("cy")) - Number(node.attr("r"))];
				container.map.panTo(container.map.layerPointToLatLng(popupAnchor));
				container.initPopup(node, d, popupAnchor);
			}
		});
}

function initEdge(selector) {
	return selector
		.enter()
		.append("path")
		.attr("class", "edge")
		.attr("source", function(d, i) {
			return "edgeid" + d.subd_id1;
		})
		.attr("target", function(d, i) {
			return "edgeid" + d.subd_id2;
		});
}

function initTitle(selector) {
	return selector
		.enter()
		.append("text")
		.attr("class", "title")
		.attr("disc", function(d) {
			return "disc" + d[meta.categorization[0]];
		})
		.attr("text-anchor", "middle")
		.text(function(d, i) {
			return d.disc_name;
		}).on("click", function(d, i) {
			d3.selectAll("circle.node").classed("inactive", true);
			d3.selectAll("text.title").classed("inactive", true);
			d3.selectAll("[disc='disc" + d[meta.categorization[0]] + "']").classed("inactive", false);
		});
}

function update() {
	nodeScale = initSVG.nodeScale(underlyingData.nodes, "size", config.nodeScale.range);
	selectors.node
		.attr("cx", function(d, i) {
			return container.map.latLngToLayerPoint([d[meta.latLng.lng], d[meta.latLng.lat]]).x * 1.25;
		})
		.attr("cy", function(d, i) {
			return container.map.latLngToLayerPoint([d[meta.latLng.lng], d[meta.latLng.lat]]).y * 1 / 10 * 7;
		})
		.attr("r", function(d) {
			var adjustedSize = nodeScale(d.size);
			if (d.ids.length === 0) {
				adjustedSize = 2;
			}
			return adjustedSize;
		});
	selectors.edge
		.attr("d", function(d) {
			var sourceNode = d3.select("#nodeid" + d.subd_id1);
			var targetNode = d3.select("#nodeid" + d.subd_id2);
			return container.linePath([{
				"x": sourceNode.attr("cx"),
				"y": sourceNode.attr("cy")
			}, {
				"x": targetNode.attr("cx"),
				"y": targetNode.attr("cy")
			}]);
		});
	selectors.title
		.attr("transform", function(d, i) {
			var coords = container.map.latLngToLayerPoint([d.lat, d.lng]);
			return "translate(" + (coords.x * 1.25) + ", " + (coords.y * 0.7) + ")";
		});
	selectors.node.moveToFront();
	d3.selectAll("text").moveToFront();
	legendItems.sizedBy.setAll()

}

function setConfig() {
	return {
		"controls": {
			"up": function() {
				container.map.panBy([0, -50]);
			},
			"down": function() {
				container.map.panBy([0, 50]);
			},
			"left": function() {
				container.map.panBy([-50, 0]);
			},
			"right": function() {
				container.map.panBy([50, 0]);
			}
		},
		"resizeVis": function() {

		},
		"updateLegendItems": function() {
			legendItems.sizedBy.setAll()
		},
		"nodeScale": {
			"domain": "",
			"range": [7, 40]
		}
	}
}
