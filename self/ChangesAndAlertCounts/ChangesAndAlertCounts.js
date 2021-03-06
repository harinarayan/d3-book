/*
 * Version : 1.0
 * Author  : Harinarayan Sreenivasan (hsreenivasan@paypal.com)	
 * Date    : Aug 2018
 */

var ChangesAndAlertCounts = function(config){
	this.container_selector = config.container_selector || "div.changes-and-effects";
	this.height = +config.height || 500;
	this.width = +config.width || 1000;
	this.change_url_formatter = config.change_url_formatter || function(d){ return "https://" + d + ".com"; }
	
	this.margin_x = 50;
	this.margin_y = 50;
	this.series_keys = config.series_keys;
	this.first_time_rendering = true;
	
	if(this.validate_config()){
		this.init();
	}
}

ChangesAndAlertCounts.prototype.validate_config = function(){
	var self = this;
	if(self.height < 300 || self.width < 400){
		self.svg = d3.select(self.container_selector)
			.append('p')
			.attr('color', 'red')
			.text("height and width must be atleast 300 and 400 respectively.")
			;
		return false;
	}
	return true
};
ChangesAndAlertCounts.prototype.init = function(){
	var self = this;
	self.svg = d3.select(self.container_selector)
		.append("svg")
		.attr("height", self.height)
		.attr("width", self.width)
		;

	self.container_top = d3.select(self.container_selector).style("top");
	self.container_left = d3.select(self.container_selector).style("left");
	self.h = self.height - (2*self.margin_x);
	self.w = self.width - (2*self.margin_y);
	self.plotarea = self.svg.append("g")
		.classed("plotarea", true)
		.attr("height", self.h)
		.attr("width", self.w)
		.attr("transform", "translate(" + self.margin_x + ", " + self.margin_y + ")");

	if(self.series_keys.length <= 12){
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
	}else{
		self.colorGen = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, self.series_keys.length));
	}
	self.severityDescMap = {"0":"None", "1":"Low", "2":"Medium", "3":"High"}
	self.severityColorGen = d3.scaleOrdinal(["green", "gold", "orange", "red"]);
	self.tooltip = d3.select(self.container_selector)
		.append("div")
		.classed("tooltip", true)
		.attr("height", "auto")
		.attr("width", "auto")
		.style("padding", "5px")
		.style("background-color", "beige")
		.style("border", "1px solid black")
		.style("border-radius", "5px")
		.style("position", "fixed")
		.style("pointer-events", "none")
		.style("display", "none")
		;
	self.tooltip_p = self.tooltip.append("p")
		.style("margin", "5px")
		.style("font-size", "0.8em")
		.style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
		;
}

ChangesAndAlertCounts.prototype.render_axes = function(){
	var self = this;
	var axisGeneratorX = d3.axisBottom()
		.scale(self.xScale)
		.tickFormat(function(d){
			var m = moment(new Date(d * 1000)).tz("America/Los_Angeles");
			if(m.hour() === 0 && m.minute() === 0){
				return m.format("D MMM");
			}else{
				return m.format("HH:mm");
			}
		});

	var axisGeneratorY = d3.axisLeft()
		.scale(self.yScale);

	if(self.first_time_rendering){
		self.xAxis = self.svg.append("g")
			.classed("x axis", true)
			.attr("transform", "translate(" + self.margin_x + ", " + (self.h + self.margin_y + 15) + ")")
			.call(axisGeneratorX);

		self.yAxis = self.svg.append("g")
			.classed("y axis", true)
			.attr("transform", "translate(" + self.margin_x + ", " + self.margin_y + ")")
			.call(axisGeneratorY);

		self.svg.append("text")
			.attr("x", 20)
			.attr("y", 40)
			.style("font-size", "0.7em")
			.style("font-weight", "bold")
			.style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
			.text("Alert count");

		self.svg.append("text")
			.attr("x", 4)
			.attr("y", self.h + self.margin_y + 14)
			.style("font-size", "0.7em")
			.style("font-weight", "bold")
			.style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
			.text("Severity");
	}else{
		self.xAxis
			.transition("xAxis")
			.duration(1000)
			.call(axisGeneratorX);
		self.yAxis
			.transition("yAxis")
			.duration(1000)
			.call(axisGeneratorY);
	}
		
	self.xAxis.selectAll("text")
		.attr("transform", "translate(-12, 19), rotate(270)")
		.attr("font-size", "0.9em")
		;
}

ChangesAndAlertCounts.prototype.generate_series = function(){
	var self = this;
	var list_of_counts = self.dataset.map(function(d){
		return Object.assign({time: d.time}, d.counts);
	});
	var stack = d3.stack()
		.keys(self.series_keys);
	//console.log(stack(list_of_counts));
	layers = stack(list_of_counts).map(function(d, i){
		return {series_key: self.series_keys[i], layer: d}
	});
	//console.log(layers);
	return layers;
}

