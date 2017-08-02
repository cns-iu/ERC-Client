var VisualizationClass = function() {
	this.config = null,
		this.VisFunc = null,
		this.isReady = false,
		this.Vis = null,
		this.SVG = null,
		this.Scales = {},
		this.Children = [],
		this.isFirstRun = true,
		this.PrimaryDataAttr = "",
		this.filteredData = {nodes:{data:{}},edges:{data:{}},records:{data:{}}},
		this.AngularArgs = {
			element: "",
			data: {nodes:{data:{}},edges:{data:{}},records:{data:{}}},
			opts: ""
		},
		this.Verbose = verbose || false,
		this.GetData = function() {
			// if (Object.keys(this.filteredData).length == 0) {
			// 	switch (this.AngularArgs.data.topology) {
			// 		case "graph":
			// 			this.AngularArgs.data[this.PrimaryDataAttr].data.map(function(d, i) {
			// 				d.storedId = d.id;
			// 			})
			// 			this.AngularArgs.data.edges.data.map(function(d, i) {
			// 				d.storedSource = d.source;
			// 				d.storedTarget = d.target;
			// 			});
			// 			break;
			// 		case "table":
			// 			this.AngularArgs.data[this.PrimaryDataAttr].data.map(function(d, i) {
			// 				d.storedId = d.id;
			// 			})
			// 			break;
			// 		default:
			// 			console.log(this.AngularArgs)
			// 			// this.AngularArgs.data.map(function(d, i) {
			// 			// 	d.storedId = d.id;
			// 			// });
			// 			break;
			// 	}
			// 	this.RunDataFilter();
			// }
			return this.filteredData;
			// return this.AngularArgs.data;
		},
		this.CreateDataIdMap = function(data) {
			var idMap = {},
				i = 0;
			data.map(function(d, i) {
				if (!idMap[d.id]) {
					idMap[d.id] = i;
					i++;
				}
			});
			return idMap;
		},
		this.RemapDataIds = function(data, idMap) {
			var somethingweird = [];
			data.forEach(function(d, i) {
				d.id = idMap[d.id];
				somethingweird.push(d);
			});
			return somethingweird;
		},
		this.RemapEdgeDataIds = function(data, idMap) {
			return data.map(function(d, i) {
				if (typeof d.source == "object") {
					d.source = idMap[d.source.id];
					d.target = idMap[d.target.id];
				} else {
					d.source = idMap[d.source];
					d.target = idMap[d.target];
				}
			});
		},
		this.FilterGraphData = function(dataset, filterAttr, range) {
			var newRange = range;
			var nodeDataClone = dataset.nodes.data;
			var edgeDataClone = dataset.edges.data;
			var filteredNodeData = nodeDataClone;
			if (!newRange) newRange = [];
			var extent = d3.extent(nodeDataClone, function(d, i) {
				return d[filterAttr];
			})
			if (newRange[0] == null) newRange[0] = extent[0];
			if (newRange[1] == null) newRange[1] = extent[1];
			filteredNodeData = filteredNodeData.filter(function(d, i) {
				return newRange[0] <= d[filterAttr] && d[filterAttr] <= newRange[1];
			});
			var filteredIdMap = filteredNodeData.map(function(d, i) {
				return d.id;
			});
			var filteredEdgeData = edgeDataClone.filter(function(d, i) {
				return (filteredIdMap.indexOf(d.source) > -1 && filteredIdMap.indexOf(d.target) > -1);
			});
			var idMap = this.CreateDataIdMap(filteredNodeData);
			this.filteredData.nodes.data = this.RemapDataIds(filteredNodeData, idMap);
			this.filteredData.edges.data = this.RemapEdgeDataIds(filteredEdgeData, idMap);
		},

		
		this.FilterTableData = function(dataset, filterAttr, range) {
			var idMap = this.CreateDataIdMap(dataset.nodes.data);
			var newRange = range;
			var recordDataClone = dataset.records.data;
			if (!newRange) newRange = [];
			var extent = d3.extent(recordDataClone, function(d, i) {
				return d[filterAttr];
			})
			if (newRange[0] == null) newRange[0] = extent[0];
			if (newRange[1] == null) newRange[1] = extent[1];

			var filteredRecordData = recordDataClone.map(function(d, i) {
				return newRange[0] <= d[filterAttr] && d[filterAttr] <= newRange[1];
			});
			this.filteredData.records.data = this.RemapDataIds(filteredRecordData);
		},
		this.FilterData = function(data, attr, range) {
			switch (this.PrimaryDataAttr) {
				case "nodes":
					this.FilterGraphData(data, attr, range);
					break;
				case "records":
					this.FilterTableData(data, attr, range);
					break;
				default:
					console.log("Non-conforming data. Need to handle.");
					break;
			}
			return this;
		},
		this.FilterAngularData = function(attr, range) {
			this.FilterData({
				nodes:this.AngularArgs.data.get("nodes"),
				edges:this.AngularArgs.data.get("edges"),
				records:this.AngularArgs.data.get("records")}, attr, range)
			return this;
		},		
		this.CreateBaseConfig = function() {
			var out = {};
			out.margins = {};
			out.dims = {};
			out.meta = configs[this.AngularArgs.opts.ngIdentifier];
			out.margins.top = 0
			out.margins.right = 0
			out.margins.bottom = 0
			out.margins.left = 0
			out.dateFormat = this.AngularArgs.opts.ngDateFormat || "%d-%b-%y";
			out.dims.width = (this.AngularArgs.opts.ngWidth || $(this.AngularArgs.element[0]).width()) - out.margins.left - out.margins.right;
			out.dims.height = (this.AngularArgs.opts.ngHeight || $(this.AngularArgs.element[0]).height()) - out.margins.top - out.margins.bottom;
			out.dims.fixedWidth = out.dims.width - out.margins.left - out.margins.right;
			out.dims.fixedHeight = out.dims.height - out.margins.top - out.margins.bottom;
			out.colors = this.AngularArgs.opts.ngColors || ["#AC52C4", "#FF4338", "#FFA700", "#DEA362",
				"#FFD24F", "#FF661C", "#DB4022", "#FF5373",
				"#EE81A8", "#EE43A9", "#B42672", "#91388C",
				"#B37AC5", "#8085D6", "#A0B3C9", "#5AACE5",
				"#0067C9", "#008FDE", "#009ADC", "#007297",
				"#12978B", "#00BBB5", "#009778", "#75A33D",
				"#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"
			];
			out.easySVG = function(selector) {
				return d3.select(selector)
					.append("svg")
					.attr("transform", "translate(" + out.margins.left + "," + out.margins.top + ")")
					.attr("width", out.dims.width - out.margins.left - out.margins.right)
					.attr("height", out.dims.height - out.margins.top - out.margins.bottom);
			}
			out.easyLeafletMap = function(container, options, tileURL) {
				var obj = new Object();
				obj.map = L.map(container, options);
				var map = obj.map;
				// map._initPathRoot();
				var leaflet = obj;
				obj.TILE_URL = tileURL + "/{z}/{x}/{y}.png";
				obj.addTileLayer = function() {
					L.tileLayer(obj.TILE_URL, {
						tms: false
					}).addTo(map);
					return obj;
				};
				obj.addInteractionLayer = function() {
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
							dblclick: zoomToFeature
						});
					}
					return obj;
				};
				obj.disableInteractions = function() {
					map.dragging.disable();
					map.keyboard.disable();
					obj.disableZoom();
					return obj;
				};
				obj.disableZoom = function() {
					map.touchZoom.disable();
					map.doubleClickZoom.disable();
					map.scrollWheelZoom.disable();
					map.boxZoom.disable();
					return obj;
				};
				obj.enableInteractions = function() {
					map.dragging.enable();
					map.keyboard.enable();
					obj.enableZoom();
					return obj;
				};
				obj.enableZoom = function() {
					map.touchZoom.enable();
					map.doubleClickZoom.enable();
					map.scrollWheelZoom.enable();
					map.boxZoom.enable();
					return obj;
				};
				obj.initPopup = function() {
					//TODO: Implement obj
				};
				obj.removePopup = function() {
					map.closePopup();
				}
				obj.latLngDebug = function() {
					map.on('click', function(e) {
						locationClicked = [e.latlng.lat, e.latlng.lng];
						console.log(locationClicked);
					});
					return obj;
				};
				obj.marker = L.Icon.extend({
					options: {
						iconUrl: 'images/up_arrow.svg',
						iconSize: [0, 0],
						shadowSize: [0, 0],
						iconAnchor: [0, 0],
						shadowAnchor: [0, 0],
						popupAnchor: [0, 0]
					}
				});
				return obj;
			}			
			return out;
		},
		this.ClearVis = function() {
			try {
				this.SVG.selectAll("*").remove();
			} catch (exception) {}
			return this;
		},
		this.ResetVis = function() {
			this.ClearVis();
			this.RunVis();
			return this;
		},
		this.RunEvents = function() {
			if (events[this.AngularArgs.opts.ngIdentifier])
				events[this.AngularArgs.opts.ngIdentifier](visualizations[this.AngularArgs.opts.ngIdentifier]);
			var indent = "     ";
			if (this.AngularArgs.opts.ngComponentFor != null) indent += indent;
			if (this.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Events bound: " + this.AngularArgs.opts.ngIdentifier);
			return this;
		},
		this.RunChildVisualizations = function() {
			var that = this;
			this.Children.forEach(function(v) {
				visualizations[v].Update();
				visualizations[v].PrimaryDataAttr = that.PrimaryDataAttr;
			})
		},
		//Simple duplicate request removal. Kills the timeout and reruns it within 10ms. Will this work with huge datasets?
		this.RunVisQueue;
		this.DataRange = [];
		this.RunVis = function(args) {
			var args = args || {};
			clearTimeout(this.RunVisQueue);
			var that = this;
			this.RunVisQueue = setTimeout(function() {
				that.isReady = false;
				that.ClearVis();
				if (that.isFirstRun) {
					that.Vis(that.AngularArgs.element, that.AngularArgs.data, that.AngularArgs.opts);
				}
				try {
					if (!that.AngularArgs.opts.ngLazy || args.lazyRun) that.VisFunc();
				} catch (exception) {
					if (that.Verbose) console.log("Visualization failed: " + that.AngularArgs.opts.ngIdentifier);
					throw exception;
				}
				var indent = " ";
				if (that.AngularArgs.opts.ngComponentFor != null) indent += "     ";
				if (that.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Created visualization: " + that.AngularArgs.opts.ngIdentifier);
				angular.element(document).ready(function() {
					//TODO: For demo purposes. Pops in the customization.
					if (!args.skipEvents) setTimeout(function() {
						that.RunChildVisualizations();
						that.RunEvents();
					}, 150);
				});
				that.isFirstRun = false;
				that.isReady = true;
			}, 10);
			return that;
		},

		this.SetAngularArgs = function(element, data, opts) {
			this.SetAngularElement(element);
			this.SetAngularData(data);
			this.SetAngularOpts(opts);
		},
		this.SetAngularElement = function(element) {
			this.AngularArgs.element = element;
		},
		this.SetAngularData = function(data) {
			this.AngularArgs.data = Immutable.Map(data) || Immutable.Map({nodes:{data:{}},edges:{data:{}},records:{data:{}}});
			this.filteredData = data;
			if (data.topology == "graph") this.PrimaryDataAttr = "nodes";
			if (data.topology == "table") this.PrimaryDataAttr = "records";

		},
		this.SetAngularOpts = function(opts) {
			this.AngularArgs.opts = opts;
		},
		this.Update = function() {
			this.RunVis();
		}
};

function checkFilter() {
	console.log("Master node data: " + visualizations.mainVis.AngularArgs.data.get("nodes").data.length);
	console.log("Master edges data: " + visualizations.mainVis.AngularArgs.data.get("edges").data.length);
	console.log("Filtered node data: " + visualizations.mainVis.filteredData.nodes.data.length);
	console.log("Filtered edge data: " + visualizations.mainVis.filteredData.edges.data.length);
	visualizations.mainVis.FilterAngularData("usertc", [30, 600]);
	console.log("===============================");
	console.log("Master node data, post-filter-1: " + visualizations.mainVis.AngularArgs.data.get("nodes").data.length);
	console.log("Master edges data, post-filter-1: " + visualizations.mainVis.AngularArgs.data.get("edges").data.length);
	console.log("Filtered node data, post-filter-1: " + visualizations.mainVis.filteredData.nodes.data.length);
	console.log("Filtered edge data, post-filter-1: " + visualizations.mainVis.filteredData.edges.data.length);
	visualizations.mainVis.FilterAngularData("usertc", [50, 600]);
	console.log("===============================");
	console.log("Master node data, post-filter-2: " + visualizations.mainVis.AngularArgs.data.get("nodes").data.length);
	console.log("Master edges data, post-filter-2: " + visualizations.mainVis.AngularArgs.data.get("edges").data.length);
	console.log("Filtered node data, post-filter-2: " + visualizations.mainVis.filteredData.nodes.data.length);
	console.log("Filtered edge data, post-filter-2: " + visualizations.mainVis.filteredData.edges.data.length);
}