// BetterInnerHTML v1.2, (C) OptimalWorks.net
function BetterInnerHTML(o, p, q) {
	function r(a) {
		var b;
		if (typeof DOMParser != "undefined") b = (new DOMParser()).parseFromString(a, "application/xml");
		else {
			var c = ["MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"];
			for (var i = 0; i < c.length && !b; i++) {
				try {
					b = new ActiveXObject(c[i]);
					b.loadXML(a)
				} catch (e) {}
			}
		}
		return b
	}

	function s(a, b, c) {
		a[b] = function() {
			return eval(c)
		}
	}

	function t(b, c, d) {
		if (typeof d == "undefined") d = 1;
		if (d > 1) {
			if (c.nodeType == 1) {
				var e = document.createElement(c.nodeName);
				var f = {};
				for (var a = 0, g = c.attributes.length; a < g; a++) {
					var h = c.attributes[a].name,
						k = c.attributes[a].value,
						l = (h.substr(0, 2) == "on");
					if (l) f[h] = k;
					else {
						switch (h) {
							case "class":
								e.className = k;
								break;
							case "for":
								e.htmlFor = k;
								break;
							default:
								e.setAttribute(h, k)
						}
					}
				}
				b = b.appendChild(e);
				for (l in f) s(b, l, f[l])
			} else if (c.nodeType == 3) {
				var m = (c.nodeValue ? c.nodeValue : "");
				var n = m.replace(/^\s*|\s*$/g, "");
				if (n.length < 7 || (n.indexOf("<!--") != 0 && n.indexOf("-->") != (n.length - 3))) b.appendChild(document.createTextNode(m))
			}
		}
		for (var i = 0, j = c.childNodes.length; i < j; i++) t(b, c.childNodes[i], d + 1)
	}
	p = "<root>" + p + "</root>";
	var u = r(p);
	if (o && u) {
		if (q != false)
			while (o.lastChild) o.removeChild(o.lastChild);
		t(o, u.documentElement)
	}
}

var legendItems = {data:'asdf'};
if (data) {
	if (data.nodes) {
		if (data.nodes.data) {
			legendItems.data = data.nodes.data;			
		}
	}
}


legendItems.sizedBy = {
	domElems: function() {
		return {
			"min": document.getElementById("sizedBy.min"),
			"mid": document.getElementById("sizedBy.mid"),
			"max": document.getElementById("sizedBy.max")
		}
	},
	setMin: function(min) {
		BetterInnerHTML(this.domElems().min,
			container.formatValue[meta.sizeCodingDisplayFormat](nodeScale.domain()[0]) || min)
	},
	setMid: function(mid) {
		BetterInnerHTML(this.domElems().mid,
			container.formatValue[meta.sizeCodingDisplayFormat](Math.floor(nodeScale.domain()[1] * 0.5)) || mid)
	},
	setMax: function(max) {
		BetterInnerHTML(this.domElems().max,
			container.formatValue[meta.sizeCodingDisplayFormat](Math.floor(nodeScale.domain()[1])) || max)
	},
	setAll: function(arr) {
		this.setMin();
		this.setMid();
		this.setMax();
	}
}
legendItems.sortedBy = {
	domElems: function() {
		return {
			"value": document.getElementById("sortedBy.value")
		}
	},
	setAll: function(val) {
		BetterInnerHTML(this.domElems().value, meta.sortByTitle || val);
	}
}
legendItems.weightedBy = {
	minItemHeight: 21,
	midItemHeight: 69,
	domElems: function() {
		return {
			"min": document.getElementById("weightedBy.min"),
			"mid": document.getElementById("weightedBy.mid")
		}
	},
	min: function(val) {
		return d3.min(legendItems.data, function(d) {
			return +d[meta.sizeCoding[0]]
		});
	},
	mid: function(val) {
		return d3.mean(legendItems.data, (function(d) {
				return +d[meta.sizeCoding[0]]
		}))
	},
	setMin: function(min) {
		// -.- newMin!
		var newMin;
		if (min) {
			newMin = min
		} else {
			newMin = this.min()
		}
		BetterInnerHTML(this.domElems().min,
			container.formatValue[meta.sizeCodingDisplayFormat](newMin))
	},
	setMid: function(mid) {
		var newMid;
		if (mid) {
			newMid = mid
		} else {
			newMid = this.mid()
		}
		BetterInnerHTML(this.domElems().mid,
			container.formatValue[meta.sizeCodingDisplayFormat](newMid))
	},
	setAll: function(arr) {
		if (arr) {
			this.setMin(arr[0]);
			this.setMid(arr[1]);
		} else {
			this.setMin();
			this.setMid();
		}
	}
}
