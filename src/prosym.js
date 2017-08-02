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
	data = cleanseData(data.records.data);
	container = new leafletMap('map-main', {
		worldCopyJump: true,
		minZoom: 2,
		maxZoom: 8,
		center: [39, -98],
		zoom: 3,
		//zoomControl: true,
		closePopupOnClick: true
	}).addInteractionLayer().addTileLayer();
	clusters = makeClusters(data);
	var initSVG = container.initSVG();
	var svg = initSVG.svg();
	update();
}

function initNode(data) {
	var rainbow = new Rainbow();
	var svgNode;
	var initSVG = container.initSVG();
	nodeScale = initSVG.nodeScale(data, meta.sizeCoding[0], config.nodeScale.range);
	rainbow.setNumberRange(nodeScale.domain()[0], nodeScale.domain()[1]);
	rainbow.setSpectrum('orange', 'red');
	if (svgNode) svgNode.length = 0;
	svg.selectAll(".node").remove();
	svgNode = svg.selectAll("nodes")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("id", function(d) {
			return "nodeid" + d.id;
		})
		.attr("fill", function(d, i) {
			return "#" + rainbow.colourAt(d[meta.sizeCoding[0]]);
		})
		.on("click", function(d, i) {
			var node = d3.select(this);
			var popupAnchor = [Number(node.attr("cx")), Number(node.attr("cy")) - Number(node.attr("r"))];
			container.map.panTo(container.map.layerPointToLatLng(popupAnchor));
			container.initPopup(node, d, popupAnchor, true);
		})
		.attr("r", 0);
	return svgNode;
}

function update() {
	var svgNode;
	var currCluster;

	var zoomClusterScale = d3.scale.linear()
		.domain([container.map.getMinZoom(), container.map.getMaxZoom()])
		.range([0, meta.categorization.length]);

	var clusterToUse = Math.floor(zoomClusterScale(container.map.getZoom()));
	if (clusterToUse >= meta.categorization.length - 1) {
		svgNode = initNode(data.records.data);
	} else {
		svgNode = initNode(clusters[meta.categorization[clusterToUse]]);
	}

	svgNode[0].forEach(function(d, i) {
		var d2 = d.__data__;
		if (d2[meta.latLng.lat] != null && d2[meta.latLng.lng] != null) {
			var point = container.map.latLngToLayerPoint({
				"lat": d2[meta.latLng.lat],
				"lng": d2[meta.latLng.lng]
			});
			d3.select(d).attr({
				cx: point.x,
				cy: point.y,
				r: nodeScale(d2[meta.sizeCoding[0]]) || 3
			});
		}
	});
	legendItems.sizedBy.setAll();
}

function cleanseData(dataToCleanse) {
	var cleanData = [];
	var unusedData = [];
	dataToCleanse.forEach(function(d, i) {
		if (d[meta.sizeCoding[0]] === null || d[meta.latLng.lat] === null || d[meta.latLng.lat] === null) {
			unusedData.push(dataToCleanse.splice(i, 1));
		} else {
			cleanData.push(d);
		}
	});
	//alert("Warning! " + unusedData.length + " records were excluded due to being incomplete.");
	return cleanData;
}

var clusters = {};

