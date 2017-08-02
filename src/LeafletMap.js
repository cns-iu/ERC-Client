head.js(
	"lib/leaflet.js",
	"lib/mapbox.js",
	//"styles/leaflet.css",
	"styles/mapbox.css");



function populateSummary(data) {
	var outStr;
	if (meta.categorization && meta.categorization.length > 0) {
		var label;
		outStr = "";
		outStr += "<div class='popup-scrollablearea'><table class='popup-nodesummary'>";
		label = (data.clusterId > 0) ? data[meta.summary[meta.categorization[data.clusterId]].label] : data[meta.summary.label];
		outStr += "<tr id='popup-title' style='font-size:20px'><th>" + label + "</th>";

		meta.summary.content.forEach(function(contentItem, i) {
			if (i > 0) {
				outStr += "<th style='text-align:right'>";
				outStr += contentItem.title;
				outStr += "</th>";
			}
		});

		outStr += "<tr id='popup-title'>";
		meta.summary.content.forEach(function(summaryItem, i) {
			if (i > 0) {
				outStr += "<th style='text-align:right'>";
			} else {
				outStr += "<th>";
			}
			outStr += container.formatValue[summaryItem.format](data[summaryItem.field]);
			outStr += "</th>";
		});
		outStr += "</tr>";
		var summary;
		for (var summaryid = 1; summaryid < meta.categorization.length; summaryid++) {
			summary = meta.summary[meta.categorization[summaryid]];
		}

		data.ids.forEach(function(subdata) {
			outStr += "<tr><td>";
			outStr += subdata[summary.label];
			outStr += "</td>";
			summary.content.forEach(function(contentItem) {
				var formatFunction = container.formatValue[contentItem.format];
				outStr += "<td style='text-align:right'>";
				outStr += formatFunction(subdata[contentItem.field]);
				outStr += "</td>";
			});
			outStr += "</tr>";
		});
		outStr += "</table></div>";
	} else {
		var summaryDef = meta.summary;
		if (data.clusterId > 0) {
			label = data[meta.summary[meta.categorization[data.clusterId]].label];
		} else {
			label = data[meta.summary.label];
		}

		outStr = "<span id='popup-title'><h1>" + label + "</h1>";
		summaryDef.content.forEach(function(summaryDefItem) {
			var formatFunction = container.formatValue[summaryDefItem.format];
			outStr += "<p><b>" + summaryDefItem.title + ":</b> " + formatFunction(data[summaryDefItem.field]) + "</p></span>";
		});
	}
	return outStr;
}

