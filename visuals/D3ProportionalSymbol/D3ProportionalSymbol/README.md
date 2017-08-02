# Expected Data Format

### Description
* The visualization aggregates records into groups and displays representative nodes for the group.
* **Hint:** d3.nest() is very useful to easily obtain this format. 
### Data Format 
```javascript
{
	"name": [{ //Unique grouping attribute. States, cities, etc
		"0": {
			"key": "[string, number]", //Value of unique location
			"values": {
				"aggVal": "[number]", // Any numerical values representing a sum/avg/etc of the aggregated values
				children: "[object]" // Contains each raw data object that contribute to the aggregation
			}
		}
	}]
}


```

### Config Format
```javascript
{
	"styleEncoding": {
		"size": {
			"attr": "key",
			"range": ["[number]"]
		},
		"color": {
			"attr": "",
			"range": ["[string]"] //optional. Must be a minimum of two values. Will use the attr color.attr property to fill in bars on the defined scale. 
		}
	},
	"identifier": {
		"attr": "id" //Unique identifier
	},
	popup: {
		content: {
			"attr": {
				prettyLabel: "key",
				format: "[string, currency, etc]"
			}
		}
	}
}

```

