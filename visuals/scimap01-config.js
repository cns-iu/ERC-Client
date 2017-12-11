configs.scimap01 = {
    visualization: {
        disc_id: "disc_id",
        subd_id: "subd_id",

    },
    records: {
        styleEncoding: {
            size: {
                attr: "values",
                range: [4, 20],
                scaleType: "linear"
            }
        }
    },
};


events.scimap01 = function(ntwrk) {
    ntwrk.isPopupShowing = false;

    ntwrk.Scales.rScale = d3.scale[configs.scimap01.records.styleEncoding.size.scaleType]()
        .domain(d3.extent(ntwrk.nestedData.sub_disc, function(d, i) {
            return d.values.children.length
        }))
        .range(configs.scimap01.records.styleEncoding.size.range)
    scimap01.maxValue = 1;
    scimap01.minValue = 1;

    ntwrk.nestedData.sub_disc.forEach(function(d, i) {
        var currNodeG = ntwrk.SVG.underlyingNodeG.filter(".subd_id" + d.key);
        var currNode = currNodeG.selectAll("circle").attr("r", ntwrk.Scales.rScale(d.values.children.length));
     if(scimap01.maxValue < d.values.children.length)
            scimap01.maxValue = d.values.children.length;
      if(scimap01.minValue > d.values.children.length)
            scimap01.minValue = d.values.children.length;
    })

    setTimeout(function() {
        configureDOMElements();
    }, 500)


    ntwrk.nodeClickEvent = function(d, i) {
        var tableData = [];
        var match = ntwrk.nestedData.sub_disc.find(function(d1, i1) {
            return d.subd_id == d1.key
        });
        match.values.children.forEach(function(d1, i1) {
            var matches = tableData.filter(function(d2, i2) {
                return d1.journal == d2.journal && d1.title == d2.title
            })
            if (matches.length == 0) {
                if (d1.url!= null){
                tableData.push({
                    authors: d1.author_list,
                    year: d1.year,
                    title: d1.title,
                    url: d1.url,
                    journal: d1.journal,
                    class:"enabled"
                })
             }
                else{
                tableData.push({
                    authors: d1.author_list,
                    year: d1.year,
                    title: d1.title,
                    url: "#",
                    journal: d1.journal,
                    class:"disabled"
                })
             }
            }
        })
        $("#disc-name").text(d.disc_name);
        $("#subd-name").text(d.subd_name);

        //in Injectors.js. Makes it easier to do this across visualizations.
        showPopup(tableData);
        ntwrk.isPopupShowing = true;


    }


    ntwrk.SVG.underlyingNodeG.on("click", ntwrk.nodeClickEvent);

    function configureDOMElements() {
        nodeSize.setTitle("#Papers")
        nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
        nodeSize.updateNodeSize(configs.scimap01.records.styleEncoding.size.range,ntwrk.zoom.scale(),"scimap");
        nodeSize.updateTextFromFunc("scimap");

        ntwrk.SVG.on("mousewheel", function() {
            setTimeout(function() {
                nodeSize.updateTextFromFunc("scimap");
                nodeSize.updateNodeSize(configs.scimap01.records.styleEncoding.size.range,ntwrk.zoom.scale(),"scimap");
                nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")

            }, 10);
        });
    }

    ntwrk.SVG.background.on("click", function() {
        $(".popup").css({ display: "none" })
        $(".legend").addClass("default");
        ntwrk.isPopupShowing = false;
    })

};



scimap01.Update = function() {
    dataprep.scimap01(scimap01);
    events.scimap01(scimap01);
}


dataprep.scimap01 = function(ntwrk) {
    var mappingJournal = journalMapping;
    var foundCount = 0;
    var notFoundCount = 0;
    var newData = [];
    ntwrk.filteredData.records.data.forEach(function(d, i) {
        var match = [];
        var counter_463 = 0;
        if (d.journal) {
            match = mappingJournal.records.data.filter(function(d1, i1) {
                if(d1.subd_id == 463)
                    {

                      if(d1.formal_name.toLowerCase() == d.journal.toLowerCase())
                        counter_463++;
                  }
                return d1.formal_name.toLowerCase() == d.journal.toLowerCase()
            })
        }
        console.log("counter_463 = ",counter_463);
        match.forEach(function(d1, i1) {
            var authors = [];
            d.author_ids.forEach(function(d2, i2) {
                authors.push(ntwrk.filteredData.authors.data.find(function(d4, i4) {
                    return d4.id == d2;
                }).author)
            })
            var newDataObj = new Object(d);
            newDataObj.subd_id = d1.subd_id;
            newDataObj.author_list = authors.join("; ");
            newDataObj.url = d1.url;
            newData.push(newDataObj);
        })
        if (match.length > 0) {
            foundCount++;
        } else {
            notFoundCount++;
        }
    })
    ntwrk.filteredData.records.data = newData;

    setTimeout(function(){   ntwrk.filteredData.records.data.forEach(function(d, i) {
        d.tableData = [];
        var match = ntwrk.nestedData.sub_disc.find(function(d1, i1) {
          return d.subd_id == d1.key
        });
        match.values.children.forEach(function(d1, i1) {
          var matches = d.tableData.filter(function(d2, i2) {
            return d1.journal == d2.journal && d1.title == d2.title
          })
          if (matches.length == 0) {
            if (d1.url!= null){
              d.tableData.push({
                authors: d1.author_list,
                year: d1.year,
                title: d1.title,
                url: d1.url,
                journal: d1.journal,
                class:"enabled"
              })
            }
            else{
              d.tableData.push({
                authors: d1.author_list,
                year: d1.year,
                title: d1.title,
                url: "#",
                journal: d1.journal,
                class:"disabled"
              })
            }
          }
        })

      }); }, 3000);

};