ChangesAndAlertCounts.prototype.render = function(dataset){
	var self = this;
	self.dataset = dataset;
	var series = self.generate_series();
	//console.log(series.length);

	var min_y = d3.min(series, function(d){
		return d3.min(d.layer, function(e){
			return e[0];
		})
	});

	var max_y = d3.max(series, function(d){
		return d3.max(d.layer, function(e){
			return e[1];
		})
	});

	var min_x = d3.min(self.dataset, function(d){
		return d.time;
	});

	var max_x = d3.max(self.dataset, function(d){
		return d.time;
	});

	//console.log(min_x + ", " + max_x + ", " + min_y + ", " + max_y);

	var domain_x = self.dataset.map(function(d) { return d.time; });
	if(self.first_time_rendering){
		self.xScale = d3.scaleBand().domain(domain_x).range([0, self.w]).padding(0.05);
		self.yScale = d3.scaleLinear().domain([min_y, max_y]).range([self.h, 0]);
	}else{
		self.xScale.domain(domain_x);
		self.yScale.domain([min_y, max_y]);
	}

	//console.log(series);
	self.render_bars(series);
	self.render_severity();
	self.render_changes_per_slot();
	self.render_axes();

	self.first_time_rendering = false;
};

ChangesAndAlertCounts.prototype.render_bars = function(series){
	var self = this;
	var series_g = self.plotarea.selectAll("g.series")
		.data(series, function(d){
			return d.series_key;
		});
	var series_g_enter = series_g.enter();
	var series_g_merged = series_g_enter.append("g")
		.classed("series", true)
		.style("fill", function(d, i){
			return self.colorGen(d.series_key);
		})
		.merge(series_g)
		;
	series_g.exit().remove();

	var rects = series_g_merged.selectAll("rect.bars")
		.data(function(d){
			return d.layer.map(function(e){
				return {series_key: d.series_key, bounds: e, time:e.data.time}
			});
		}, function(d){
			return d.time;
		});

	var rects_enter = rects.enter();
	//console.log(rects_enter);
	var rects_merged = rects_enter.append("rect")
		.classed("bars", true)
		.attr("x", self.w + self.margin_x * 2)
		.attr("y", function(d, i){
			return self.yScale(d.bounds[1]);
		})
		.attr("height", function(d, i){
			return self.yScale(d.bounds[0]) - self.yScale(d.bounds[1]);
		})
		.attr("width", function(d, i){
			return self.xScale.bandwidth();
		})
		.attr("opacity", "0.0")
		.merge(rects)
		;

	rects_merged.transition("rectsAppear")
		.duration(1000)
		.delay(function(d, i){
			return i * 20;
		})
		.attr("x", function(d, i){
			return self.xScale(d.time);
		})
		.attr("y", function(d, i){
			return self.yScale(d.bounds[1]);
		})
		.attr("height", function(d, i){
			return self.yScale(d.bounds[0]) - self.yScale(d.bounds[1]);
		})
		.attr("width", function(d, i){
			return self.xScale.bandwidth();
		})
		.attr("opacity", "1.0")
		;

	rects.exit()
		.transition("rectsExit")
		.duration(1000)
		.attr("x", -100)
		.attr("opacity", "0.0")
		.remove();

	rects_merged.on("mouseover", function(d){
		var this_element = d3.select(this);
		this_element.attr("stroke", "black");
		this_element.attr("stroke-width", 2);

		var message = d.series_key;
		self.tooltip
			.style("left", (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY) + "px")
			.style("display", "initial")
		self.tooltip_p
			.selectAll("*").remove();
		self.tooltip_p
			.html(message)
			;
	})
	.on("mouseout", function(d){
		var this_element = d3.select(this);
		this_element.attr("stroke", "none");
		self.tooltip
			.style("display", "none")
	});

};

