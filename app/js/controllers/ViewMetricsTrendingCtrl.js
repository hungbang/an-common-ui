assetHealthApp.controller('ViewMetricsTrendingCtrl',['$scope', '$filter', '$http', 'UserData', 'ServiceLocations', function($scope, $filter, $http, userData, serviceLocations){

	$scope.filters = [];

	$scope.dateFormat = 'dd-MMM-yyyy';
	
	$scope.metricsDateFrom='';
	$scope.metricsDateTo='';
	$scope.markName='';
	$scope.metricsData='';	
	$scope.tPatameter='';
	$scope.retrievingTrendingDataFlag = false;
	$scope.foundDataFlag = false;

	$scope.parameter=['Passed Messages','Failed Messages','Total Messages','Size Of Message','Elapsed Time'];
	
	
	$scope.ajaxDataRenderer = function() {
	
		var fromDate=$filter('date')($scope.metricsDateFrom, $scope.dateFormat);
		var toDate=$filter('date')($scope.metricsDateTo, $scope.dateFormat);
		var markName=$scope.markName;	
		var tParameter=$scope.tParameter.charAt(0).toLowerCase() + $scope.tParameter.substring(1).replace(/\s/g, ""); 
		$scope.retrievingTrendingDataFlag = true;
		var fetchUrl = serviceLocations.detectorServicesBase+'main/secure/aeidq/matrixtrending?fromDate='+fromDate+'&toDate='+toDate+'&markName='+markName+'&matrixParameter='+tParameter;
		var ret = [];
		var max=0;
		$http.get(fetchUrl)
		.success(function(data){
			//get JSON resultset
			$scope.metricsData = data.result;
			$scope.retrievingTrendingDataFlag = false;
			if($scope.metricsData.length > 0) {
				$scope.foundDataFlag = true;
				//create data array for jqplot
				for(var i=0;i<$scope.metricsData.length;i++) {
					ret.push([$scope.metricsData[i].matrixDate,$scope.metricsData[i].parameterValue]);
					if($scope.metricsData[i].parameterValue > max) {
						 max = $scope.metricsData[i].parameterValue;
					}				
				}
				
				//plot the graph
				$('#metrics-chart').empty();
				  var plot1 = $.jqplot('metrics-chart',[ret], {     
				      axes:{
				        xaxis:{
				          renderer:$.jqplot.DateAxisRenderer,
				          tickInterval:computeDaysBetween($filter('date')($scope.metricsDateFrom, 'yyyy-MM-dd'), $filter('date')($scope.metricsDateTo, 'yyyy-MM-dd')),
				          label:'Date Range',
				          rendererOptions:{
			                    tickRenderer:$.jqplot.CanvasAxisTickRenderer
			                },			          
				          tickOptions:{
			                    fontSize:'10pt',
			                    fontFamily:'Tahoma',
			                    angle:-30
			                }			          
				        },
				        yaxis:{
					          min: 0,
					          max:max,				     
					          pad: 1.2,
					          label:$scope.tParameter,
					          tickOptions: { formatString: '%d' },
				    		  tickInterval: Math.floor(max/10),
				    		  ticks: computeLinePlotTicks(Math.floor(max/10), max),
					          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
					          rendererOptions:{
				                    tickRenderer:$.jqplot.CanvasAxisTickRenderer},
					          tickOptions: {
			                        fontSize:'10pt',
			                        fontFamily:'Tahoma',
					          },
					          showTicks: true,
					          showTickMarks: true,				          
					        }			        
				        },
				        series:[{lineWidth:4, markerOptions:{style:'square'}}],
				        cursor:{
				        	zoom:true,
				        	show: true, 
				        }			  
				  });
			} else {$('#metrics-chart').empty();$scope.foundDataFlag = false;}
			
		})
		.error(function(input){
			alert('failed');
		});

	  };
	  
	// jqPlot's ticks are not being computed attrerly so we override here using the 
		// tick interval plus a little extra on the end so that the last point doesn't 
		// fall on the border of the chart.
		function computeLinePlotTicks(interval, maxNum) {
			var tickValue = 0;
			var ticks = [];
			var upperBound = maxNum + interval;
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

		//Splice up the date range into 20 ticks
		//the following function will calculate the tick to date range.
		function computeDaysBetween(fromDate, toDate) {
			// First we split the values to arrays date1[0] is the year, [1] the month and [2] the day
			var fromD = fromDate.split('-');
			var toD = toDate.split('-');
	
			// Now we convert the array to a Date object, which has several helpful methods
			var d1 = new Date(fromD[0], fromD[1], fromD[2]);
			var d2 = new Date(toD[0], toD[1], toD[2]);
	
			var tv1 = d1.valueOf();
			var tv2 = d2.valueOf();

			var timeDifferenceInDays = (tv2 - tv1) / 1000 / 86400;
			timeDifferenceInDays = Math.round(timeDifferenceInDays - 0.5);

			return Math.ceil(timeDifferenceInDays/20) + " day";
		}
			  
}]);
