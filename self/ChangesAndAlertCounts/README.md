# ChangesAndAlertCounts
It is a javascript module to render changes to site, alerts counts and alert severities against time dimension in a composite chart.

Features:
 - Automatically adapts and adjusts according to data
 - Customizable dimension
 - Tooltips
 - Opens ticket page using hyperlink

For a demo open `demo.html` on a browser.

# Usage
## html
```
<div id="changesAndAlertCounts">
</div>
```
## script
### inclusions
```
<script type="text/javascript" src="../d3/d3.min.js"></script>
<script type="text/javascript" src="../moment/moment.min.js"></script>
<script type="text/javascript" src="../moment/moment-timezone-with-data.min.js"></script>
<script type="text/javascript" src="./ChangesAndAlertCounts.js"></script>
```
### initialization
Create object once, using the preferred options.
```
var caac = new ChangesAndAlertCounts({
    container_selector: "#changesAndAlertCounts", //css selector of the container div
    height: 500, //min 300
    width: 1000, //min 400
    change_url_formatter: function(ticket_id){
        return "https://www.servicenow.com/" + ticket_id;
    },
    series_keys: ["ModuleA", "ModuleB", "ModuleC", "ModuleD"], //Only these will be considered from the dataset's count object.
});
```
### first time rendering
```    
var dataset = fetch_data_and_format();
caac.render(dataset);
```
### subsequest rendering upon data refresh
Resuse the same object. Just call render() with new dataset.
``` 
setInterval(refreshChart, 60000); //refresh the chart every minute
function refreshChart(){
    dataset = fetch_data_and_format();
    caac.render(dataset);
}    
```
## dataset
An array of objects like below. Each object representing all that happened in a timeslot `time`.
```
var dataset = [
    {
        "time":1533083400, 
        "severity": {
            "worst":"2", // Worst severity in this timeslot. "0"-None, "1"-Low, "2"-Medium, "3"-High
            "details":{  // List of components contributing to each of the severities in this timeslot
                "1":["Comp1"],
                "2":["Comp2", "Comp8"]
            }
        },
        "counts": { // Alert counts for each module in this timeslot. All keys in the series_keys config list needs to be present. Set count to 0 if there are no alerts.
            ModuleA: 1,
            ModuleB: 0,
            ModuleC: 15,
            ModuleD: 13
        }, 
        "changes":["CHG1234", "CHG2345"] // Changes that happened in this timeslot.
    },
    ...,
    ...,
];    
```

# Dependencies
  - d3.js (Version 5.4)
  - Moment.js for timezone manipulation


