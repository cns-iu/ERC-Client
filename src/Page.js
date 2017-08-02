head.js({
	'global-css': "styles/nete_global.css"
}, {
	'd3': "lib/d3.v3.min.js"
}, {
	'leaflet': "src/LeafletMap.js"
}, {
	'jquery': "lib/jquery-1.11.0.min.js"
}, {
	'rainbow': "lib/rainbow.js"
}, {
	'leaflet': 'lib/leaflet.js'
}, {
	'thenBy': 'lib/thenBy.js'
}, {
	'mapbox': 'lib/mapbox.js'
}, {
	'angular': "lib/angular.js"
}, {
	'angular-ui': "lib/angular-ui-router.js"
}, {
	'angular-route': "lib/angular-route.js"
}, {
	'legendItems': "lib/legendItems.js"
});
var animationParameters = {
	queue: true,
	duration: 100,
	easing: 'swing'
};
var fullscreen = false;
var legendVisible = true;

function multiColumnSort(arr, sf, dir) {
	var s = '';
	sf.forEach(function(f, idx) {
		s += 'if(arguments[0]["' + f + '"]<arguments[1]["' + f + '"])return ' + (dir * -1) + ';';
		s += 'else if(arguments[0]["' + f + '"]==arguments[1]["' + f + '"])';
		s += (idx < sf.length - 1) ? '{' : 'return 0';
	});
	s += Array(sf.length).join('}') + ';return ' + dir;
	return arr.sort(new Function(s));
};

function toggleLegend() {
	var footerHeight = $('#footer').height() * -1;
	switch (legendVisible) {
		case false:
			$("#footer").animate({
				bottom: footerHeight
			}, animationParameters);
			legendVisible = true;
			document.getElementById("arrowL").src = "images/up_arrow.svg";
			document.getElementById("arrowR").src = "images/up_arrow.svg";
			break;
		case true:
			$("#footer").animate({
				bottom: "0px"
			}, animationParameters);
			legendVisible = false;
			document.getElementById("arrowL").src = "images/down_arrow.svg";
			document.getElementById("arrowR").src = "images/down_arrow.svg";
			break;
	}
}

function toggleHeader() {
	switch (fullscreen) {
		case true:
			document.getElementById("fullscreen").src = "images/enter_full.svg";
			$('#header-wrapper').animate({
				height: "15%"
			}, {
				complete: function() {
					config.resizeVis(data);
				}
			});

			fullscreen = false;
			break;
		case false:
			document.getElementById("fullscreen").src = "images/exit_full.svg";
			$('#header-wrapper').animate({
				height: "0%",
			}, {
				complete: function() {
					config.resizeVis(data);
				}
			});
			fullscreen = true;
			break;
	}
}


//Browser fixes
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(fn, scope) {
		for (var i = 0, len = this.length; i < len; ++i) {
			fn.call(scope, this[i], i, this);
		}
	};
}
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
	Array.prototype.map = function(callback, thisArg) {

		var T, A, k;

		if (this === null) {
			throw new TypeError(" this is null or not defined");
		}

		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== "function") {
			throw new TypeError(callback + " is not a function");
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (thisArg) {
			T = thisArg;
		}

		// 6. Let A be a new array created as if by the expression new Array(len) where Array is
		// the standard built-in constructor with that name and len is the value of len.
		A = new Array(len);

		// 7. Let k be 0
		k = 0;

		// 8. Repeat, while k < len
		while (k < len) {

			var kValue, mappedValue;

			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				kValue = O[k];

				// ii. Let mappedValue be the result of calling the Call internal method of callback
				// with T as the this value and argument list containing kValue, k, and O.
				mappedValue = callback.call(T, kValue, k, O);

				// iii. Call the DefineOwnProperty internal method of A with arguments
				// Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
				// and false.

				// In browsers that support Object.defineProperty, use the following:
				// Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

				// For best browser support, use the following:
				A[k] = mappedValue;
			}
			// d. Increase k by 1.
			k++;
		}

		// 9. return A
		return A;
	};
}

if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
	var msViewportStyle = document.createElement("style");
	msViewportStyle.appendChild(
		document.createTextNode(
			"@-ms-viewport{width:auto!important}"
		)
	);
	document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
}

function parseDateUTC(input) {
	var reg = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
	var parts = reg.exec(input);
	return parts ? (new Date(Date.UTC(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]))) : null;
}

if (!window.console) {
	console = {};
	console.log = function() {};
}
String.prototype.replaceAll = function(find, replace) {
	return this.replace(new RegExp(find, 'g'), replace);
}