ChangesAndAlertCounts.prototype.render_severity = function(){
	var self = this;
	if(self.first_time_rendering){
		self.severity_g = self.plotarea.append('g')
			.classed("severity", true);
	}

	var severity_marks = self.severity_g.selectAll("rect.severity")
		.data(self.dataset.map(function(d){
                        return {severity: d.severity, time: d.time};
                }), function(d){
			return d.time;
		});

	var severity_marks_enter = severity_marks.enter();
	var severity_marks_merged = severity_marks_enter.append("rect")
		.classed("severity", true)
		.attr("fill", function(d){
			return self.severityColorGen(+d.severity.worst);
		})
		.attr("height", 15)
		.attr("width", self.xScale.bandwidth())
		.attr("y", 1)
		.attr("x", self.w + self.margin_x * 2)
		.attr("opacity", "0.0")
		.attr("transform", "translate(0," + (self.h)  + ")")
		.merge(severity_marks)
		;

	severity_marks_merged.transition("severityAppear")
		.duration(1000)
		.delay(function(d, i){
			return i * 20;
		})
		.attr("x", function(d){
			return self.xScale(d.time);
		})
		.attr("opacity", "1.0")
		;

	severity_marks.exit()
		.transition("severityExit")
		.duration(1000)
		.attr("x", -100)
		.attr("opacity", "0.0")
		.remove();

	severity_marks_merged.on("mouseover", function(d){
		var this_element = d3.select(this);
		this_element.attr("stroke", "black");
		this_element.attr("stroke-width", 2);

		var message = "None";
		if(Object.entries(d.severity.details).length){
			message = "";
			Object.entries(d.severity.details).forEach(function(entry){
				message += self.severityDescMap[entry[0]] + ": " + entry[1].toString();
				message += "<br>"
			});
		}
		
		self.tooltip
			.style("left", (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY) + "px")
			.style("display", "initial")
		self.tooltip_p
			.selectAll("*").remove();
		self.tooltip_p
			.html(message)
			;
	})
	.on("mouseout", function(d){
		var this_element = d3.select(this);
		this_element.attr("stroke", "none");
		self.tooltip
			.style("display", "none")
	});
};

ChangesAndAlertCounts.prototype.render_changes_per_slot = function(){
	var self = this;
	if(self.first_time_rendering){
		self.changes_g = self.plotarea.append('g')
			.classed("changes", true);
	}

	var changes_per_slot = self.changes_g.selectAll("g.changes_per_slot")
		.data(self.dataset.map(function(d){
			return {changes: d.changes, time: d.time};
		}), function (d){
			return d.time;
		});

	var changes_per_slot_enter = changes_per_slot.enter();
	var changes_per_slot_merged = changes_per_slot_enter.append("g")
		.classed("changes_per_slot", true)
		.attr("height", function(d){
			return d.changes.length * 30;
		})
		.attr("transform", function(d){
			return "translate(" + (self.w + self.margin_x * 2) + ", " + (self.h - d.changes.length * 30) + ")";
		})
		.merge(changes_per_slot)
		;
	
	changes_per_slot_merged.transition("changesPerSlotAppear")
		.duration(1000)
		.delay(function(d, i){
                        return i * 20;
                })
		.attr("transform", function(d){
			return "translate(" + (self.xScale(d.time) + self.xScale.bandwidth()/2.0) + ", " + (self.h - d.changes.length * 30) + ")";
		})
		;
	changes_per_slot.exit()
		.transition("changesPerSlotExit")
		.duration(1000)
		.attr("transform", function(d){
			return "translate(" + (-100) + ", " + (self.h - d.changes.length * 30) + ")";
		})
		.remove();

	self.render_changes(changes_per_slot_merged);
};

ChangesAndAlertCounts.prototype.render_changes = function(changes_per_slot){
	var self = this;
	changes_per_slot.selectAll('a.change')
		.data(function(d){
			return d.changes;
		}, function(d){
			return d;
		})
		.enter()
		.append('a')
		.classed('change', true)
		.attr("xlink:href", self.change_url_formatter)
		.attr("target", "_blank")
		.append('circle')
		.classed('change_hyperlink', true)
		.attr("r", 12)
		.attr("cy", function(d, i){
			return i * 30 + 17;
		})
		.attr("cx", 0)
		.attr("opacity", "0.0")
		.on("mouseover", function(d){
			d3.select(this).attr("opacity", "0.3");
		})
		.on("mouseout", function(d){
			d3.select(this).attr("opacity", "0.0");
		})
		;

	changes_per_slot.selectAll('text.change')
		.data(function(d){
			return d.changes;
		}, function(d){
			return d;
		})
		.enter()
		.append('text')
		.classed('change', true)
		.text(function(d){
			return d;
		})
		.attr("y", function(d, i){
			return i * 30;
		})
		.attr("fill", "black")
		.attr("font-size", "0.6em")
		.attr("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
		.attr("dominant-baseline", "hanging")
		.attr("text-anchor", "middle")
		.style("pointer-events", "none")
		;

	changes_per_slot.selectAll('circle.change')
		.data(function(d){
			return d.changes;
		}, function(d){
			return d;
		})
		.enter()
		.append('circle')
		.classed('change', true)
		.attr("r", 5)
		.attr("cx", 0)
		.attr("cy", function(d, i){
			return i * 30 + 17;
		})
		.attr("stroke", "white")
		.attr("stroke-width", "2")
		.style("pointer-events", "none")
		;
};

