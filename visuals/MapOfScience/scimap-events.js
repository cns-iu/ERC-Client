var tip;
events.scimap = function(ntwrk) {
	tip = d3.tip()
	.attr("class", "d3-tip")
	.offset([0, 0])
	.html(function(d) {
		var str = "";
		Object.keys(d.popup).forEach(function(d1, i1) {
			str += "<strong>" + d1 + ":</strong> <span style='color:red'>" + d.popup[d1] + "</span></br>"
		})
		return str;
	})
	ntwrk.SVG.call(tip);



	ntwrk.SVG.underlyingLabels
		.attr("fill", function(d, i) {
			var disc = underlyingScimapData.disciplines.filter(function(d1, i1) {
				if (d.disc_id == d1.disc_id) {
					return d1;
				}
			})
			return disc[0].color;
		})

	ntwrk.SVG.underlyingNodes.on("click", function(d, i) {
		var text = "";
		var discipline = underlyingScimapData.disciplines.filter(function(d1, i1) {
			return (d1.disc_id == d.disc_id)
		})[0];
		text += "<h1>" + discipline.disc_name + "</h1></br>"
		text += "<h3>" + d.subd_name + "</h3></br>"
		text += "<p >" + d.size + "</p>";
		d.popupText = text;
		d.popup = {};
		d.popup.Discipline = discipline.disc_name;
		d.popup.Subdiscipline = d.subd_name;
		d.popup.Size = d.size
		tip.hide(d);
		tip.show(d);
	}).on("mouseover", function(d, i) {
		ntwrk.SVG.underlyingEdges.filter(".subd_id1" + d.subd_id).mergeSelections(ntwrk.SVG.underlyingEdges.filter(".subd_id2" + d.subd_id)).attr("stroke", "red").moveToFront();
	}).on("mouseout", function(d, i) {
		ntwrk.SVG.underlyingEdges.attr("stroke", "lightgrey")
	});

	ntwrk.SVG.underlyingLabels
		.on("mouseover", function(d, i) {
			ntwrk.SVG.underlyingNodes.attr("opacity", .25);
			ntwrk.SVG.underlyingNodes.filter(".disc_id" + d.disc_id).attr("opacity", 1).moveToFront();
			// ntwrk.SVG.underlyingEdges.filter(".disc_id_s" + d.disc_id).filter(".disc_id_t" + d.disc_id).attr("stroke", "black").moveToFront();
			// ntwrk.SVG.underlyingEdges.filter(".disc_id_s" + d.disc_id).mergeSelections(ntwrk.SVG.underlyingEdges.filter(".disc_id_t" + d.disc_id)).attr("stroke", "black").moveToFront();
			ntwrk.SVG.underlyingNodes.moveToFront();
			ntwrk.SVG.underlyingLabels.moveToFront();

		})
		.on("mouseout", function(d, i) {
			ntwrk.SVG.underlyingNodes.attr("opacity", 1);
			// ntwrk.SVG.underlyingEdges.attr("stroke", "lightgrey")
		})


		ntwrk.SVG.background.on("click", function() {
			console.log("eh")
			tip.hide();
		})
}