/** @global 
  * @description Maps pretty names for datasource URLs. Mapped from (ng-data-field) 
  * @type {Object} */
var globalDatasourceMap = {
    one: {
        url: 'data/sampleData.json'
    },
    adam: {
         url: 'data/withroles.json',
         toProcess:true
    },
    nanohubLocal: {
        url: 'data/nanohub_jos_citations-min_journalFrequency.cishelltable.json',
        toProcess:true
    },
    gagan: {
        url: 'data/ERC-CNS-PubData.json',
        toProcess:true
    },
    proSymPrelim: {
        url: '../erc/data/erc-geo-agg-sample-payload.cishelltable.json'
    },
    scimapPrelim: {
        url: '../erc/data/nanohub_jos_citations-min_journalFrequency.cishelltable.json'
    },
    sampleGeoData: {
        url: 'data/sampleGeoData.json'
    },
    newt: {
    	url: 'data/newt-coauthor.json'
    },
    assist: {
    	url: 'data/assist-coauthor.json'
    },
    nanohub: {
        url: 'https://dev.nanohub.org/citations/curate/download/',
        params: {
            hash: 'QUERYSTRING'
        },
        toProcess: true
    },
    iufinal: {
        // url: 'data/katy/iu-finalformat.json',
        url: 'data/katy/iu-finalformat - USONLY.json',
        toProcess: true
    },
    report: {
        url: function() {
            if (location.search == "?assist2014") {
                return 'data/report/assist-2014+2015.json'
            }
            if (location.search == "?assist2016") {
                return 'data/report/assist-2016+2017.json'
            }
            if (location.search == "?newt2015") {
                return 'data/report/newt-2015+2016.json'
            }
            if (location.search == "?newt2016") {
                return 'data/report/newt-2016+2017.json'
            }
            if (location.search == "?tanms2014") {
                return 'data/report/tanms-2014+2015.json'
            }
            if (location.search == "?tanms2016") {
                return 'data/report/tanms-2016+2017.json'
            }
        }(),
        toProcess: true
    }
}

//TODO: REMOVE THIS. FOR REPORT ONLY


