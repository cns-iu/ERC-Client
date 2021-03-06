configs.prosym01 = {
 nodes: {
  styleEncoding: {
    size: {
      attr: "",//takes attribute as degree from spatial sankey
      range: [2,10],
      scaleType: "linear"
    }
  }
},

edges: {
  styleEncoding: {
    size: {
      attr: "weight",
      range: [.5, 2]
    }
  }
},
    identifier: "id", //Unique identifier
    lat: "lat",
    lng: "lng",
    categories: ["cutZip"]
  }
  dataprep.prosym01 = function(ntwrk) {
    geo = 0;
    notgeo = 0;
    prosym01.isPopupShowing = false;
    ntwrk.map={}
    prosym01.notgeocoded = [];


    if (ntwrk.DataService.mapDatasource[ntwrk.attrs.ngDataField].toProcess) {
      var processedData = processAuthorSpec(ntwrk.filteredData);
      ntwrk.filteredData.nodes = processedData.nodes;
      ntwrk.filteredData.edges = processedData.edges;
    }

    ntwrk.filteredData.nodes.data.forEach(function(d, i) {
      d.cutZip = d.zip.toString().slice(0, 4);
    });


    ntwrk.PrimaryDataAttr = "nodes";
    ntwrk.filteredData.authors.data.forEach(function(d,i){



      if((d.lat!=null)
        && (d.lng!=null))
      {
        geo++;
        d.type="Feature";
        d.id = i;
        d.properties = {};
        d.geometry = {};
        d.properties.LAT = d.lat;
        d.properties.LON = d.lng;

        d.geometry.type="Point";
        d.geometry.coordinates=[]
        d.geometry.coordinates[0] =  d.lng;
        d.geometry.coordinates[1] =  d.lat;

      }
      else
      {
        notgeo++;

        d.type="Feature";
        d.id = i;
        d.properties = {};
        d.geometry = {};
        d.properties.LAT = 0;
        d.properties.LON = 0;

        d.geometry.type="Point";
        d.geometry.coordinates=[]
        d.geometry.coordinates[0] =  0;
        d.geometry.coordinates[1] =  0;

        prosym01.notgeocoded[notgeo] = d;


      }

      ntwrk.map[d.idd] = d.author;



    })



  ntwrk.maxPapers =1;
  ntwrk.minPapers = 1;
  ntwrk.filteredData.authors.data.forEach(function(d1,i1){// $("#zip-name").text(d.key + "_");
    tableData = [];
    ntwrk.filteredData.records.data.forEach(function(d2, i2) {

      d2.author_ids.forEach(function(idd){
        if (idd == d1.idd ) {
          var authNames = [];
          d2.author_ids.forEach(function(d3, i3) {
            authNames.push(ntwrk.filteredData.authors.data.find(function(d4, i4) {
              return d4.idd == d3;
            }).author)
          })
          if(d2.url!=null){
            tableData.push({
              authors: authNames.join("; "),
              year: d2.year,
              title: d2.title,
              journal: d2.journal,
              url: d2.url,
              class:"enabled"
            })
          }
          else{
            tableData.push({
              authors: authNames.join("; "),
              year: d2.year,
              title: d2.title,
              journal: d2.journal,
              url: "#",
              class:"disabled"
            })
          }

        }
      })
    })


    d1.tableD = tableData;
    if (d1.tableD.length > ntwrk.maxPapers)
      ntwrk.maxPapers = d1.tableD.length;
    if(d1.tableD.length < ntwrk.minPapers)
      ntwrk.minPapers = d1.tableD.length;

  })


  document.getElementById("geocoded").innerHTML = geo;
  document.getElementById("notgeocoded").innerHTML = notgeo;
  ntwrk.filteredData.arcs = [];
     //i=0;
     ntwrk.filteredData.edges.data.forEach(function(d){


      if((ntwrk.filteredData.authors.data[d.source].latitude!=null)
        && (ntwrk.filteredData.authors.data[d.source].longitude!=null)
        && (ntwrk.filteredData.authors.data[d.target].latitude!=null)
        &&  (ntwrk.filteredData.authors.data[d.target].longitude!=null))
      {
        d.flow = 1;
      }
      else d.flow = 1;

    })

 // Set leaflet map
 prosym01.map = new L.map('map', {
  center: new L.LatLng(50,15),
  zoom: 4,
  layers: [
  L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    noWrap:true,
    minZoom: 4,
    maxZoom: 20,
    ext: 'png'
  })
  ]
});
 // Setup spatialsankey object
 prosym01.spatialsankey = d3.spatialsankey()
 .lmap(prosym01.map)
 .nodes(prosym01.filteredData.authors.data)
 .links(prosym01.filteredData.edges.data);

 setTimeout(populateNotGeocoded(), 500);
    function populateNotGeocoded(){
          var ul = document.createElement('ul');

      for(x=1;x<prosym01.notgeocoded.length;x++){
         li = document.createElement('li');
         content = document.createTextNode(prosym01.notgeocoded[x].author);
         li.appendChild(content);
         ul.appendChild(li);
      }

      $("#authorDetails").append(ul);
}


}
events.prosym01 = function(ntwrk) {
  setTimeout(function() {
    configureDOMElements();
  }, 500);
  function configureDOMElements(){

   nodeSize.setTitle("Node Degree")
   nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
   nodeSize.updateTextFromFunc("geomap");
   nodeSize.updateNodeSize(configs.prosym01.nodes.styleEncoding.size.range,ntwrk.zoom.scale(),"geomap");
   d3.select("#map").select("svg").on("mousewheel", function() {
    setTimeout(function() {
      nodeSize.setTitle("Node Degree")
      // nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
      nodeSize.updateTextFromFunc("geomap");
      nodeSize.updateNodeSize(configs.prosym01.nodes.styleEncoding.size.range,ntwrk.zoom.scale(),"geomap");

    }, 10);
  });
 }


}
