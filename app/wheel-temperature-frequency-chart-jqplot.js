WheelTemperatureFrequencyDistributionChart = (function(){
	
	function displayTemperatureFrequencyDistributionChart(trainEventId, chartData, $scope){
	    var number_of_bins = 30;

	    var context = buildContext(trainEventId, chartData.axleReads, number_of_bins);
		
		context.summary = buildSummary(chartData.detectorAxleReadSummary, context);

		var temperatureFrequencyDistributionChartData = buildFrequencyDistributionData(context);
		
		context.maxFrequency = computeMaxFrequency(temperatureFrequencyDistributionChartData);
		
		var y_axis_tick_interval = computeYAxisTickInterval(context);
		var y_axis_ticks = computeYAxisTicks(y_axis_tick_interval, context);
		
	    var temperatureFrequencyDistributionChartOptions = buildTemperatureFrequencyDistributionChartOptions(context, y_axis_ticks);	    
	   
	    drawChart(trainEventId, temperatureFrequencyDistributionChartData, temperatureFrequencyDistributionChartOptions);
	}
	
	function drawChart(trainEventId, temperatureFrequencyDistributionChartData, temperatureFrequencyDistributionChartOptions) {
	    $.jqplot.postDrawHooks.push(function () {
	        $(".jqplot-series-canvas").css('z-index', '0'); //send series canvas to back         
	    	$(".jqplot-overlayCanvas-canvas").css('z-index', '1'); //send overlay canvas to front  
	        $(".jqplot-highlighter-tooltip").css('z-index', '2');
	        $(".jqplot-event-canvas").css('z-index', '5'); //must be on the very top since it is responsible for event catching and propagation
	    });
	    
	    // $.jqplot('temperature-frequency-chart'+trainEventId, temperatureFrequencyDistributionChartData, temperatureFrequencyDistributionChartOptions);
	    $.jqplot('temperature-frequency-chart', temperatureFrequencyDistributionChartData, temperatureFrequencyDistributionChartOptions);
	}
	
	function buildContext(trainEventId, chartData, numberOfBins) {
		var context = {trainEventId: trainEventId, chartData: chartData, numberOfBins: numberOfBins};
		context.range = computeTemperatureRange(chartData);
		context.binSize = computeBinSize(context);
		
		return context;
	}
	
	function buildFrequencyDistributionData(context) {
		var leftTemperatures = [];
		var rightTemperatures = [];
		
		var limit = context.range.max;
		if (limit == 0) {
			limit = 1;
		}
		for( var i = 0; i < limit; i+=context.binSize) {
			leftTemperatures.push(0);
			rightTemperatures.push(0);
		}
		
		for(var i = 0; i < context.chartData.length; i++) {
			var datum = context.chartData[i];
			

			if (datum.leftTemp != null) {
				leftTemperatures[computeBinIndex(datum.leftTemp, context)]++;
			}
			//TODO temporary fix 
			else if(datum.leftBearingTemp != null){
				leftTemperatures[computeBinIndex(datum.leftBearingTemp, context)]++;
			}
			if (datum.rightTemp != null) {
				rightTemperatures[computeBinIndex(datum.rightTemp, context)]++;
			}
			//TODO temporary fix 
			else if (datum.rightBearingTemp != null) {
				rightTemperatures[computeBinIndex(datum.rightBearingTemp, context)]++;
			}

		}
		
		return [leftTemperatures, rightTemperatures];
	}

	// Scale the given value to the given bin size
	function scale(value, context) {
		return (value-context.range.min)/context.binSize;
	}
	
	// Compute the bin index by scaling to the maximum 
	function computeBinIndex(temperature, context) {
		return Math.floor(scale(temperature, context));
	}
	
	// Compute the size of each bin given the total number of bins and the temperature range
	function computeBinSize(context) {
		var binSize = Math.ceil(context.range.diff/context.numberOfBins);
		return binSize == 0 ?
				1 :
				binSize;
	}
	
	function buildFrequencyDistributionTicks(context) {
		var ticks = [];
		var limit = context.range.max;
		
		if (limit == 0) {
			// Case where all zeros
			limit = 1;
		} else {
			// Add 10% padding
			limit = Math.ceil(limit*1.1);
		}
		
		for( var i = context.range.min; i < limit; i+= context.binSize) {
			ticks.push(i.toString()+" - "+(i+context.binSize).toString());
		}
		
		return ticks;
	}

	function buildSummary(detectorAxleReadSummary, context) {
			
		var mean = detectorAxleReadSummary.trainAvgTemp;
		var summary = {
			mean: mean,
			leftSideStdev: detectorAxleReadSummary.leftSideStdev,
			meanPlusThreeTimesLeftStdev: mean + (3*detectorAxleReadSummary.leftSideStdev),
			meanMinusThreeTimesLeftStdev: mean - (3*detectorAxleReadSummary.leftSideStdev),
			rightSideStdev: detectorAxleReadSummary.rightSideStdev,
			meanPlusThreeTimesRightStdev: mean + (3*detectorAxleReadSummary.rightSideStdev),
			meanMinusThreeTimesRightStdev: mean - (3*detectorAxleReadSummary.rightSideStdev),
			totalAxleCount: detectorAxleReadSummary.totalAxleCount
		};
		
		// Scale the x positions relative to the bin size in order to correctly place along the x-axis  
		summary['mean_x'] = computeBinIndex(summary.mean, context);
		summary['meanPlusThreeTimesLeftStdev_x'] = scale(summary.meanPlusThreeTimesLeftStdev, context);
		summary['meanMinusThreeTimesLeftStdev_x'] = scale(summary.meanMinusThreeTimesLeftStdev, context);
		summary['meanPlusThreeTimesRightStdev_x'] = scale(summary.meanPlusThreeTimesRightStdev, context);
		summary['meanMinusThreeTimesRightStdev_x'] = scale(summary.meanMinusThreeTimesRightStdev, context);
		
		return summary;
	}
	
	function buildVerticalRulers(summary, lineWidth, dashPattern) {
		return [
		  { dashedVerticalLine: {
       		name: 'mean',
       		x: summary.mean_x,
            lineWidth: lineWidth,
            color: 'rgba(255,255,0, 0.75)',
            lineCap: 'butt',
            shadow: false,
            yOffset: 0,
            showTooltip: true,
            tooltipFormatString: $.jqplot.sprintf("mean = %.2f",summary.mean),
            showTooltipPrecision: 0.5
       	  } },
       	  { dashedVerticalLine: {
       		name: 'meanPlusThreeTimesLeftStdev',
       		x: summary.meanPlusThreeTimesLeftStdev_x,
            lineWidth: lineWidth+2,
            color: 'rgba(25, 71, 209, 0.5)',
            lineCap: 'butt',
            shadow: false,
            yOffset: 0,
            showTooltip: true,
            tooltipFormatString: $.jqplot.sprintf("LEFT: mean + 3sigma = %.2f",summary.meanPlusThreeTimesLeftStdev),
            showTooltipPrecision: 0.5,
            dashPattern: dashPattern
       	  }},
       	  {dashedVerticalLine: {
       		name: 'meanMinusThreeTimesLeftStdev',
       		x: summary.meanMinusThreeTimesLeftStdev_x,
            lineWidth: lineWidth+2,
            color: 'rgba(25, 71, 209, 0.5)',
            lineCap: 'butt',
            shadow: false,
            yOffset: 0,
            showTooltip: true,
            tooltipFormatString: $.jqplot.sprintf("LEFT: mean - 3sigma = %.2f",summary.meanMinusThreeTimesLeftStdev),
            showTooltipPrecision: 0.5,
            dashPattern: dashPattern
       	  }},
       	  {dashedVerticalLine: {
       		name: 'meanPlusThreeTimesRightStdev',
       		x: summary.meanPlusThreeTimesRightStdev_x,
            lineWidth: lineWidth,
            color: 'rgba(255, 0, 0,0.5)',
            lineCap: 'butt',
            shadow: false,
            yOffset: 0,
            showTooltip: true,
            tooltipFormatString: $.jqplot.sprintf("RIGHT: mean + 3sigma = %.2f",summary.meanPlusThreeTimesRightStdev),
            showTooltipPrecision: 0.5,
            dashPattern: dashPattern
       	  }},
       	  {dashedVerticalLine: {
       		name: 'meanMinusThreeTimesRightStdev',
       		x: summary.meanMinusThreeTimesRightStdev_x,
            lineWidth: lineWidth,
            color: 'rgba(255, 0, 0,0.5)',
            lineCap: 'butt',
            shadow: false,
            yOffset: 0,
            showTooltip: true,
            tooltipFormatString: $.jqplot.sprintf("RIGHT: mean - 3sigma = %.2f",summary.meanMinusThreeTimesRightStdev),
            showTooltipPrecision: 0.5,
            dashPattern: dashPattern
       	  }}
     ];
	}
	
	function computeMaxFrequency(leftAndRightFrequencies) {
		var maxFrequency = 0;
		
		for(var i = 0; i < leftAndRightFrequencies[0].length; i++) {
			maxFrequency = Math.max(leftAndRightFrequencies[0][i], maxFrequency); 
		}
		for(var i = 0; i < leftAndRightFrequencies[1].length; i++) {
			maxFrequency = Math.max(leftAndRightFrequencies[1][i], maxFrequency); 
		}
		return maxFrequency;
	}
	
	// jqPlot isn't doing a very good job of computing a tick interval. It tries to compute intermediate 
	// decimal values. This attempts to divide the total range of frequencies into 10 chunks.
	function computeYAxisTickInterval(context) {
		return Math.ceil(context.maxFrequency/10);
	}
	

	// jqPlot's ticks are not being computed properly so we override here using the 
	// tick interval plus a little extra on the end so that the last point doesn't 
	// fall on the border of the chart.
	function computeYAxisTicks(interval, context) {
		var tickValue = 0;
		var ticks = [];
		var upperBound = context.maxFrequency + interval;
		while (tickValue <= upperBound) {
			ticks.push(tickValue);
			tickValue += interval;
		}

		return ticks;
	}
	
	function computeTemperatureRange(chartData) {
		var max = 0;
		var min = 99999;
		for(var i = 0; i < chartData.length; i++) {
			var datum = chartData[i];

			if (datum.leftTemp != null) {
				max = Math.max(datum.leftTemp, max);
				min = Math.min(datum.leftTemp, min);
			}
			//TODO temporary fix 
			else if(datum.leftBearingTemp != null){
				max = Math.max(datum.leftBearingTemp, max);
				min = Math.min(datum.leftBearingTemp, min);
			}
			if (datum.rightTemp != null) {
				max = Math.max(datum.rightTemp, max);
				min = Math.min(datum.rightTemp, min);
			}
			//TODO temporary fix 
			else if(datum.rightBearingTemp != null){
				max = Math.max(datum.rightBearingTemp, max);
				min = Math.min(datum.rightBearingTemp, min);
			}
		}
		
		max = Math.ceil(max / 10) * 10;
		min = Math.floor(min/10) * 10;
		
		
		return {max: max, min:min, diff:max-min};
	}
	
	function buildTitle(summary) {
		var title = $.jqplot.sprintf("Train Wheel Normalized Temperature Distribution - AXLES: %d, AVG=%.1f F, STD.DEV LEFT=%.1f F, STD.DEV RIGHT=%.1f F", 
									  summary.totalAxleCount, summary.mean, summary.leftSideStdev, summary.rightSideStdev);
		return title;
	}
	
	function buildTemperatureFrequencyDistributionChartOptions(context, yAxisTicks) {
		var title = ' ';//buildTitle(context.summary);
	    var barWidth = 10;
	    var barPadding = 1;
	    var barMargin = 1;
		var rulerLineWidth = 3;
		var dashPattern = [8,8];
		var verticalRulers = buildVerticalRulers(context.summary, rulerLineWidth, dashPattern);
		
		return {
	    	title: {text: "Wheel Temperature Distribution", textAlign: 'center'},
	    	animate: false, // !$.jqplot.use_excanvas,
	        seriesDefaults:{
	            renderer:$.jqplot.BarRenderer,

                rendererOptions: {  
                    highlightMouseOver: true,
//                    rendererOptions: {fillToZero: true},
                    barWidth: barWidth,
	                barPadding: barPadding,
	                marMargin: barMargin
                },
	            shadow: true
// Show values over bars	            
//	            pointLabels: { show: true, location: 'n', edgeTolerance: -15 },
	        },
	        axesDefaults: {
	            tickRenderer: $.jqplot.CanvasAxisTickRenderer
	        },
	        series:[
	                {label: 'Wheels on Left'}, 
	                {label: 'Wheels on Right'}
	        ],
	        seriesColors: [ "#1947D1", "#FF0000"], 
	    	legend: { 
	    		show: true,
	    		location: 'ne',
	    		placement: 'insideGrid',
	    		renderer: $.jqplot.EnhancedLegendRenderer
	    	},

            highlighter: {
                show: true,
                sizeAdjust: 1.0,
                showMarker: false,
                tooltipLocation: 'n',

                tooltipContentEditor: function(str, seriesIndex, pointIndex, plot){
                	var seriesLabel = plot.series[seriesIndex].label;
                	var reading = plot.data[seriesIndex][pointIndex];
                	var bin = plot.axes.xaxis.ticks[pointIndex];
                	var axle = reading[0];
                	var temperature = reading[1];
                    var html = "<div style='font-size: 10pt;background-color: #ffffff;'>";
                    html += reading;
                    html +="&nbsp;";
                    html += seriesLabel.toLowerCase();
                    html += "<br/>with temperature<br/>";
                    html += bin;
                    html += " degrees F</div>";

                    return html;
                }
            },

            canvasOverlay: {
	            show: true,
	            objects: verticalRulers
            },
	      cursor: {
	         show: false
	      },
	        axes: {
	            xaxis: {
	            	label: "RAW TEMPERATURE RANGE (deg F)",
	                renderer: $.jqplot.CategoryAxisRenderer,
	                ticks: buildFrequencyDistributionTicks(context),
		            tickOptions: {
			              angle: -90
			        }
	            },
	            yaxis: {
	            	label: "NUMBER OF WHEELS",
	            	labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
		    		 tickOptions: { formatString: '%d' },
		    		 tickInterval: computeYAxisTickInterval(context.maxFrequency),
		    		 min: 0,
		    		 ticks: yAxisTicks
	            }
	        }
	    };
	}
	
	return {
		displayTemperatureFrequencyDistributionChart:displayTemperatureFrequencyDistributionChart
	};
			
			
})();
	