function makeClusters(data) {
	data.forEach(function(item) {
		item.tableBody += "<tr class='ellipsis' style='text-align:left; font-size:" + 14 + "px;'><td class='ellipsis'>";
		item.tableBody += item.Title;
		item.tableBody += "</td>";
		for (var i in meta.summary.content) {
			var formatFunction = container.formatValue[meta.summary.content[i].format];
			item.tableBody += "<td style='text-align:right'>";
			item.tableBody += formatFunction(item[meta.summary.content[i].field]);
			item.tableBody += "</td>";
		}
		item.tableBody += "</tr>";
	});

	function promoteValues(arr) {
		arr.forEach(function(item) {
			$.extend(item, item.values);
			delete item.values;
		});
	}

	function clusterSelection(dataset, i) {
		return createNewNest(i, function(d) {
			return d[meta.categorization[i]];
		}).entries(dataset);
	}

	//TODO: Clean up the stupid variable names
	var tempData;
	meta.categorization.forEach(function(category, i) {
		if (i === 0) {
			clusters[category] = clusterSelection(data, i);
			promoteValues(clusters[category]);
		} else {
			clusters[category] = [];
			var tempData = [];
			clusters[meta.categorization[i - 1]].forEach(function(parentCluster) {
				var temptempData = clusterSelection(parentCluster.children, i);
				promoteValues(temptempData);
				temptempData.forEach(function(somethingElse) {
					clusters[category].push(somethingElse);
				});
				parentCluster[meta.categorization[i]] = temptempData;
			});
		}
	});

	var sortFunction = function(a, b) {
		var dir = 1;
		if (meta.sortByDir == "desc") {
			dir *= -1;
		}

		if (a[meta.sortBy] < b[meta.sortBy]) return dir;
		if (a[meta.sortBy] > b[meta.sortBy]) return dir * -1;
		return 0;
	};
	meta.categorization.forEach(function(category) {
		clusters[category].sort(sortFunction);
		clusters[category].forEach(function(cluster) {
			cluster.children.sort(sortFunction);
		});
	});


	var moddedCategories = meta.categorization;
	moddedCategories.push("children");
	var textScale = d3.scale.linear()
		.domain([0, moddedCategories.length])
		.range([1.3, 0.5]);

	for (var j = moddedCategories.length - 1; j > 0; j--) {
		var currIndex = j - 1;
		clusters[moddedCategories[currIndex]].forEach(function(item) {
			item.tableHead = "<tr id='popup-title' style='text-align:left !important; font-size:" + textScale(j) + "em'><th>" + item.key + "</th>";
			for (var i in meta.summary.content) {
				var formatFunction = container.formatValue[meta.summary.content[i].format];
				item.tableHead += "<td style='text-align:right'>";
				item.tableHead += formatFunction(item[meta.summary.content[i].field]);
				item.tableHead += "</td>";
			}
			item.tableHead += "</tr>";
			item[moddedCategories[currIndex + 1]].forEach(function(node) {
				item.tableBody += (node.tableHead + "" + node.tableBody);
			});
			item[moddedCategories[currIndex + 1]].sort(sortFunction);
		});
	}
	clusters[meta.categorization[0]].forEach(function(item) {
		// item.tableHead = "<tr id='popup-title' style='font-size:16px' class='truncate'><th>" + meta.categorizationHeader + "</th><th style='text-align:right'>" + meta.sizeCoding[0] + "</th></tr>" + item.tableHead;
		item.tableHead = "<tr id='popup-title' style='text-align:left !important; font-size:16px'><th>" + item.key + "</th>";
		for (var i in meta.summary.content) {
			var formatFunction = container.formatValue[meta.summary.content[i].format];
			item.tableHead += "<th style='text-align:right'>";
			item.tableHead += meta.summary.content[i].field;
			item.tableHead += "</th>";
		}
		item.tableHead += "</tr>";
	});

	var avgLat = 0,
		avgLng = 0;
	clusters[meta.categorization[0]].forEach(function(state) {
		avgLat += state.Latitude || 0;
		avgLng += state.Longitude || 0;

	})

	//container.map.panTo(container.map.layerPointToLatLng([avgLat / clusters[meta.categorization[0]].length, avgLng / clusters[meta.categorization[0]].length]));

	return clusters;
}

function createNewNest(categoryLevel, keyFunction) {
	return d3.nest().key(keyFunction).rollup(function(obj) {
		var out = {};
		out[meta.sizeCoding[0]] = d3.sum(obj, function(d) {
			return Number(d[meta.sizeCoding[0]]);
		});
		out[meta.latLng.lat] = d3.mean(obj, function(d) {
			return Number(d[meta.latLng.lat]);
		});
		out[meta.latLng.lng] = d3.mean(obj, function(d) {
			return Number(d[meta.latLng.lng]);
		});
		out.tableHead = "";
		out.tableBody = "";
		out.children = obj;
		out.categoryLevel = categoryLevel;
		meta.summary.content.forEach(function(contentItem, i) {
			var formatFunction = container.formatValue[contentItem.format];
			out[contentItem.title] = d3.sum(obj, function(d) {
				return Number(d[contentItem.field]);
			});
		});
		return out;
	});
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
		"resizeVis": function() {},
		"updateLegendItems": function() {
			legendItems.sizedBy.setAll();
		},
		"nodeScale": {
			"domain": "",
			"range": [4, 46]
		}
	}
}
