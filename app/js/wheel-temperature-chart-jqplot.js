WheelTemperatureChart = (function(){

	function displayTemperatureLineChart(trainEventId, temperatureLineChartData, $scope) {
		$scope.chartDetailFlag = true;
		
		var max_axle = temperatureLineChartData.maxAxle;
		var x_axis_tick_interval = computeLinePlotTickInterval(max_axle);
		var x_axis_ticks = computeLinePlotTicks(x_axis_tick_interval, max_axle, x_axis_ticks);
		var mean = temperatureLineChartData.rightSideNormalMeanTemperature; // TODO Call this out as a separate "mean" property.
	    
	    if (!$scope.temperatureLineChartSeriesOptions) {
	    	$scope.temperatureLineChartSeriesOptions = buildTemperatureLineChartSeriesOptions();
	    }
	    
    	$scope.temperatureLineChartOptions = buildTemperatureLineChartOptions($scope.temperatureLineChartSeriesOptions, max_axle, x_axis_ticks);
    	
    	$scope.selectedTemperatureLineChartData = {
    			trainEventId: trainEventId, 
    			temperatureLineChartData: temperatureLineChartData, 
    			temperatureLineChartOptions: $scope.temperatureLineChartOptions};
    	
	    drawChart($scope);
	}

	function drawChart($scope) {
		$('#temperature-chart').empty();
		$scope.initializingTemperatureLineChart = true;
		
//		var trainEventId = $scope.selectedTemperatureLineChartData.trainEventId;
		var temperatureLineChartData = $scope.selectedTemperatureLineChartData.temperatureLineChartData;
		var temperatureLineChartOptions = $scope.selectedTemperatureLineChartData.temperatureLineChartOptions;
		var temperatureLineChartSeriesOptions = temperatureLineChartOptions.series;
		var assembledChartData = assembleChartData(temperatureLineChartData, temperatureLineChartSeriesOptions);
		
		// This is set here rather than prior to this method being called because it may vary from one draw to the next.
		$scope.selectedTemperatureLineChartData.assembledChartData = assembledChartData;
		
        $.jqplot.postDrawHooks.push( function () {
	        $(".jqplot-series-canvas").css('z-index', '0'); // Send series canvas to back         
	    	$(".jqplot-overlayCanvas-canvas").css('z-index', '1'); //send overlay canvas to front  
	    	$(".jqplot-table-legend").css('z-index', '1'); // Make sure table legend is behind the tooltip in case of overlay
	        // $(".jqplot-highlighter-tooltip").css('z-index', '2'); // This z-index is set outside of our control by jqplot. 
	        $(".jqplot-event-canvas").css('z-index', '3'); // Must be on the very top since it is responsible for event catching and propagation
        });
        
//        $.jqplot('temperature-chart'+trainEventId, temperatureLineChartData, temperatureLineChartOptions);
        $.jqplot('temperature-chart', assembledChartData, temperatureLineChartOptions);
        
	    observeLegendSeriesClicks($scope);

	    // Initialize series suppression based on current state within temperatureLineChartSeriesOptions
	    initSeriesSuppression($scope.temperatureLineChartSeriesOptions, $scope.initializingTemperatureLineChart);
	    
	    $scope.initializingTemperatureLineChart = false;
	}
	
	function observeLegendSeriesClicks($scope) {
		
		var observeLegendSeriesClick = function(seriesElement, seriesLabel, $scope) {
			
			var legendClickCallback = function(event ) {
				var seriesElement = event.currentTarget;
		    	var seriesLabel = $(seriesElement).attr('serieslabel');
		    	this.suppressed = !this.suppressed; // Toggle DOM object state
		    	// Toggle options state
		    	toggleSeriesSelectionForLabel($scope.temperatureLineChartSeriesOptions, seriesLabel, $scope);
			};

			// Add series label to parent as an attribute 
			$(seriesElement).attr('serieslabel', seriesLabel);
			// Install callback for click in legend series selection to toggle selection state
	        $(seriesElement).click(legendClickCallback);
		};
		
		// Walk html elements with series labels in legend
	    $('.jqplot-table-legend-label').filter(':visible').each(function(index, labelElement) {
			// We use the series label to differentiate series elements
	    	var seriesLabel = $(labelElement).html(); 
	    	// Get parent of both element with the label and the color swatch so we can hook callback to both 
	    	observeLegendSeriesClick($(this).closest('tr'), seriesLabel, $scope);
	    });
	}

	function initSeriesSuppression(seriesSelections, initializing) {
		for(var i = 0; i < seriesSelections.length; i++) {
			var series = seriesSelections[i];
			var j = 0;
		    $('tr.jqplot-table-legend[serieslabel="'+series.label+'"]').filter(':visible').each(function() {
		    	j++;
	    		this.suppressed = false;
		    	// Emulate user click if series is supposed to be suppressed
		    	if (series.suppress) {
		    		// Click on element that is being watched by jqplot (either the swatch or the label)
		    		$(this).find('.jqplot-table-legend-label:contains('+series.label+')').click(); 
		    	}
		    });
		}
	}
	
	function toggleSeriesSelectionForLabel(seriesSelections, seriesLabel, $scope) {
		// There are two scenarios where this may be called:
		// 1) We are initializing, in which case we emulate user clicks on the legend to suppress
		//    a chart element based on 'suppressed' value ($scope.initializingTemperatureLineChart=true)
		// 2) The user has really clicked the legend to suppress a chart element ($scope.initializingTemperatureLineChart=false) 
		// We only care about the second scenario so exit immediately for the first scenario ($scope.initializingTemperatureLineChart=true)
		if ($scope.initializingTemperatureLineChart) {return;}

		var redraw = false;
		
		for (i = 0; i < seriesSelections.length; ++i) {
		    if (seriesSelections[i].label == seriesLabel) {
		    	seriesSelections[i].suppress = !seriesSelections[i].suppress;
		    	// If transitioned from suppress to not suppress (we want to show the item now) 
		    	// and we have a single fake element (negative axle number) in the series, which 
		    	// means the real elements have not been set in the series, 
		    	// then go ahead and redraw with the new settings to pick up the series data
		    	if (!seriesSelections[i].suppress &&
		    		$scope.selectedTemperatureLineChartData.assembledChartData[i].length <= 1 
		    			&& $scope.selectedTemperatureLineChartData.assembledChartData[i][0][0] < 0) {
		    		redraw = true;
		    	}
		    	break;
		    }
		}
		
		if (redraw) {
			drawChart($scope);
		}
	}

	function assembleChartData(temperatureLineChartData, temperatureLineChartSeriesOptions) {
		var plotPoints = temperatureLineChartData.plotPoints;
		return [   
		        suppressSeriesData(plotPoints["leftTemperatures"], temperatureLineChartSeriesOptions[0].suppress),
		        suppressSeriesData(plotPoints["rightTemperatures"], temperatureLineChartSeriesOptions[1].suppress),
		        suppressSeriesData(plotPoints["meanTemperatures"], temperatureLineChartSeriesOptions[2].suppress),
		        suppressSeriesData(plotPoints["predictedTemperaturesLeft"], temperatureLineChartSeriesOptions[3].suppress),
		        suppressSeriesData(plotPoints["predictedWheelTemperatureLeftLowerThreshold"], temperatureLineChartSeriesOptions[4].suppress),
		        suppressSeriesData(plotPoints["predictedTemperaturesRight"], temperatureLineChartSeriesOptions[5].suppress),
		        suppressSeriesData(plotPoints["predictedWheelTemperatureRightLowerThreshold"], temperatureLineChartSeriesOptions[6].suppress),
		        suppressSeriesData(plotPoints["leftLocomotiveTemperatures"], temperatureLineChartSeriesOptions[7].suppress),
		        suppressSeriesData(plotPoints["rightLocomotiveTemperatures"], temperatureLineChartSeriesOptions[8].suppress),
		        suppressSeriesData(plotPoints["carMeanTemperatures"], temperatureLineChartSeriesOptions[9].suppress),
		        suppressSeriesData(plotPoints["carMeanTemperature30DegreesThreshold"], temperatureLineChartSeriesOptions[10].suppress),
		        suppressSeriesData(plotPoints["leftNormalizedTemperatures"], temperatureLineChartSeriesOptions[11].suppress),
		        suppressSeriesData(plotPoints["rightNormalizedTemperatures"], temperatureLineChartSeriesOptions[12].suppress),
		        suppressSeriesData(plotPoints["meanPlusThreeTimesLeftStdev"], temperatureLineChartSeriesOptions[13].suppress),
		        suppressSeriesData(plotPoints["meanMinusThreeTimesLeftStdev"], temperatureLineChartSeriesOptions[14].suppress),
		        suppressSeriesData(plotPoints["meanPlusThreeTimesRightStdev"], temperatureLineChartSeriesOptions[15].suppress),
		        suppressSeriesData(plotPoints["meanMinusThreeTimesRightStdev"], temperatureLineChartSeriesOptions[16].suppress),
		        suppressSeriesData(plotPoints["leftBearingTemperatures"], temperatureLineChartSeriesOptions[17].suppress),
		        suppressSeriesData(plotPoints["rightBearingTemperatures"], temperatureLineChartSeriesOptions[18].suppress),
		        suppressSeriesData(plotPoints["leftBearingKValues"], temperatureLineChartSeriesOptions[19].suppress),
		        suppressSeriesData(plotPoints["rightBearingKValues"], temperatureLineChartSeriesOptions[20].suppress),
		        suppressSeriesData(plotPoints["leftMeanBearingTemperatures"], temperatureLineChartSeriesOptions[21].suppress),
		        suppressSeriesData(plotPoints["rightMeanBearingTemperatures"], temperatureLineChartSeriesOptions[22].suppress),
		        suppressSeriesData(plotPoints["leftBearingQuartile1TempF"], temperatureLineChartSeriesOptions[23].suppress),
		        suppressSeriesData(plotPoints["rightBearingQuartile1TempF"], temperatureLineChartSeriesOptions[24].suppress),
		        suppressSeriesData(plotPoints["leftBearingQuartile2TempF"], temperatureLineChartSeriesOptions[25].suppress),
		        suppressSeriesData(plotPoints["rightBearingQuartile2TempF"], temperatureLineChartSeriesOptions[26].suppress),
		        suppressSeriesData(plotPoints["leftBearingQuartile3TempF"], temperatureLineChartSeriesOptions[27].suppress),
		        suppressSeriesData(plotPoints["rightBearingQuartile3TempF"], temperatureLineChartSeriesOptions[28].suppress)
		        
		        ];
	}
	
	function suppressSeriesData(series, suppress) {
		if (suppress) {
			if (series.length == 0) {
				return series;
			} else {
				// This is terrible but jqPlot needs at least one element for the first shown series, so for suppressed
				// series we place a single fake point to the left of the origin just to keep it happy. 
				var element = [-100, series[0][1]]; 
				return [element];
			}
		} else {
			return series;
		}
	}
	

	// jqPlot isn't doing a very good job of computing a tick interval. It tries to compute intermediate 
	// decimal values. This attempts to divide the total range of axles into 10 chunks.
	function computeLinePlotTickInterval(maxAxle) {
		return Math.ceil(maxAxle/10);
	}
	

	// jqPlot's ticks are not being computed attrerly so we override here using the 
	// tick interval plus a little extra on the end so that the last point doesn't 
	// fall on the border of the chart.
	function computeLinePlotTicks(interval, maxAxle) {
		var tickValue = 0;
		var ticks = [];
		var upperBound = maxAxle + interval;
		while (tickValue <= upperBound) {
			ticks.push(tickValue);
			tickValue += interval;
		}

		// If the last tick isn't at least half an interval value away from the upper bound, add another tick
		if ((ticks[ticks.length-1] + (interval/2)) < upperBound) {
			ticks.push(tickValue);
		}
		return ticks;
	}
	
	function buildTemperatureLineChartOptions(temperatureLineChartSeriesOptions, maxAxle, xAxisTicks) {
		return {
	          title: {text: "Wheel and Bearing Temperatures", textAlign: 'center'},
	          animate: false, // !$.jqplot.use_excanvas,
	          axesDefaults: {
	            labelRenderer: $.jqplot.CanvasAxisLabelRenderer
	          },
	          seriesDefaults: {
	              rendererOptions: {
	                  smooth: false
	              },
	              showLine: false, 
	              lineWidth: 1, 
	              markerOptions: { show: true, size: 4, style: "diamond" }
	          },
	          series: temperatureLineChartSeriesOptions,
	    	  legend: { 
	    		  show: true,
	    		  location: 'nw',
	    		  placement: 'outsideGrid',
	    		  renderer: $.jqplot.EnhancedLegendRenderer
	    	  },
                highlighter: {
                    show: true,
                    sizeAdjust: 10.0,
                    tooltipLocation: 'ne',
                    useAxesFormatters: true,
                    tooltipContentEditor: function(str, seriesIndex, pointIndex, plot) {
                    	// Units: AXLE, MEAN, CAR, CAR_AVG_MEAN_THRSHOLD, STDDEV
                    	var seriesLabel = plot.series[seriesIndex].label;
                    	var reading = plot.data[seriesIndex][pointIndex];
                    	//console.log(reading);
                    	var axle = reading[0];
                    	var temperature = reading[1];
                    	var unit = reading[2];
                    	var wheelTempRatio = reading[4];
                        var html = "<div style='font-size: 10pt;background-color: #ffffff;'>";
                        if (unit == 'CAR') {
	                        html += "<strong>Car: ";
	                        var datum = reading[3];
	                        html += datum.equipInitial != null ? datum.equipInitial:'';
	                        html += "-";
	                        html += datum.equipNumber != null ? datum.equipNumber: '';
	                        html += "</strong><br>";
                        } else if (unit == "AXLE") {
	                        html += "<strong>Equip: ";
		                        var datum = reading[3];
		                        html += datum.equipInitial != null ? datum.equipInitial:'';
		                        //html += datum;
		                        html += "-";
		                        html += datum.equipNumber != null ? datum.equipNumber: '';
		                        html += ", Axle: ";
		                        html += datum.equipAxleSequenceNumber !=null ? datum.equipAxleSequenceNumber : '-';
		                        html += "<br/>Train Axle: ";
		                        html += axle;
	                        html += "</strong><br>";
                        }
                        html += seriesLabel;
                        if (unit != 'CAR_AVG_MEAN_THRSHOLD' && unit != 'BEARING_QUARTILE' && unit != 'BEARING_MEAN') {
	                        html += ": <strong>";
	                        if (temperature >= 900) {
	                        	html += "Capped at 900 deg.";	
	                        } else {
	                        	html += $.jqplot.sprintf("%.2f",temperature);
	                        	
	                        }
	                        html += "</strong>";
	                        if(wheelTempRatio!=null){
	                        html += ",Wheel Temp Ratio: <strong>";
	                        html += $.jqplot.sprintf("%.2f",wheelTempRatio);
	                        }
	                        html += "</strong>";
                    	}
                        html += "</div>";

                        return html;
                    },
                    tooltipAxes: 'y',
                    showMarker: false
                },
              cursor:{ 
                show: false,
                zoom: false, // Zoom works except that the x-axis tics don't update because we render them. 
                showTooltip: false
              },
	    	  axes: {
	    		xaxis: {
	    		  label: "Axle",
	    		  pad: 1.2,
	    		  tickOptions: { formatString: '%d' },
	    		  tickInterval: computeLinePlotTickInterval(maxAxle),
	    		  min: 0,
	    		  ticks: xAxisTicks
	    		  // syncTicks: true
	    		  // numberTicks: temperatureLineChartData.length
	    		},
	    		yaxis: {
	    		  label: "Temperature",
	    		  min: 0,
	    		  max: 900
//			    		  syncTicks: true
	              // tickOptions: {formatString: '%f' }
	    		}
	          }
	     };
	}
	
	function buildTemperatureLineChartSeriesOptions() {
		return [ 
                {
			label : 'LEFT:Raw Wheel Temp',
			suppress : false,
			color : "#1947D1",
			markerOptions : {
				show : true,
				style : 'square', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 6,
				shadow : false
			}
		}, {
			label : 'RIGHT:Raw Wheel Temp',
			suppress : false,
			color : "#FF0000",
			markerOptions : {
				show : true,
				style : 'filledSquare', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 5,
				shadow : false
			}
		}, {
			label : 'Mean Wheel Temperature',
			showLine : true,
			suppress : false,
			color : "#FFCC00",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		},

		{
			label : 'Predicted Wheel Temp.: LEFT',
			showLine : true,
			showMarker : false,
			suppress : false,
			color : "#669900",
			rendererOptions : {
				smooth : false
			},
			markerOptions : {
				show : false,
				style : "x"
			}
		}, {
			label : '30% Predicted Wheel Temp:LEFT',
			showLine : true,
			showMarker : false,
			linePattern : 'dashed',
			shadow : false,
			suppress : false,
			color : "#669900",
			rendererOptions : {
				smooth : true
			},
			markerOptions : {
				show : false,
				style : "x"
			}
		}, {
			label : 'Predicted Wheel Temp.: RIGHT',
			showLine : true,
			showMarker : false,
			suppress : false,
			color : "#6699FF",
			rendererOptions : {
				smooth : false
			},
			markerOptions : {
				show : false,
				style : "x"
			}
		}, {
			label : '30% Predicted Wheel Temp.: RIGHT',
			showLine : true,
			showMarker : false,
			linePattern : 'dashed',
			shadow : false,
			suppress : false,
			color : "#6699FF",
			rendererOptions : {
				smooth : true
			},
			markerOptions : {
				show : false,
				style : "x"
			}
		},

		{
			label : 'Loco Raw Wheel Temp.: LEFT',
			showLine : false,
			shadow : false,
			suppress : false,
			color : "#000000",
			markerOptions : {
				show : true,
				style : 'x', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 6,
				shadow : false
			}
		}, {
			label : 'Loco Raw Wheel Temp.: RIGHT',
			showLine : false,
			shadow : false,
			suppress : false,
			color : "#000000",
			markerOptions : {
				show : true,
				style : 'x', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 4,
				shadow : false
			}
		},

		{
			label : 'Car Average Wheel Temp',
			showLine : false,
			shadow : false,
			suppress : true,
			color : "#663300",
			markerOptions : {
				show : true,
				style : 'filledSquare', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 2,
				shadow : false
			}
		}, {
			label : '30 degrees Car Avg. Wheel Temp.',
			showLine : true,
			shadow : false,
			linePattern : 'dashed',
			suppress : true,
			color : "#663300",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Normalized Wheel Temp: LEFT',
			suppress : true,
			color : "#1947D1",
			markerOptions : {
				show : true,
				style : 'circle', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 6,
				shadow : false
			}
		}, {
			label : 'Normalized Wheel Temp: RIGHT',
			suppress : true,
			color : "#FF0000",
			markerOptions : {
				show : true,
				style : 'filledCircle', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 5,
				shadow : false
			}
		},

		{
			label : 'Mean + 3sigma Wheel: LEFT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#6600FF",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Mean - 3sigma Wheel: LEFT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#6600FF",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Mean + 3sigma Wheel: RIGHT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#FF0066",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Mean - 3sigma Wheel: RIGHT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#FF0066",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Bearing Temp: LEFT',
			suppress : false,
			color : "#000066",
			markerOptions : {
				show : true,
				style : 'square', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 6,
				shadow : false
			}
		}, {
			label : 'Bearing Temp : RIGHT',
			suppress : false,
			color : "#A00000",
			markerOptions : {
				show : true,
				style : 'filledSquare', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 5,
				shadow : false
			}
		}, {
			label : 'Bearing KValue: LEFT',
			showLine : false,
			shadow : false,
			suppress : true,
			color : "#990066",
			markerOptions : {
				show : true,
				style : 'filledSquare', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 3,
				shadow : false
			}
		}, {
			label : 'Bearing KValue: RIGHT',
			showLine : false,
			shadow : false,
			suppress : true,
			color : "#FF33FF",
			markerOptions : {
				show : true,
				style : 'filledSquare', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				size : 3,
				shadow : false
			}
		}, {
			label : 'Mean Bearing Temp : LEFT',
			showLine : true,
			suppress : false,
			color : "#FF9933",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Mean Bearing Temp : RIGHT',
			showLine : true,
			suppress : false,
			color : "#00FF66",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Left Bearing Quartile1 : LEFT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#2266FF",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Right Bearing Quartile1 : RIGHT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#FF3300",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Left Bearing Quartile2 : LEFT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#66CC00",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Right Bearing Quartile2 : RIGHT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#DD00DD",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Left Bearing Quartile3 : LEFT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#9966CC",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}, {
			label : 'Right Bearing Quartile3 : RIGHT',
			showLine : true,
			linePattern : 'dashed',
			suppress : true,
			color : "#CC3300",
			markerOptions : {
				show : true,
				style : 'diamond', // circle, diamond, square, filledCircle, filledDiamond or filledSquare.
				shadow : false
			}
		}
	                   
	                   
	                   
	          ];
	}
	
	return {
		displayTemperatureLineChart:displayTemperatureLineChart
	};

	
			
})();
	