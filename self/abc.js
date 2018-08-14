
var ChangesAndEffects = function(config){
	this.container_selector = config.container_selector || "div.changes-and-effects";
	this.height = +config.height || 500;
	this.width = +config.width || 1000;
	this.margin_x = 50;
	this.margin_y = 50;
	this.dataset = [
		{ "from":1533081600, "severity": "0", "counts": {A: 0, B: 10, C: 15, D: 10}, "changes":["CHG1234", "CHG2345"] },
		{ "from":1533082500, "severity": "1", "counts": {A: 0, B: 10, C: 15, D: 9}, "changes":[] },
		{ "from":1533083400, "severity": "2", "counts": {A: 1, B: 10, C: 15, D: 13}, "changes":[] },
		{ "from":1533084300, "severity": "3", "counts": {A: 2, B: 10, C: 15, D: 8}, "changes":[] },
		{ "from":1533085200, "severity": "1", "counts": {A: 0, B: 10, C: 15, D: 8}, "changes":["CHG3456", "CHG4567", "CHG7890"] },
		{ "from":1533086100, "severity": "1", "counts": {A: 4, B: 10, C: 15, D: 8}, "changes":["CHG1234"] },
		{ "from":1533087000, "severity": "1", "counts": {A: 1, B: 10, C: 15, D: 8}, "changes":["CHG1234"] },
		{ "from":1533087900, "severity": "0", "counts": {A: 1, B: 10, C: 15, D: 8}, "changes":["CHG1234"] },
		{ "from":1533088800, "severity": "0", "counts": {A: 3, B: 15, C: 15, D: 8}, "changes":["CHG1234", "CHG2345"] },
		{ "from":1533089700, "severity": "1", "counts": {A: 0, B: 12, C: 15, D: 8}, "changes":["CHG1234", "CHG2345"] },
		{ "from":1533090600, "severity": "2", "counts": {A: 0, B: 15, C: 15, D: 8}, "changes":["CHG1234"] },
		{ "from":1533091500, "severity": "1", "counts": {A: 0, B: 12, C: 15, D: 8}, "changes":["CHG1234", "CHG2345"] },
		{ "from":1533092400, "severity": "0", "counts": {A: 0, B: 14, C: 15, D: 8}, "changes":[] },
		{ "from":1533093300, "severity": "0", "counts": {A: 0, B: 12, C: 15, D: 8}, "changes":[] },
		{ "from":1533094200, "severity": "0", "counts": {A: 0, B: 6, C: 19, D: 8}, "changes":[] },
		{ "from":1533095100, "severity": "0", "counts": {A: 0, B: 10, C: 23, D: 8}, "changes":[] },
		{ "from":1533096000, "severity": "3", "counts": {A: 0, B: 10, C: 17, D: 8}, "changes":["CHG1234"] },
		{ "from":1533096900, "severity": "2", "counts": {A: 0, B: 10, C: 11, D: 8}, "changes":["CHG1234", "CHG2345"] },
		{ "from":1533097800, "severity": "1", "counts": {A: 0, B: 10, C: 15, D: 8}, "changes":["CHG1234"] },
		{ "from":1533098700, "severity": "0", "counts": {A: 0, B: 10, C: 15, D: 8}, "changes":[] },
	]
	
	this.init();
}

ChangesAndEffects.prototype.init = function(){
	var self = this;
	self.svg = d3.select(self.container_selector)
		.append("svg")
		.attr("height", self.height)
		.attr("width", self.width)
		.style("border", "1px solid red")
		;

	self.h = self.height - (2*self.margin_x);
	self.w = self.width - (2*self.margin_y);
	self.plotarea = self.svg.append("g")
		.classed("plotarea", true)
		.attr("height", self.h)
		.attr("width", self.w)
		.attr("transform", "translate(" + self.margin_x + ", " + self.margin_y + ")");

	self.colorGen = d3.scaleOrdinal(
	[
	  "#8dd3c7",
	  "#D2B48C",
	  "#bebada",
	  "#fb8072",
	  "#80b1d3",
	  "#fdb462",
	  "#b3de69",
	  "#fccde5",
	  "#d9d9d9",
	  "#bc80bd",
	  "#ccebc5",
	  "#ffed6f"
	]);
	self.severityColorGen = d3.scaleOrdinal(["green", "gold", "orange", "red"]);
}

ChangesAndEffects.prototype.generate_series = function(){
	var self = this;
	var list_of_counts = self.dataset.map(function(d){
		return Object.assign({from: d.from}, d.counts);
	});
	var stack = d3.stack()
		.keys(["A", "B", "C", "D"])
		.order(d3.stackOrderDescending);
	return stack(list_of_counts);
}

