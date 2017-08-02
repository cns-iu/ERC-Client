visualizationFunctions.ProportionalSymbol = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.VisFunc = function() {
		var useData = network.GetData()[network.PrimaryDataAttr].data;
		if (!opts.ngDataField) {
			useData = network.parentVis.GetData()[network.parentVis.PrimaryDataAttr].data;
			network.Scales = network.parentVis.Scales;
			if (!network.config.meta) {
				network.config.meta = network.parentVis.config.meta	
			}
		}
		var tempCat1 = ["a", "b", "c", "d"];
		var tempCat2 = ["1", "2", "3", "4"];
		useData.map(function(d, i) {
			d.cat1 = tempCat1[Math.floor(Math.random() * 4)];
			d.cat2 = tempCat2[Math.floor(Math.random() * 4)];
		});

		network.AngularArgs.data.edges = {};
		network.AngularArgs.data.edges.data = [];		
		for (var i = 0; i < 100; i++) {
			var obj = {};
			var randS = Math.floor(Math.random() * useData.length);
			var randT = Math.floor(Math.random() * useData.length);
			obj.index = i;
			obj.source = randS;
			obj.target = randT;
			network.AngularArgs.data.edges.data.push(obj);
		}

		var categories = ["cat1", "cat2", "ipREGION"];
		var categoryBank = {};

		categories.forEach(function(category) {
			categoryBank[category] = d3.nest()
				.key(function(d) { return d[category]; })
				.rollup(function(leaves) { 
					var obj = {children:leaves};
					network.GetData()[network.PrimaryDataAttr].schema.forEach(function(d) {
						if (d.type == "numeric") {
							obj[d.name] = d3.mean(leaves, function(d1) {
								return d1[d.name];
							})
						}
					})
					return obj;
				})
				.entries(useData);
		})
		console.log(categoryBank)
		Object.keys(categoryBank).forEach(function(d, i) {
			categoryBank[d].forEach(function(d1, i1) {
				if (d1.key == "") {
					// console.log(":/")
					categoryBank[d].splice(i1, 1)
				}
			})
		})

		network.leaflet = network.config.easyLeafletMap(element[0], {
			worldCopyJump: true,
			minZoom: 2,
			maxZoom: 8,
			center: [39, -98],
			zoom: 5,
			closePopupOnClick: true
		}, "http://{s}.tile.openstreetmap.org").addInteractionLayer().addTileLayer();
		network.leaflet.map._initPathRoot();
		network.SVG = d3.select(element[0]).select("svg"),

		network.leaflet.map.on("viewreset", update);

		var rScale = d3.scale.linear()
			.domain([
				d3.min(categoryBank.ipREGION, function(d) { return d.values.Count}),
				d3.max(categoryBank.ipREGION, function(d) { return d.values.Count})])
			.range([2, 24])
		
		network.SVG.nodes = network.SVG.selectAll(".circle")
			.data(categoryBank.ipREGION)
			.enter()
			.append("circle")
			.attr("class", function(d, i) {
				console.log(d.index);
				return "id" + d.index
			})
			.attr("r", function(d, i) {
				return rScale(d.values.Count)
			})
			.attr("stroke-width", 1.125)
			.attr("fill", "#8DC63F")
			.attr("stroke", "black")
		network.SVG.edges = network.SVG.selectAll(".path")
			.data(network.AngularArgs.data.edges.data)
			.enter()
			.append("path")

		update();
		function update() {
			network.SVG.nodes
				.attr("transform", function(d, i) {
					var l1= network.leaflet.map.latLngToLayerPoint({
						"lat": d.values.Latitude || 0,
						"lng": d.values.Longitude || 0
					});
					var x = l1.x;
					var y = l1.y;
					return "translate(" + x + "," + y + ")";
				}).on("click", function(d) {
					var popup = L.marker(network.leaflet.map.layerPointToLatLng(network.leaflet.map.latLngToLayerPoint({
						"lat": d.values.Latitude || 0,
						"lng": d.values.Longitude || 0
					})), {
						icon: new network.leaflet.marker({
							options: {
								autoPan: false,
								iconSize: [0, 0],
								iconAnchor: [0, 0],
								popupAnchor: [0, 0]
							}
						})
					}).addTo(network.leaflet.map).bindPopup(JSON.stringify(d, null, 4));
					setTimeout(function() {
						popup.openPopup();
					}, 1);					
				})
			// network.SVG.edges
			// 	.attr("d", function(d, i) {
			// 		var sourceNode = d3.select(network.SVG.nodes.filter(".id" + d.source).node());
			// 		var targetNode = d3.select(network.SVG.nodes.filter(".id" + d.target).node());
			// 		console.log(sourceNode);
			// 		return Utilities.lineFunction([{
			// 			"x": sourceNode.attr("cx"),
			// 			"y": sourceNode.attr("cy")
			// 		}, {
			// 			"x": targetNode.attr("cx"),
			// 			"y": targetNode.attr("cy")
			// 		}])
			// 	})

		}
	}
	return network;
}
