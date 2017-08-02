var Utilities = {
	round: function(n, precision) {
		var prec = Math.pow(10, precision);
		return Math.round(n*prec)/prec;
	},
	format: function(n) {
		var base = Math.floor(Math.log(Math.abs(n))/Math.log(1000));
		var suffix = 'KMBT'[base-1];
		return suffix ? Utilities.round(n/Math.pow(1000,base),2) + suffix : ''+n;
	},
	formatValue: {
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
			return this.currency(amount, "£");
		},
		"currencyUS": function(amount) {
			return this.currency(amount, "$");
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
	},
	parseDateUTC: function(input) {
		var reg = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
		var parts = reg.exec(input);
		return parts ? (new Date(Date.UTC(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]))) : null;
	},
	removeCharactersFromString: function(str) {
		return parseInt(str.replace(/\D/g,''));
	},
	svgAddDefs: function(svg) {
		svg.append("defs").selectAll("marker")
			.enter().append("marker")
				.attr("id", function(d) { return d; })
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 25)
				.attr("refY", 0)
				.attr("markerWidth", 6)
				.attr("markerHeight", 6)
				.attr("orient", "auto")
				.append("path")
				.attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
				.style("stroke", "#4679BD")
				.style("opacity", "0.6");
	},
	runJSONFuncs: function(o, args) {
		for (var i in o) {
			if (o[i] !== null && typeof(o[i]) == "object") this.runJSONFuncs(o[i], args);
			if (typeof o[i] == "function") o[i] = o[i](args);
		};
	},
	applyEventToElement: function(id, event, func) {
		try {
			document.getElementById(id)[event] = null;
			document.getElementById(id)[event] = func;	
		} catch (exception) {
			console.log("Cannot bind: " + func.name + " to: " + id + "." + event);
		}
		
	},
	applyEventToElements: function(arr) {
		var that = this;
		arr.forEach(function(d) {
			that.applyEventToElement(d.id, d.event, d.func);
		});
	},
	lineFunction: d3.svg.line()
	.x(function(d) { return d.x; })
	.y(function(d) { return d.y; }),
	makeDynamicScale: function(data, attr, scaleType, range) {
		var fullDomain = [];
		var rangeCalc;
		if (attr == "") {
			rangeCalc = d3.extent(data);
		} else {
		rangeCalc = d3.extent(data, function(d) {
				return d[attr]
			});	
		}
		var tempScale = d3.scale.linear()
			.domain([1, range.length])
			.range(rangeCalc);
		for (var i = 1; i <= range.length; i++) {
			fullDomain.push(tempScale(i));
		}
		return d3.scale[scaleType]()
			.domain(fullDomain)
			.range(range);
	}
}

//Browser fixes
//Fix page layout for IE
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
	var msViewportStyle = document.createElement('style');
	msViewportStyle.appendChild(
		document.createTextNode(
			'@-ms-viewport{width:auto!important}'
		)
	);
	document.getElementsByTagName('head')[0].appendChild(msViewportStyle);
}

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

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
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

// Some older browsers error out because console is not a variable...Seriosuly. I wrote this in February...far from the first of April.
if (!window.console) {
	console = {};
	console.log = function() {};
}

String.prototype.replaceAll = function(find, replace) {
	return this.replace(new RegExp(find, 'g'), replace);
};



/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
	Object.defineProperty(Object.prototype, "watch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop, handler) {
			var
			  oldval = this[prop]
			, newval = oldval
			, getter = function () {
				return newval;
			}
			, setter = function (val) {
				oldval = newval;
				return newval = handler.call(this, prop, oldval, val);
			}
			;
			
			if (delete this[prop]) { // can't watch constants
				Object.defineProperty(this, prop, {
					  get: getter
					, set: setter
					, enumerable: true
					, configurable: true
				});
			}
		}
	});
}

// object.unwatch
if (!Object.prototype.unwatch) {
	Object.defineProperty(Object.prototype, "unwatch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop) {
			var val = this[prop];
			delete this[prop]; // remove accessors
			this[prop] = val;
		}
	});
}

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};

d3.selection.prototype.selectAllToleranceFiltered = function(invert) {
	return this.filter(function() {
		var isFiltered = d3.select(this).property("filtered");
		if (invert) {
			return !isFiltered;
		}
		return isFiltered;
	});
};

d3.selection.prototype.applyToleranceFilter = function() {
	return this.each(function() {
		var curr = d3.select(this);
		curr.property("filtered", true);
		return curr.classed("filtered", true).style("display", "none");
	});
};

d3.selection.prototype.removeToleranceFilter = function() {
	return this.each(function() {
		var curr = d3.select(this);		
		curr.property("filtered", false);
		return curr.classed("filtered", false).style("display", "block");
	});
};

d3.selection.prototype.mergeSelections = function(sel) {
	var merged = this;
	sel.each(function() {
		merged[0].push(d3.select(this).node());
	});
	return merged;
};




// d3.layout.force.physicsOn = false;
// d3.layout.force.start = (function() {
// 	var cached_forceStart = d3.layout.force.start;
// 	return function() {
// 		return cached_forceStart.apply(this, arguments);
// 	};
// }());
// d3.layout.force.stop = (function() {
// 	var cached_forceStart = d3.layout.force.stop;
// 	return function() {
// 		return cached_forceStart.apply(this, arguments);
// 	};
// }());