ChangesAndEffects.prototype.render = function(){
	var self = this;
	var series = self.generate_series();
	console.log(series);

	var min_y = d3.min(series, function(d){
		return d3.min(d, function(e){
			return e[0];
		})
	});

	var max_y = d3.max(series, function(d){
		return d3.max(d, function(e){
			return e[1];
		})
	});

	var min_x = d3.min(self.dataset, function(d){
		return d.from;
	});

	var max_x = d3.max(self.dataset, function(d){
		return d.from;
	});

	//console.log(min_x + ", " + max_x + ", " + min_y + ", " + max_y);

	var domain_x = self.dataset.map(function(d) { return d.from; });
	console.log(domain_x);
	self.xScale = d3.scaleBand().domain(domain_x).range([0, self.w]).padding(0.05);
	self.yScale = d3.scaleLinear().domain([min_y, max_y]).range([self.h, 0]);

	var groups = self.plotarea.selectAll("g")
		.data(series, function(d){
			return d.key;
		})
		.enter()
		.append("g")
		.style("fill", function(i, d){
			return self.colorGen(i);
		})
		;

	var rects = groups.selectAll("rect")
		.data(function(d){
			return d;
		})
		.enter()
		.append("rect")
		.attr("x", function(d, i){
			return self.xScale(d.data.from);
		})
		.attr("y", function(d, i){
			return self.yScale(d[1]);
		})
		.attr("height", function(d, i){
			return self.yScale(d[0]) - self.yScale(d[1]);
		})
		.attr("width", function(d, i){
			return self.xScale.bandwidth();
		})

	var severity_g = self.plotarea.append('g');

	var severity_marks = severity_g.selectAll("rect")
		.data(self.dataset.map(function(d){
			return {severity: d.severity, from: d.from};
		}), function(d){
			return d;
		})
		.enter()
		.append("rect")
		.attr("fill", function(d){
			return self.severityColorGen(+d.severity);
		})
		.attr("height", 20)
		.attr("width", self.xScale.bandwidth())
		.attr("y", 0)
		.attr("x", function(d){
			return self.xScale(d.from);
		})
		.attr("transform", "translate(0," + (self.h)  + ")")
		;

	var changes_g = self.plotarea.append('g');
	
	var changes_per_bar_g = changes_g.selectAll("g")
		.data(self.dataset.map(function(d){
			return {changes: d.changes, from:d.from};
		})
		.filter(function(d){
			return d.changes.length > 0;
		}), function(d){
			return d;
		})
		.enter()
		.append("g")
		.classed("changes_per_bar_g", true);

	var changes_circles = changes_per_bar_g.selectAll("circle")
		.data(function(d){
			return d.changes;
		}, function(d){
			return d;
		})
		.enter()
		.append("circle")
		.attr("r", 5)
		.attr("cx", function(d){
			return self.xScale(d3.select(this.parentNode).data()[0].from);
		})
		.attr("cy", function(d, i){
			return self.h - (i+1)*20;
		})
		.attr("transform", "translate(" + self.xScale.bandwidth()/2.0 + ",0)");
	
	var changes_label = changes_per_bar_g.selectAll("text")
		.data(function(d){
			return d.changes;
		}, function(d){
			return d;
		})
		.enter()
		.append("text")
		.text(function(d, i){
			return d;
		})
		.style("text-anchor", "middle")
		.style("font-size", "0.6em")
		.attr("x", function(d){
			return self.xScale(d3.select(this.parentNode).data()[0].from) + self.xScale.bandwidth()/2.0;
		})
		.attr("y", function(d, i){
			return self.h - (i+1)*20 - 7;
		})
		.attr("xlink:href", "http://en.wikipedia.org/")
		;
		

	var axisGeneratorX = d3.axisBottom()
		.scale(self.xScale)
		.tickFormat(function(d){
			var date = new Date(d * 1000);
			return new String(date.getHours()).padStart(2, '0') + ":" + new String(date.getMinutes()).padStart(2, "0");
		});

	var axisGeneratorY = d3.axisLeft()
		.scale(self.yScale);

	self.svg.append("g")
		.classed("x axis", true)
		.attr("transform", "translate(" + self.margin_x + ", " + (self.h + self.margin_y + 20) + ")")
		.call(axisGeneratorX);

	self.svg.append("g")
		.classed("y axis", true)
		.attr("transform", "translate(" + self.margin_x + ", " + self.margin_y + ")")
		.call(axisGeneratorY);

	self.svg.append("text")
		.attr("x", 20)
		.attr("y", 40)
		.style("font-size", "0.8em")
		.style("font-weight", "bold")
		.text("Alert count");
	self.svg.append("text")
		.attr("x", 4)
		.attr("y", self.h + self.margin_y + 14)
		.style("font-size", "0.8em")
		.style("font-weight", "bold")
		.text("Severity");
}
