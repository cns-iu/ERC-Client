var meta = {
	"mainVis": { 
		"type": 						"org.cishell.json.vis.metadata",
		"nodes": {
			"styleEncoding": {
				"size": {
					"attr": 			"inrt",
					"range": 			[4, 25]
				},
				"color": {
					"attr": 			"inrp",
					"range": 			["#F6DFA4", "#8DC63F"]
				}
			},
			"identifier": {
				"attr": 				"id"
			},
			"prettyMap": {
				"id": "id",
				"label": "Node label",
				"ctsa": "CTSA account",
				"asstc": "Number of Tweets mentioning the user",
				"assmentions": "Count of instances when the user is mentioned by other",
				"usertc": "Number of Tweets made by the user",
				"userwoi": "Count of user's Tweets without interactions (mentiones)",
				"userwi": "Count of user's Tweets with interactions (mentiones)",
				"totmentcount": "Total number of mentions made by the user",
				"unqusermentcount": "Count of unique users mentioned by the user",
				"mentpertweet": "Average count of user's mentioned per tweet",
				"mentperuuser": "Average count of user's interactions per unique user",
				"conversation1": "Conversation index score 1",
				"conversation2": "Conversation index score 2",
				"countrp": "Count of user's Replies",
				"countrt": "Count of user's Retweets",
				"countrtrp": "Count of user's Retweet replies",
				"countta": "Count of user's direct mentiones",
				"rt2taratio": "Retweet to directed Tweets ratio",
				"tothtcount": "Count of Hash tags",
				"htpertwt": "Average Hash tag per Tweet",
				"avgfriend": "Average Friend Count",
				"avgfollow": "Average Follower Count"
			}
		},
		"edges": {
			"filterAttr": 				"cooc",
			"styleEncoding": {
				"strokeWidth": {
					"attr": 			"dirrtw",
					"range": 			[1, 6.5, 12]
				},
				"opacity": {
					"attr": 			"dirtaw",
					"range": 			[0.125, .4375, .75]
				},
				"color": {
					"attr": 			"countrp",
					"range": 			["orange", "blue"]
				}
			},
			"identifier": {
				"attr": 				"id",
			},
			"prettyMap": {
				"source": "Source Node",
				"target": "Target Node",
				"slabel": "Source Node Label",
				"tlabel": "Target Node Label",
				"rpw": "Replies",
				"rtw": "Retweet",
				"rtrpw": "Retweet Replies",
				"taw": "Directed Mentions",
				"dirw": "Directed",
				"dirw_frac": "Fractional Mentions",
				"coocw": "Co-Occurrence",
				"cooc": "Co-Occurrence Edge",
				"sl": "Self Loop",
				"slw": "Self Loop Weight"
			}			
		},
		"labels": {
			"styleEncoding": {
				"attr":					"label",
				"range": 				[12, 30],
				"displayTolerance": 	.25
			},
			"identifier": {
				"attr": 				"id"
			}
		},
		"visualization": {
			"forceLayout": {
				"linkStrength": 		null,
				"friction": 			.9,
				"linkDistance": 		12,
				"charge": 				function(args) {return -20 / Math.sqrt(args[0].length / (args[1].dims.fixedWidth * args[1].dims.fixedHeight)); },
				// "chargeDistance": 		function(args) {return 1 * Math.sqrt(args[0].length * 100 / (args[1].dims.width * args[1].dims.height)); },
				"gravity": 				1,
				"theta": 				null,
				"alpha": 				-100
			}
		}
	},
	"barVis2": { 
		"type": 						"org.cishell.json.vis.metadata",
		//This is "nodes" instead of "records" because the parent is a network.
		"nodes": {
			"styleEncoding": {
				"size": {
					"attr": 			"usertc"
				},
				"size2": {
					"attr": 			30
				},
				"color": {
					"attr": 			"outrtrp",
					"range": 			["#8DC63F", "#F6DFA4"]
				}
			},
			"identifier": {
				"attr": 				"id"
			}
		},
		"labels": {
			"styleEncoding": {
				"attr":					"label",
				"displayTolerance": 	0
			},
			"identifier": {
				"attr": 				"id"
			}
		}
	}
}
