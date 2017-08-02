//Head loads scripts in parellel, but executes them in order.
var visualizations = {};
var visualizationFunctions = {};
var events = {};
var configs = {};
(function() {
	'use strict';
	head.js(
		// FONTS
		// CSS
		{'main-css'				: 'css/style.css'},
		{'leaflet-css'			: 'css/leaflet.css'},
		{'font-awesome' 		: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css'},
		// JAVASCRIPT
		{'jquery'				: 'lib/jquery-1.11.2.min.js'},
		{'d3'					: 'lib/d3.v3.min.js'},
		{'d3-tip' 				: 'lib/d3.tip.v0.6.3.js'},
		{'forceEdgeBundling' 	: 'lib/d3-forceEdgeBundling.js'},
		{'bootstrap'			: 'lib/bootstrap.min.js'},
		{'immutable'			: 'lib/immutable.js'},
		{'leaflet'				: 'lib/leaflet.js'},
		{'Utilities'			: 'src/Utilities.js'},
		{'VisualizationMeta'	: 'src/VisualizationMeta.js'},
		{'Visualization'		: 'src/Visualization.js'},
		{'DatasourceMap'		: 'src/DatasourceMap.js'},
		{'a' 					: 'visuals/ProportionalSymbol/visualization/ProportionalSymbol.js'},
		{'b' 					: 'visuals/ProportionalSymbol/visualization/underlyingStateData.js'},
		{'c' 					: 'visuals/ProportionalSymbol/prosym-events.js'},
		{'d' 					: 'visuals/MapOfScience/visualization/MapOfScience.js'},
		{'e' 					: 'visuals/MapOfScience/visualization/underlyingScimapData.js'},
		{'f' 					: 'visuals/MapOfScience/scimap-events.js'},
		{'g' 					: 'visuals/MapOfScience/scimap-config.js'},
		{'angular-route'		: 'lib/angular-route.js'}
 	);
 }).call(this);

// Load the app once the last head script is called. angular-route is the name given to the appropriate script (above).
head.ready('angular-route', function() {
	angular.element(document).ready(function() {
		head.js('src/App.js');
	});
});
