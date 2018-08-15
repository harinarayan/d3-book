# ChangesAndEffects
It is a javascript module to render changes, alerts and alert severities in a composite chart
  - Type some Markdown on the left
  - See HTML in the right
  - Magic

# Dependencies
  - d3.js (Version 5.4)
  - Moment.js for timezone manipulation

# Usage
## html
```
<div id="changesAndEffects">
</div>
```
## script
```
<script type="text/javascript" src="../d3/d3.min.js"></script>
<script type="text/javascript" src="../moment/moment.min.js"></script>
<script type="text/javascript" src="../moment/moment-timezone-with-data.min.js"></script>
<script type="text/javascript" src="./ChangesAndEffects.js"></script>
<script type="text/javascript">
    //1. Create object once, using the preferred options.
    var cae = new ChangesAndEffects({
        container_selector: "#changesAndEffects", //css selector of the container div
        height: 500, //min 300
        width: 1000, //min 400
        change_url_formatter: function(ticket_id){
            return "https://www.servicenow.com/" + ticket_id;
        },
        series_keys: ["ModuleA", "ModuleB", "ModuleC", "ModuleD"], //Only these will be considered from the dataset's count object.
    });
    
    var dataset = <fetch it from backend and format it as below>;
    
    //2. Render the chart for the first time
    cae.render(dataset);
    
    dataset = <fetch the updated dataset from the backend>
    //3. To refresh the chart with updated dataset, reuse the same object.
    cae.render(dataset);
</script>
```
## dataset
An array of objects like below
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