function leafletMap(container, options) {
	this.map = L.map(container, options);
	var map = this.map;
	// map.setMaxBounds([
	// 	[0, 0],
	// 	[0, 0]
	// ]);

	map._initPathRoot();
	map.on("zoomstart", function(e) {
		cleanVis();
	});
	var leaflet = this;
	this.TILE_URL = tileBaseUrl + "/{z}/{x}/{y}.png";
	this.addTileLayer = function() {
		L.tileLayer(this.TILE_URL, {
			tms: false
		}).addTo(map);
		return this;
	};
	this.addInteractionLayer = function() {
		geojson = L.geoJson(statesData, {
			onEachFeature: onEachFeature,
			style: {
				weight: 0,
				opacity: 0,
				fillOpacity: 0
			}
		}).addTo(map);

		function zoomToFeature(e) {
			var mapZoom = map.getZoom();
			if (mapZoom <= 8 && mapZoom >= 5) {
				map.fitBounds(e.target.getBounds());
			} else {
				map.zoomIn();
			}
		}

		function onEachFeature(feature, layer) {
			layer.on({
				click: cleanVis,
				dblclick: zoomToFeature
			});
		}
		return this;
	};
	this.colors = ["#DEA362", "#FFD24F", "#FFA700", "#FF661C", "#DB4022",
		"#FF4338", "#FF5373", "#EE81A8", "#EE43A9", "#B42672", "#91388C", "#AC52C4", "#B37AC5",
		"#8085D6", "#A0B3C9", "#5AACE5", "#0067C9", "#008FDE", "#009ADC", "#007297", "#12978B",
		"#00BBB5", "#009778", "#75A33D", "#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"
	];
	this.disableInteractions = function() {
		map.dragging.disable();
		map.keyboard.disable();
		this.disableZoom();
		return this;
	};
	this.disableZoom = function() {
		map.touchZoom.disable();
		map.doubleClickZoom.disable();
		map.scrollWheelZoom.disable();
		map.boxZoom.disable();
		return this;
	};
	this.enableInteractions = function() {
		map.dragging.enable();
		map.keyboard.enable();
		this.enableZoom();
		return this;
	};
	this.enableZoom = function() {
		map.touchZoom.enable();
		map.doubleClickZoom.enable();
		map.scrollWheelZoom.enable();
		map.boxZoom.enable();
		return this;
	};
	this.initPopup = function(selected, d, popupAnchor, alreadyHasHTML) {
		cleanVis();
		selected.classed("active", true);

		if (typeof svgEdge != 'undefined' && selected.classed("follow")) {
			popupEdgeHandling(selected, d);
		}
		var text = alreadyHasHTML ? text = "<div class='popup-scrollablearea'><table>" + d.tableHead + "" + d.tableBody + "</table></div>" :
			populateSummary(d);
		var popup = L.marker(map.layerPointToLatLng(popupAnchor), {
			icon: new this.marker({
				options: {
					autoPan: false,
					iconSize: [0, 0],
					iconAnchor: [0, 0],
					popupAnchor: [0, 0]
				}
			})
		}).addTo(map).bindPopup(text.replaceAll("undefined", ""));
		setTimeout(function() {
			popup.openPopup();
		}, 1);
	};
	this.removePopup = function() {
		map.closePopup();
	}
	this.initSVG = function() {
		map._initPathRoot();
		map.on("viewreset", update);
		svg = d3.select("#map-main").select("svg");
		return {
			"svg": function() {
				return svg.moveToFront();
			},
			"g": svg.append("g"),
			"white": function() {
				var white = svg.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", $(document.body).width() + "px")
					.attr("height", $(document.body).height() + "px")
					.attr("fill", "#FFF")
					.attr("id", "white")
					.on("click", function() {
						cleanVis();
					});
				return white;
			},
			"nodeScale": function(dat, attr, range, domain) {
				var scale = d3.scale.linear()
				if (domain) {
					scale.domain(domain)
				} else {
					scale.domain([d3.min(dat, function(d) {
						return +d[attr];
					}), d3.max(dat, function(d) {
						return +d[attr];
					})])
				}
				return scale.range(range);
			}
		};
	};
	this.linePath = d3.svg.line()
		.x(function(d) {
			return d.x;
		})
		.y(function(d) {
			return d.y;
		});
	this.lineQuadratic = function(obj) {
		var handleX = (obj[1].x - obj[0].x) / 2 + obj[0].x;
		var handleY1 = obj[0].y;
		var handleY2 = obj[1].y;
		return "M " + obj[0].x + " " + obj[0].y + " C " + handleX + "," + handleY1 + " " + handleX + "," + handleY2 + " " + obj[1].x + " " + obj[1].y;
	};
	this.latLngDebug = function() {
		map.on('click', function(e) {
			locationClicked = [e.latlng.lat, e.latlng.lng];
			// console.log(locationClicked);
		});
		return this;
	};
	this.marker = L.Icon.extend({
		options: {
			iconUrl: 'images/up_arrow.svg',
			iconSize: [0, 0],
			shadowSize: [0, 0],
			iconAnchor: [0, 0],
			shadowAnchor: [0, 0],
			popupAnchor: [0, 0]
		}
	});
	this.moveToFront = function(collection) {
		return collection.moveToFront();
	};
	this.aggregates = {
		'+': function(x, y) {
			return x + y;
		},
		'-': function(x, y) {
			return x - y;
		}
	};
	this.formatValue = {
		"": function(d) {
			return d;
		},
		"currency": function(amount, sign) {
			var currencySign = sign || "c";
			if (amount) {
				if (amount < 0) {
					currencySign = "-" + currencySign;
				}
				amt = Math.abs(amount);

				if (amt < 1000) {
					return sign + amt;
				}
				if (amt / 1000000000 >= 1) {
					return sign + (amt / 1000000000).toFixed(amt % 1000000000 != 0) + 'B';
				}
				if (amt / 1000000 >= 1) {
					return sign + (amt / 1000000).toFixed(amt % 1000000 != 0) + 'M';
				}
				return sign + (amt / 1000).toFixed(amt % 1000 != 0) + 'K';
			}
			return sign + "0";
		},
		"currencyEU": function(amount) {
			return leaflet.formatValue.currency(amount, "£");
		},
		"currencyUS": function(amount) {
			return leaflet.formatValue.currency(amount, "$");
		},
		"number": function(num) {
			num += '';
			x = num.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		},
		"toTitleCase": function(str) {
			return str.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
		"truncate": function(str, allowLength) {
			if (str.length > allowLength) {
				str = str.substr(0, allowLength - 3) + "...";
			}
			return str;
		}
	};
	return this;
}

function cascadeSelectTargetEdges(nodeId) {
	var edgesFromNode = svgEdge.filter(function(edge) {
		return (edge.source == nodeId);
	}).data();
	var edgeIds = edgesFromNode.map(function(edge) {
		return edge.id;
	});

	edgesFromNode.forEach(function(edge) {
		targetEdges = cascadeSelectTargetEdges(edge.target);
		edgeIds = edgeIds.concat(targetEdges);
	});

	return edgeIds;

}

function cascadeSelectSourceEdges(nodeId) {
	var edgesFromNode = svgEdge.filter(function(edge) {
		return (edge.target == nodeId);
	}).data();
	var edgeIds = edgesFromNode.map(function(edge) {
		return edge.id;
	});

	edgesFromNode.forEach(function(edge) {
		sourceEdges = cascadeSelectSourceEdges(edge.source);
		edgeIds = edgeIds.concat(sourceEdges);
	});
	return edgeIds;
}

function cascadeSelectEdges(nodeId, something) {
	var one, two;
	if (something == "target") {
		one = "target";
		two = "source";
	} else {
		one = "source";
		two = "target";
	}
	var edgesFromNode = svgEdge.filter(function(edge) {
		return (edge[one] == nodeId);
	}).data();
	var edgeIds = edgesFromNode.map(function(edge) {
		return edge.id;
	});

	edgesFromNode.forEach(function(edge) {
		selectEdges = cascadeSelectEdges(edge[two]);
		edgeIds = edgeIds.concat(sourceEdges);
	});
	return edgeIds;
}

function cascadeSelectEdges(nodeId) {
	var sourceEdgeIds = cascadeSelectSourceEdges(nodeId);
	var targetEdgeIds = cascadeSelectTargetEdges(nodeId);

	var edgeIds = sourceEdgeIds.concat(targetEdgeIds);

	return edgeIds.reduce(function(p, c) {
		if (p.indexOf(c) < 0) p.push(c);
		return p;
	}, []);

}

function popupEdgeHandling(selected, d) {
	var selectedSource = "target";
	var selectedTarget = "source";
	if (d[meta.differentiator]) {
		if (d[meta.differentiator] == meta.bipartiteSeparation[0].differentiatorValue) {
			selectedSource = "source";
			selectedTarget = "target";
		}
	}
	selectedEdges = cascadeSelectEdges(d.id);
	selectedEdges.forEach(function(edge) {
		d3.selectAll("[id='edgeid" + edge + "']")
			.classed("active", true).moveToFront();
	});
	svgEdge.filter(function(edge) {
		return (edge[selectedSource] == d.id || edge[selectedTarget] == d.id);
	}).each(function(filteredEdge, i) {
		d3.selectAll("[id='nodeid" + filteredEdge[selectedTarget] + "']")
			.classed("active", true).moveToFront();
		d3.selectAll("[id='nodeid" + filteredEdge[selectedSource] + "']")
			.classed("active", true).moveToFront();
	});
}

function cleanVis() {
	container.removePopup();
	d3.selectAll(".active").classed("active", false);
	d3.selectAll("circle").classed("inactive", false);
	d3.selectAll("rect").classed("inactive", false);
	d3.selectAll("path").classed("inactive", false);
	d3.selectAll("text").classed("inactive", false);
	d3.selectAll("circle").classed("active", false);
	d3.selectAll("rect").classed("active", false);
	d3.selectAll("path").classed("active", false);
	d3.selectAll("text").classed("active", false);
}

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};
