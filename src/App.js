//http://www.ng-newsletter.com/posts/directives.html 
var app = angular.module('app', [])

var globalScope;
var verbose = false;
//TODO: KNOWN ISSUES
//	- Toggling physics off, then dragging an element turns physics back on. This doesn't reregister properly though. 
//		So to turn physics off again, the button in the debug bar needs to be clicked twice
//	- The tolerance slider doesn't reset so the values slip out of range if you change the node size attribute
app.service('Data', ['$rootScope', '$http', function($rootScope, $http) {
	var service = {
		mapDatasource: globalDatasourceMap,
		dataQueue: [],
		//TODO: Test this
		addToDataQueue: function(s) {
			if (this.dataQueue.indexOf(s) < 0) {
				this.dataQueue.push(s);
			}
		},
		retrieveData: function(datasource, cb) {
			if (datasource) {
				if (verbose) console.log("Getting " + datasource + " data...");
				$http({
					method: 'GET',
					url: this.mapDatasource[datasource].url
				}).then(function(res) {
					if (verbose) console.log("Got " + datasource + " data!");
					cb(res);
				});
			}
		},
		getData: function(datasource) {
			var that = this;
			this.retrieveData(datasource, function(res) {
				that.mapDatasource[datasource].data = res.data;
				if (verbose) console.log("Broadcasting: " + datasource + " updated.");
				$rootScope.$broadcast(datasource + '.update', res.data);
				that.mapDatasource[datasource].dataPrepared = true;
				return res.data;
			})
		},
		getAllData: function() {
			var that = this;
			this.dataQueue.forEach(function(d, i) {
				that.getData(d);
			})
		}
	}
	Object.keys(service.mapDatasource).map(function(d, i) { 
		service.mapDatasource[d].data = {}; 
		service.mapDatasource[d].dataPrepared = false;
	});
	return service;
}])


app.directive('ngCnsVisual', ['$rootScope', 'Data', function($rootScope, Data) {
	return {
		restrict: "A",
		controller: ['$scope', '$http', function($scope, $http) {
		}],
		link: {
			pre:  function(scope, elem, attrs, ctrl) {
				if (verbose) console.log("Visual pre link for: " + attrs.ngIdentifier);
				Data.addToDataQueue(attrs.ngDataField);
				visualizations[attrs.ngIdentifier] = new VisualizationClass();
				visualizations[attrs.ngIdentifier].Vis = visualizationFunctions[attrs.ngVisType];

				visualizations[attrs.ngIdentifier].SetAngularElement(elem);
				visualizations[attrs.ngIdentifier].SetAngularOpts(attrs);
				if(attrs.ngComponentFor) {
					scope.$watch(attrs.ngComponentFor + '.created', function() {
						visualizations[attrs.ngComponentFor].Children.push(attrs.ngIdentifier);
					})
				} else {
					$rootScope.$broadcast(attrs.ngIdentifier + '.created')
				}
			},
			post: function(scope, elem, attrs, ctrl) {
				if (verbose) console.log("Visual post link for: " + attrs.ngIdentifier);
				if (attrs.ngDataField) {
					scope.$on(attrs.ngDataField + '.update', function(oldVal, newVal) {
						if (verbose) console.log("Updating: " + attrs.ngIdentifier);
						//TODO: Method to update args a little better 
						if (newVal !== oldVal) {
							//TODO: This may need to be updated if we want to periodically push new data WITHOUT redrawing the whole visualization
							visualizations[attrs.ngIdentifier].SetAngularData(newVal);
							visualizations[attrs.ngIdentifier].Update();
						}
					})
				}
			}
		}
	}
}])

app.directive('ngCnsVisRunner', ['$rootScope', '$timeout', 'Data', function($rootScope, $timeout, Data) {
	return {
		restrict: "A",
		controller: ['$scope', '$http', function($scope, $http) {
			$scope.attrs = {};
			$scope.postHelper = function() {
				$timeout(function() {
					Data.getAllData();
				}, 1);
			}
		}],
		link: {
			pre:  function(scope, elem, attrs, ctrl) {
				if (verbose) console.log("Runner pre link");
			},
			post: function(scope, elem, attrs, ctrl) {
				if (verbose) console.log("Runner post link");
				scope.postHelper();
			}
		}
	}
}]);

angular.element(document).ready(function() {
	angular.bootstrap(document, ['app']);
})
