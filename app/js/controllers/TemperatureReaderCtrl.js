var ROLE_DETECTOR_OWNER = "AHDRGOWNER";

assetHealthApp.controller('TemperatureReaderCtrl',['$scope', '$rootScope', '$http','UserData', 'ServiceLocations', function($scope, $rootScope, $http, userData, serviceLocations) {
	$scope.debug_performance = true;
	
	
//	$scope.temperaturePlotBuffer = BufferManager.newBuffer();
	
	$scope.sites = [];
	$scope.trainPassData=[];
	$scope.selectedTrainPassIndex = 0;
	$scope.retrievingSitesFlag=true;
	$scope.trainPassDetailFlag=false;
	$scope.trainPassDataTableFlag=false;
	$scope.trainPassStatsTableFlag=false;
	$scope.annotationsFlag=false;
	$scope.annotationHelpFlag=false;
	$scope.graphHelpFlag=false;
	$scope.freq_graphHelpFlag=false;
	$scope.trainPassFrequencyDistributionFlag=false;
	$scope.trainPassDataMainFlag=false;
	$scope.temperatureChartZoomed = false;
	var permissions = userData.permissions;
	var entities = null;
	$scope.userMarkFlag = false;
	$scope.currentChartData = null;
	$scope.userMarks=[];

	$scope.detectorTrainPassAssesmentRequestFormFactory = function() {
		var detectorTrainPassAssesmentRequestFormTemplate = 
		   {"eventId": '', 
			"userName": ''+userData.userId+'', 
			"dataQualityCode": '',
			"trainDynamicsCode": '', 
			"outlierTypeCode": '',
			"detectorHealthCode": '',
			"detectorIssueCode": '', 
			"assessmentText": '', 
			"dataIssueCode": ''
		   };
		var createNew = function() {
			return jQuery.extend({}, detectorTrainPassAssesmentRequestFormTemplate);
		};
		
		return {createNew:createNew};
	}();


	$scope.userAnnotationDataFactory = function() {
		var userAnnotationDataTemplate = {annotationCode: '', annotationCodeTranslation: '', assessmentText: '', dirty: false};
		var createNew = function() {
			return jQuery.extend({}, userAnnotationDataTemplate);
		};
		return {createNew:createNew};
	}();
	
	$scope.detectorTrainPassAssesmentRequestForm = null;
	
	if (permissions.hasOwnProperty(ROLE_DETECTOR_OWNER)) {
		entities = permissions[ROLE_DETECTOR_OWNER]; // TODO This role should be a constant defined somewhere
	}

	if (entities == null || entities.length == 0) {
		$scope.sites = [];
		// TODO Do additional error handling. Maybe display a message?
		return;
	}
	
	$scope.getDetectorSites = (function(companyMark){
		$('#temperature-chart').empty();
//		$('#temperature-frequency-chart').empty();
		$scope.retrievingSitesFlag=true;
		//var siteId=$scope.detectorEventType;
	 	$scope.sites = [];
		$scope.trainPassData=[];
		$scope.frequencyChartFlag=false;
		$('#trainPassDetailId').hide();
		$('#staticTable').hide();
		$('#img_annotationDecision').hide();
		$scope.dataFlag=false;		
		
		$scope.trainPassDataMainFlag=false;
		$scope.retrievingTrainPassesFlag=false;
		$scope.trainPassDetailFlag=false;
		
		var timestamp= new Date().getTime(); // passing timestamp to make sure browser does not pull the data from the cache.
		$http.get(serviceLocations.detectorServicesBase+'main/secure/axleReadDetector/' +companyMark+'/'+timestamp)
		.success(function(data) {
			$scope.retrievingSitesFlag=false;
			$scope.sites = data.result;

		})
		.error(function(input){
			$scope.retrievingSitesFlag=false;
			$scope.sites = [];
		});

	});
	
	// Default to first entity. This should be the only one anyway.
	//$scope.companyMark = entities[0]; 
	if($rootScope.isAdminAndITUiEnable){		
		$http.get(serviceLocations.detectorServicesBase+'main/secure/getAllCompanyMarks')
		.success(function(data) {
			//$scope.userMarkFlag =true;
			$scope.userMarks  = data.result;
			if($scope.userMarks.length >0){
				$scope.userMarkFlag =true;
				$scope.companyMark = $scope.userMarks[0];
			}
			else{
				$scope.userMarkFlag=false;
				$scope.companyMark = entities[0];
			}
			$scope.getDetectorSites($scope.companyMark);	
		})
		.error(function(input){
			$scope.userMarkFlag=false;
			$scope.userMarks = [];
		});
	}
	else{
		$scope.userMarkFlag=false;
		$scope.companyMark = entities[0];
		$scope.getDetectorSites($scope.companyMark);
	}
	
	/*
	 * Register handler for key press. There are three cases for handling keys pressed:
	 *  1) Focus is in annotationCode field. In this case append the char for the key to the field unless
	 *     it is a navigation key or zoom key, in which case the character for the key is not appended
	 *     to the field and is instead processed accordingly.  
	 *  2) Focus is in annotationText field. In this case append the char for the key to the field.
	 *  3) Focus is elsewhere. In this case ignore all keys except for next, previous, and zoom and 
	 *     react accordingly 
 	 */
	var registerKeyPressHandler = function() {
		
		var isNextNavigationKey = function(keyCode) {return keyCode==190;};
		var isPreviousNavigationKey = function(keyCode) {return keyCode==188;};
		var isZoomKey = function(keyCode) {return keyCode==90;};
		var isZoomXAxisKey = function(keyCode) {return keyCode==88;};
		var isZoomYAxisKey = function(keyCode) {return keyCode==89;};
		var isHelpKey = function(keyCode) {return keyCode==191;};
		var isSpecialKey = function(keyCode) {return keyCode==190 || keyCode==188 || keyCode==88 || keyCode==89 || keyCode==90 || keyCode == 191;};
		var isFocusOnAnnotationCodeEntryField = function() {return $('#annotationCode').is(":focus");};
		var isFocusOnAssessmentTextEntryField = function() {return $('#assessmentText').is(":focus");};
		
		var handleSpecialKey = function(keyCode) {
			if (isPreviousNavigationKey(keyCode)) {
		    	$("#selectPreviousTrainPass").click();
		    } else if (isNextNavigationKey(keyCode)) {
		    	$("#selectNextTrainPass").click();
		    } else if (isZoomKey(keyCode)) {
		    	$scope.toggleZoomTemperatureChart();
		    } else if (isZoomXAxisKey(keyCode)) {
		    	$scope.toggleZoomXAxisTemperatureChart();
		    }else if (isZoomYAxisKey(keyCode)) {
		    	$scope.toggleZoomYAxisTemperatureChart();
		    } else if (isHelpKey(keyCode)) {
		    	$scope.toggleHelp();
		    }
		};
		
		var acceptAnnotationCode = function(keyCode) {
			if (!$scope.trainPassDataItem) {return;}
			$scope.trainPassDataItem.userAnnotationData.dirty = true;
			// First synchronize from current value in document because some keys like backspace may have updated
			// the state of the field without coming through this code.
			$scope.trainPassDataItem.userAnnotationData.annotationCode = $scope.getAnnotationCodeFromDocument();

//			$scope.trainPassDataItem.userAnnotationData.annotationCode += String.fromCharCode(keyCode);
//			$scope.updateAnnotationCodeInDocument();
			$scope.handleUserAnnotationCodeUpdate($scope.trainPassDataItem.userAnnotationData.annotationCode);
		};
		
		var rejectAnnotationCode = function() {
			if (!$scope.trainPassDataItem) {return;}
			$scope.updateAnnotationCodeInDocument();
		};
		
		var acceptAssessmentText = function(keyCode) {
			if (!$scope.trainPassDataItem) {return;}
			$scope.trainPassDataItem.userAnnotationData.dirty = true;
//			$scope.trainPassDataItem.userAnnotationData.assessmentText += String.fromCharCode(keyCode);
			$scope.trainPassDataItem.userAnnotationData.assessmentText = $scope.getAssessmentTextFromDocument();
//			$scope.updateAssessmentTextInDocument();
		};
		
		var onDocumentKeyUp = function(event) {
			var keyCode = (event.keyCode ? event.keyCode : event.which);
			
//			alert(keyCode +' | Ctrl: '+event.ctrlKey+' | Alt: '+event.altKey+' Code focus: '+isFocusOnAnnotationCodeEntryField()+', Text focus: '+isFocusOnAssessmentTextEntryField()); 
//			return false;
			if (isFocusOnAnnotationCodeEntryField()) {
				if (isSpecialKey(keyCode)) {
					rejectAnnotationCode();
					handleSpecialKey(keyCode);
				} else {
					acceptAnnotationCode(keyCode);
				}
			} else if (isFocusOnAssessmentTextEntryField()) {
				acceptAssessmentText(keyCode);
			} else if (isSpecialKey(keyCode)) {
				handleSpecialKey(keyCode);
			}
			
			// Consider this keypress event already handled 
			// so no need to propagate.
			return false;
		  };


		var doc = $(document);
		doc.off('keyup.temperatureReader'); // Deregister event handler first before registering 
		// NOTE: Must use keyup because keypress does not work because we miss characters like backspace.
		doc.on('keyup.temperatureReader', onDocumentKeyUp);
	}();
	
	/*
	 * ***** GET SITES *****
	 * Retrieve a list of sites and store in $scope.sites
	 */
/*	$scope.getDetectorSites = (function(companyMark){
		var timestamp= new Date().getTime(); // passing timestamp to make sure browser does not pull the data from the cache.
		$http.get(serviceLocations.detectorServicesBase+'main/secure/axleReadDetector/' +companyMark+'/'+timestamp)
		.success(function(data) {
			$scope.retrievingSitesFlag=false;
			$scope.sites = data.result;

		})
		.error(function(input){
			$scope.retrievingSitesFlag=false;
			$scope.sites = [];
		});

	});*/
	/*
	 * **** GET TRAIN PASSES FOR SELECTED SITE ****
	 * Retrieve a list of train passes, storing results in $scope.trainPassData
	 */
	$scope.getTrainPassData = (function(){
		
		// Save old annotation data, if any, before replacing with new annotation data.
		$scope.saveUserAnnotation();
	
		$('#temperature-chart').empty();
//		$('#temperature-frequency-chart').empty();

		//var siteId=$scope.detectorEventType;
		$scope.trainPassData=[];
		$scope.frequencyChartFlag=false;
		$('#trainPassDetailId').hide();
		$('#staticTable').hide();
		$('#img_annotationDecision').hide();
		$scope.dataFlag=false;		
		displayText("dataTable","Show Calculated Data");
		displayText("frequencyChart","Show Frequency Chart");
		displayText("trainPassStatsTable","Show Train Stats");
		displayText("annotations","Show Annotations");
		
		$scope.trainPassDataMainFlag=true;
		$scope.retrievingTrainPassesFlag=true;
		$scope.trainPassDetailFlag=false;

		if($scope.detectorEventType){

	        $http.get(serviceLocations.detectorServicesBase+'main/secure/axleReadTrainID/' + $scope.detectorEventType.carrierDetectorId+'/'+$scope.detectorEventType.eventTypeCode)
	        .success(function(data) {
	        	$scope.retrievingTrainPassesFlag=false;
	               if(data.result.length > 0) {
	            	   $scope.trainPassData = data.result;
	            	   $scope.selectedTrainPassIndex = 0;
	            	   $scope.adjustTrainPassSelectionIndices();
	            	   $scope.selectFirstTrainPass();
	               }
	               else{
	            	   
	               }
	        })
	        .error(function(input){
	        	$scope.retrievingTrainPassesFlag=false;   
	        });
		}
		else{
			$scope.retrievingTrainPassesFlag=false;
		}
       
	});
	
	// **************************** BEGIN TRAIN PASS INDEX RELATED UTILITIES ***************************
	
	/*
	 * Return index selected train pass ($scope.trainPassDataItem) within all train passes ($scope.trainPassData)
	 */
	$scope.getTrainPassIndex = function() {
		var trainPassDataItem = $scope.trainPassDataItem;
		
		var trainPasses = $scope.trainPassData;
		for(var i = 0;i < trainPasses.length;i++){
			if(trainPasses[i] === trainPassDataItem){
				return i;
			}
		}
		return 0;
	};
	
	/*
	 * Set the current train pass index and make adjustments accordingly 
	 */
	$scope.selectCurrentTrainPassIndex = function(index) {
		$scope.selectedTrainPassIndex = index;
		$scope.trainPassDataItem = $scope.trainPassData[index];
		$scope.adjustTrainPassSelectionIndices();
	};
	
	$scope.transitionToTrainPassIndex = function(index) {
		$scope.saveUserAnnotation();
		
		// Invalidate current user annotation for train pass data item to force update on next display.
		$scope.invalidateCurrentUserAnnotationData();
		
		$scope.selectCurrentTrainPassIndex(index);
		$scope.displayTrainPass(true);
	};
	
	/*
	 * Adjust selectedTrainPassIndexPrev and selectedTrainPassIndexNext based on the index of selectedTrainPassIndex to 
	 * accurately point to the next and previous indices in the list of train passes.
	 */
	$scope.adjustTrainPassSelectionIndices = function(){
		if ($scope.trainPassData.length==1){
			$scope.selectedTrainPassIndex = 0;
			$scope.selectedTrainPassIndexPrev = 0;
			$scope.selectedTrainPassIndexNext = 0;
			
		}
		else if ($scope.selectedTrainPassIndex == 0){
			$scope.selectedTrainPassIndexPrev=$scope.trainPassData.length-1;
			$scope.selectedTrainPassIndexNext=$scope.selectedTrainPassIndex +1;
		}
		else if ($scope.selectedTrainPassIndex == $scope.trainPassData.length-1){
			$scope.selectedTrainPassIndexPrev=$scope.selectedTrainPassIndex-1;
			$scope.selectedTrainPassIndexNext=0;
		}
		else{
			$scope.selectedTrainPassIndexPrev=$scope.selectedTrainPassIndex-1;
			$scope.selectedTrainPassIndexNext=$scope.selectedTrainPassIndex +1;
		}
	};

	// **************************** BEGIN INFORMATION DISPLAY UTILITIES ***************************
	
	/*
	 *	Display Next Train Pass Details on button Click
	 */
	$scope.displayNextTrainPass = function() {
		$scope.transitionToTrainPassIndex($scope.selectedTrainPassIndexNext);
	};	
	
	/*
	 *	Display Previous Train Pass Details on button Click
	 */
	$scope.displayPreviousTrainPass = function(){
		$scope.transitionToTrainPassIndex($scope.selectedTrainPassIndexPrev);
	};
	
	//Toggle graphHelp for wheel Temperature chart
	$scope.toggleGraphHelp = function(){
		if($scope.graphHelpFlag){
			$('#graphHelp').hide();
			$scope.graphHelpFlag=false;
		}
		else{
			$('#graphHelp').show();
			$scope.graphHelpFlag=true;
		}
		
	};
	
	
	//Toggle freq_graphHelp for frequency Distribution chart
	$scope.toggleFrequencyGraphHelp = function(){
		if($scope.freq_graphHelpFlag){
			$('#freq_graphHelp').hide();
			$scope.freq_graphHelpFlag=false;
		}
		else{
			$('#freq_graphHelp').show();
			$scope.freq_graphHelpFlag=true;
		}
		
	};
	
	
	$scope.toggleHelp = function(){
		if($scope.annotationHelpFlag){
			$('#staticTable').hide();
			$('#img_annotationDecision').hide();
			$scope.annotationHelpFlag= false;
		}
		else{
			$('#staticTable').show();
			$('#img_annotationDecision').show();
			$scope.annotationHelpFlag= true;
		}	
	};
	

	$scope.selectFirstTrainPass = function() {
		$scope.transitionToTrainPassIndex(0);
	};
	
	/*
	 * Entry point for selecting train pass from list control 
	 */
	$scope.handleSelectTrainPass = function() {
		// Save previous user annotation, if any, before transitioning to selected train pass. 
		// Selected index still points to previous item so use that.
		var currentTrainPassDataItem = $scope.getCurrentTrainPassDataItemByIndex();
		$scope.saveUserAnnotation(currentTrainPassDataItem);
		
		// Train pass data item has already been updated by angular framework.
		$scope.transitionToTrainPassIndex($scope.getTrainPassIndex($scope.trainPassDataItem));
	};
	
	/*
	 *	Display the currently selected train pass
	 */
	$scope.displayTrainPass = function(includeWritableData) {
		$scope.trainPassDetailFlag=true;
		var eventGuid = $scope.trainPassData[$scope.selectedTrainPassIndex].eventGuid;
		$scope.eventGuid = eventGuid;
		
		if($scope.trainPassData.length > 0) {
			var dataItem = $scope.trainPassDataItem;
			var index = $scope.selectedTrainPassIndex;
			
			$scope.displayTrainPassPlotPoints(index, dataItem, eventGuid);
			$scope.displayTrainPassStatsTable($scope.trainPassStatsTableFlag, index, dataItem, eventGuid);
			$scope.displayTrainPassTableData($scope.trainPassDataTableFlag, index, dataItem, eventGuid);
			$scope.displayTrainPassFrequencyChart($scope.trainPassFrequencyDistributionFlag, index, dataItem, eventGuid);
			
			if (includeWritableData) {
				$scope.displayUserAnnotationData($scope.annotationsFlag,index, dataItem, eventGuid);
			}
		};
	};
	
	/*
	 * Display train pass plot points in temperature-chart for the given index, data item and event
	 */
	$scope.displayTrainPassPlotPoints = function(index, trainPassDataItem, eventGuid) {
		$scope.getTrainPassPlotPoints(
				index, 
				function(_plotPoints) {
					trainPassDataItem.plotPoints = _plotPoints;
					$scope.renderPlotPoints();
					
					// Now force cache of next and previous charts
					$scope.preCacheCharts();
				},
				function(errorResult) {
					$('#temperature-chart').empty();
				}
		);
	};
	
	/*
	 * Toggle display of data table
	 */
	$scope.toggleTableDataDisplay = function() {
		$scope.trainPassDataTableFlag = !$scope.trainPassDataTableFlag;

		if($scope.trainPassDataItem) {
			$scope.displayTrainPassTableData($scope.trainPassDataTableFlag, $scope.selectedTrainPassIndex, $scope.trainPassDataItem, $scope.eventGuid);
		}
	};
	
	
	
	
	$scope.displayTrainPassTableData = function(show, index, trainPassDataItem, eventGuid) {
		if(show){
			displayText("dataTable","Hide Calculated Data");
			$('#trainPassDetailId').show();
			
			$scope.getChartData(
					index, 
					function(_chartData) {
						trainPassDataItem.chartData = _chartData;
						$scope.currentChartData = _chartData;
						
					},
					function(errorResult) {
						$scope.currentChartData = [];
					}
			);
			
			
		} else {
			displayText("dataTable","Show Calculated Data");
			$('#trainPassDetailId').hide();
		}
	};
	
	
	
	/*
	 * Toggle display of trainPassStats table
	 */
	$scope.toggleTrainPassStatsTableDisplay = function() {
		$scope.trainPassStatsTableFlag = !$scope.trainPassStatsTableFlag;

		if($scope.trainPassDataItem) {
			$scope.displayTrainPassStatsTable($scope.trainPassStatsTableFlag, $scope.selectedTrainPassIndex, $scope.trainPassDataItem, $scope.eventGuid);
		}
	};
	
	//Display trainPassStats
	$scope.displayTrainPassStatsTable = function(show, index, trainPassDataItem, eventGuid) {
		if(show){
			displayText("trainPassStatsTable","Hide Train Stats");
			$('#trainPassStats').show();
			
			$scope.getChartData(
					index, 
					function(_chartData) {
						trainPassDataItem.chartData = _chartData;
						$scope.currentChartData = _chartData;
					},
					function(errorResult) {
						$scope.currentChartData = [];
					}
			);			
		} else {
			displayText("trainPassStatsTable","Show Train Stats");
			$('#trainPassStats').hide();
		}
	};
	
	
	/*
	 * Toggle display of Annotations Data
	 */
	$scope.toggleAnnotationsDisplay = function() {
		$scope.annotationsFlag = !$scope.annotationsFlag;

		if($scope.trainPassDataItem) {
			$scope.displayUserAnnotationData($scope.annotationsFlag, $scope.selectedTrainPassIndex, $scope.trainPassDataItem, $scope.eventGuid);
		}
	};
	
	$scope.displayUserAnnotationData = function(show,index, trainPassDataItem, eventGuid) {
		if(show){
			displayText("annotations","Hide Annotations");
			$('#annotationsData').show();
			$scope.clearAnnotationFieldsInDocument(); // Clear out previous values
			var augmentUserAnnotations = function(annotations) {
				for (var i = 0; i < annotations.length; i++) {
					var annotation = annotations[i];
					annotation.annotationCode = $scope.extractAnnotationCodes(annotation);
					annotation.annotationCodeTranslation = 
						$scope.translateDetectorHealthCodes(annotation.annotationCode);
				}
			};
			
			var extractAnnotationForLoggedInUser = function(annotations) {
				for (var i = 0; i < annotations.length; i++) {
					if (userData.userId == annotations[i].userName) {
						return annotations[i];
					}
				}
				return $scope.userAnnotationDataFactory.createNew();
			};
			
			var extractAnnotationsExcludingLoggedInUser = function(annotations) {
				var result = []; 
				for (var i = 0; i < annotations.length; i++) {
					if (userData.userId != annotations[i].userName) {
						result.push(annotations[i]);
					}
				}
				return result;
			};

			// Get annotation data. This will either use the current, cached value or retrieve via service call.
			$scope.getUserAnnotationData(
					index, 
					function(userAnnotations) {
						augmentUserAnnotations(userAnnotations);
						var userAnnotationData = extractAnnotationForLoggedInUser(userAnnotations);
						trainPassDataItem.userAnnotations = userAnnotations;
						trainPassDataItem.userAnnotationData = userAnnotationData;
						trainPassDataItem.otherUserAnnotations = extractAnnotationsExcludingLoggedInUser(userAnnotations);
						$scope.trainPassDataItem.userAnnotationData.assessmentText = userAnnotationData.assessmentText;
						
						$scope.handleUserAnnotationCodeUpdate(userAnnotationData.annotationCode);
						
						$('#annotationCode').focus();
						
						$scope.updateAssessmentTextInDocument();
						
						// TODO Get rid of this
						$scope.updateAnnotationCodeTranslationInDocument(trainPassDataItem.userAnnotationData.annotationCodeTranslation);
					},
					function(errorResult) {
						trainPassDataItem.userAnnotationData = $scope.userAnnotationDataFactory.createNew();
						$scope.clearAnnotationFieldsInDocument();
					}
			);
		}
		else{
			displayText("annotations","Show Annotations");
			$('#annotationsData').hide();			
		}
		
	};
	
	/*
	 * Display translation of annotation codes into English via $scope variable bindings and update 
	 * form in anticipation of subsequent save during transition to next train pass. 
	 */
	$scope.handleUserAnnotationCodeUpdate = function(code) {
		var translation = $scope.translateDetectorHealthCodes(code);
		$scope.trainPassDataItem.userAnnotationData.annotationCodeTranslation = translation;	

		$scope.updateAnnotationCodeInDocument();
		$scope.updateAnnotationCodeTranslationInDocument(translation);
	};

	/*
	 * Toggle display of frequency distribution chart
	 */
	$scope.toggleFrequencyChartDisplay = function() {
		$scope.trainPassFrequencyDistributionFlag = !$scope.trainPassFrequencyDistributionFlag;
		
		if($scope.trainPassDataItem) {
			$scope.displayTrainPassFrequencyChart($scope.trainPassFrequencyDistributionFlag, $scope.selectedTrainPassIndex, $scope.trainPassDataItem, $scope.eventGuid);
		}
	};
	
	$scope.displayTrainPassFrequencyChart = function(show, index, trainPassDataItem, eventGuid){
		if(show){
			//document.getElementById("frequencyChart").innerHTML="Hide Frequency Chart";
			displayText("frequencyChart","Hide Frequency Chart");
			$('#temperature-frequency-chart').show();
			$('#temperature-frequency-chart').empty();
			
			$scope.getChartData(
					index, 
					function(_chartData) {
						trainPassDataItem.chartData = _chartData;
						
						$scope.currentChartData = _chartData;
						//console.log($scope.currentChartData);
						WheelTemperatureFrequencyDistributionChart.displayTemperatureFrequencyDistributionChart(eventGuid, _chartData, $scope);
					},
					function(errorResult) {
						WheelTemperatureFrequencyDistributionChart.displayTemperatureFrequencyDistributionChart(eventGuid, [], $scope);
					}
			);	
		}
		else {
			//document.getElementById("frequencyChart").innerHTML="Show Frequency Chart";
			displayText("frequencyChart","Show Frequency Chart");
			$('#temperature-frequency-chart').hide();
		}
		
	};
	
	/*
	 * Get train pass plot points for a given index and pass to the given complete callback.
	 * This will retrieve plot points from external services if they aren't already available locally. 
	 */
	$scope.getTrainPassPlotPoints = function(index, completeCallback, errorCallback){
		var plotPoints = $scope.trainPassData[index].plotPoints;
		
		if(plotPoints) {
			completeCallback(plotPoints);
		} else{
			$scope.retrievePlotPoints(index, completeCallback, errorCallback);
		}
	};
	
	$scope.getChartData = function(index, completeCallback, errorCallback){
		var chartData = $scope.trainPassData[index].chartData;
		
		if(chartData) {
			completeCallback(chartData);
		} else{
			$scope.retrieveChartData(index, completeCallback, errorCallback);
		}
	};
	
	$scope.getUserAnnotationData = function(index, completeCallback, errorCallback){
		var userAnnotations = $scope.trainPassData[index].userAnnotations;
		
		if(userAnnotations) {
			completeCallback(userAnnotations);
		} else{
			$scope.retrieveUserAnnotationData(index, completeCallback, errorCallback);
		}
	};	

	/*
	 * Retrieve plot points from external services, calling completeCallback passing plot points on completion.
	 */
	$scope.retrieveData = function(urlBase, index, completeCallback, errorCallback) {

		var trainPassDataItem = $scope.trainPassData[index];

		if(trainPassDataItem != null) {
			
			//var trainPassId = trainPassDataItem.trainPassId; 
			var transactionId = trainPassDataItem.eventGuid;

			$http.get(urlBase + transactionId)
				.success(function(response) {
					var data = response.result;
					if(data) {
						completeCallback(data);						
					} else{

					}
				}
			).error(function(errorResult){
				errorCallback(errorResult);
			});
		}
		else{

		}
	};
	
	$scope.retrievePlotPoints = function(index, completeCallback, errorCallback) {
		$scope.trainPassData[index].retrievingPlotDataFlag = true;
		$scope.retrieveData(serviceLocations.detectorServicesBase+'main/secure/detectorAxleReadPlotPoints/' + $scope.detectorEventType.eventTypeCode+'/', 
				index, 
				function(detectorAxleReadSummary) {
					$scope.trainPassData[index].retrievingPlotDataFlag = false;
					completeCallback(detectorAxleReadSummary);
				},
				function(errorResult) {
					$scope.trainPassData[index].retrievingPlotDataFlag = false;
					errorCallback(errorResult);
				});
	};
	
	$scope.retrieveChartData = function(index, completeCallback, errorCallback) {
		$scope.trainPassData[index].retrievingChartDataFlag = true;
		var detectorAxleReadSummary = $scope.retrieveData(serviceLocations.detectorServicesBase+'main/secure/detectorAxleReadSummary/' + $scope.detectorEventType.eventTypeCode+'/', 
				index, 
				function(detectorAxleReadSummary) {
					$scope.trainPassData[index].retrievingChartDataFlag = false;
					completeCallback($scope.buildChartData(detectorAxleReadSummary));
				},
				function(errorResult) {
					$scope.trainPassData[index].retrievingChartDataFlag = false;
					errorCallback(errorResult);
				});
	};
	
	$scope.retrieveUserAnnotationData = function(index, completeCallback, errorCallback) {
		$scope.trainPassData[index].retrievingUserAnnotationDataFlag = true;

		var userAnnotationData = $scope.retrieveData(serviceLocations.detectorServicesBase+'main/secure/detectorTrainPassAssessments/', 
				index, 
				function(userAnnotationData) {
					$scope.trainPassData[index].retrievingUserAnnotationDataFlag = false;
					completeCallback(userAnnotationData);
				},
				function(errorResult) {
					$scope.trainPassData[index].retrievingUserAnnotationDataFlag = false;
					errorCallback(errorResult);
				});
	};
	
	$scope.renderPlotPoints = function(){
		 $('#temperature-chart').empty();
		 if (!$scope.trainPassDataItem || !$scope.trainPassDataItem.plotPoints) {
			 return;
		 }
		 //console.log($scope.trainPassDataItem.plotPoints);
		 WheelTemperatureChart.displayTemperatureLineChart($scope.eventGuid, $scope.trainPassDataItem.plotPoints, $scope);
	};
	
	$scope.toggleZoomTemperatureChart = function() {
		var trainPassDataItem = $scope.getCurrentTrainPassDataItemByIndex();
		$scope.saveUserAnnotation(trainPassDataItem);
		
		if ($scope.temperatureChartZoomed) {
			$('#chartDetail').width('980px');
			$('#temperature-chart').height('486px');
		} else {
			$('#chartDetail').width('1960px');
			$('#temperature-chart').height('1458px');
		}
		$scope.temperatureChartZoomed = !$scope.temperatureChartZoomed;
		$scope.displayTrainPass(false);
	};
	
	/*$scope.toggleZoomXAxisTemperatureChart = function() {
		var trainPassDataItem = $scope.getCurrentTrainPassDataItemByIndex();
		$scope.saveUserAnnotation(trainPassDataItem);
		
		if ($scope.temperatureChartZoomed) {
			$('#chartDetail').width('980px');

		} else {
			$('#chartDetail').width('6000px');
		}
		$scope.temperatureChartZoomed = !$scope.temperatureChartZoomed;
		$scope.displayTrainPass(false);
	};
	
	$scope.toggleZoomYAxisTemperatureChart = function() {
		var trainPassDataItem = $scope.getCurrentTrainPassDataItemByIndex();
		$scope.saveUserAnnotation(trainPassDataItem);
		
		if ($scope.temperatureChartZoomed) {
			$('#temperature-chart').height('486px');
		} else {
			$('#temperature-chart').height('1200px');
		}
		$scope.temperatureChartZoomed = !$scope.temperatureChartZoomed;
		$scope.displayTrainPass(false);
	};*/
	/*
	 * Force pre-cache of next and previous charts
	 */
	$scope.preCacheCharts = function() {
		var nextIndex = $scope.selectedTrainPassIndexNext; 
		var prevIndex = $scope.selectedTrainPassIndexPrev;
		
		$scope.getTrainPassPlotPoints(
				nextIndex, 
				function(_plotPoints) {
					$scope.trainPassData[nextIndex].plotPoints = _plotPoints;
				},
				function(errorResult) {}
		);
	 		
		$scope.getTrainPassPlotPoints(
			prevIndex, 
			function(_plotPoints) {
				$scope.trainPassData[prevIndex].plotPoints = _plotPoints;
			},
			function(errorResult) {}
		);
	};
	
	displayText=function(id,value){
		document.getElementById(id).innerHTML=value;
	};
	
	$scope.columns = [
	                  { title: 'Equip', field: 'equipInitial', visible: true },
	                 /* { title: 'Equip Num', field: 'equipNumber', visible: true },*/
	                  { title: 'Equip Type', field: 'equipTypeCode', visible: true },
	                  { title: 'Train Axle Seq', field: 'axleId', visible: true },
	                  { title: 'Equip Axle Seq', field: 'equipAxleSeqNbr', visible: true },
	                  { title: 'Equip Orientation', field: 'equipOrientationCode', visible: true },
	                  { title: 'Left Wheel Temp', field: 'leftTemp', visible: true },
	                  { title: 'Right Wheel Temp', field: 'rightTemp', visible: true },
	                  { title: 'Left Norm Temp', field: 'leftNormTemp', visible: false },
	                  { title: 'Right Norm Temp', field: 'rightNormTemp', visible: false },
	                  { title: 'Left Predicted Temp', field: 'predictedWheelTemperatureLeft', visible: true },
	                  { title: 'Right Predicted Temp', field: 'predictedWheelTemperatureRight', visible: true },
	                  { title: 'Left Temp Ratio', field: 'predictedNormWheelTempLeft', visible: true },
	                  { title: 'Right Temp Ratio', field: 'predictedNormWheelTempRight', visible: true },
	                  { title: 'Left Z Score', field: 'leftWheelZScore', visible: false },
	                  { title: 'Right Z Score', field: 'rightWheelZScore', visible: false },
	                  { title: 'Left Bearing Temp', field: 'bearingTempLeft', visible: true },
	                  { title: 'Right Bearing Temp', field: 'bearingTempRight', visible: true },
	                  { title: 'Car Avg', field: 'carAvgTemp', visible: true },
	                  { title: 'Left Bearing KValue', field: 'bearingKValueLeft', visible: true },
	                  { title: 'Right Bearing KValue', field: 'bearingKValueRight', visible: true }
	              ];
		  
	$scope.buildChartData = function(detectorAxleReadSummary) {
		if(detectorAxleReadSummary.detectorAxleReadDataList.length > 0) {
			trainPassDetail= detectorAxleReadSummary.detectorAxleReadDataList;
		
			var normalMeanTem = detectorAxleReadSummary.rightSideNormalMeanTemperature;

			 if(trainPassDetail[0] != null) {
				var i=0;
				var axleReads = [];
				var wheelNormTempLeft;
				var wheelNormTempRight;
				var wheelTempLeft;
				var wheelTempRight;
				var leftZScore;
				var rightZScore;
				//var predictedWheelTemperature;
				var predictedWheelTemperatureLeft;
				var predictedWheelTemperatureRight;
				var predictedNormWheelTempLeft;
				var predictedNormWheelTempRight;
				var carAvgTemp;
				var bearingTempLeft;
				var bearingTempRight;
				var bearingKValueLeft;
				var bearingKValueRight;

				for(i=0; i < trainPassDetail.length; i++) {
					var wheelTemp = trainPassDetail[i].wheelTemp;
					var bearingTemp = trainPassDetail[i].bearingTemp;
					var wheelZScore = trainPassDetail[i].wheelZScore;
				    var wheelNormal = trainPassDetail[i].wheelNormalTemp;
					var axleSequence = trainPassDetail[i].trainAxleSeqNbr;
					var equipInitial = trainPassDetail[i].equipUnitInitCode;
					var equipNumber = trainPassDetail[i].equipUnitNbr;
					
					var equipAxleSeqNbr = trainPassDetail[i].equipAxleSeqNbr;
					var equipOrientationCode = trainPassDetail[i].equipOrientationCode;
					
					var predictedWheelTemperature = trainPassDetail[i].predictedWheelTemperature;
					var predictedNormWheelTemp = trainPassDetail[i].predictedNormWheelTemp;
					var bearingKValue = trainPassDetail[i].bearingKValue;
					
					carAvgTemp = trainPassDetail[i].carAvgTemp;
					
					if(trainPassDetail[i].carTypeCode=='R'){
						var equipTypeCode = 'CAR';
					}
					else if(trainPassDetail[i].carTypeCode=='D'){
						var equipTypeCode = 'LOCO';
					}
					else {
						var equipTypeCode = trainPassDetail[i].carTypeCode;
					}
	
					var trainSide = trainPassDetail[i].trainSideCode;
					
	
					if(i>0){
						var axleSequenceOld = trainPassDetail[i-1].trainAxleSeqNbr;
					}
					
					if(axleSequence != null) {
							 
						if(axleSequence != axleSequenceOld){
							wheelNormTempLeft = null;
							wheelNormTempRight = null;
							wheelTempLeft = null;
							wheelTempRight = null;
							bearingTempLeft=null;
							bearingTempRight=null;
							leftZScore = null;
							rightZScore=null;
							predictedWheelTemperatureLeft=null;
							predictedWheelTemperatureRight=null;
							predictedNormWheelTempLeft=null;
							predictedNormWheelTempRight=null;
							bearingKValueLeft= null;
							bearingKValueRight=null;
						}
							
						if(trainSide =='L'){
							wheelNormTempLeft = wheelNormal;
							wheelTempLeft = wheelTemp;
							bearingTempLeft=bearingTemp;
							leftZScore = wheelZScore;
							predictedWheelTemperatureLeft=predictedWheelTemperature;
							predictedNormWheelTempLeft=predictedNormWheelTemp;
							bearingKValueLeft=bearingKValue;
						} else if(trainSide =='R'){
							wheelNormTempRight = wheelNormal;
							wheelTempRight = wheelTemp;
							bearingTempRight=bearingTemp;
							rightZScore = wheelZScore;
							predictedWheelTemperatureRight=predictedWheelTemperature;
							predictedNormWheelTempRight=predictedNormWheelTemp;
							bearingKValueRight=bearingKValue;
						}
							 
						if(axleSequence == axleSequenceOld){
							var aDataOld = axleReads[axleReads.length-1];	
							aDataOld.leftNormTemp = wheelNormTempLeft;
							aDataOld.rightNormTemp = wheelNormTempRight;
							aDataOld.leftTemp=wheelTempLeft;
							aDataOld.rightTemp=wheelTempRight;
							aDataOld.leftBearingTemp=bearingTempLeft;
							aDataOld.rightBearingTemp=bearingTempRight;
							aDataOld.leftWheelZScore=leftZScore;
							aDataOld.rightWheelZScore=rightZScore;
							//aDataOld.predictedWheelTemperature = predictedWheelTemperature;
							aDataOld.predictedWheelTemperatureLeft = predictedWheelTemperatureLeft;
							aDataOld.predictedWheelTemperatureRight=predictedWheelTemperatureRight;
							aDataOld.predictedNormWheelTempLeft=predictedNormWheelTempLeft;
							aDataOld.predictedNormWheelTempRight=predictedNormWheelTempRight;
							aDataOld.carAvgTemp = carAvgTemp;
							aDataOld.leftBearingKValue=bearingKValueLeft;
							aDataOld.rightBearingKValue=bearingKValueRight;
						} else {
							var aDataNew ={};
							aDataNew.equipInitial=equipInitial;
							aDataNew.equipNumber=equipNumber;
							aDataNew.equipTypeCode=equipTypeCode;
							aDataNew.axleId = axleSequence;
							aDataNew.equipAxleSeqNbr = equipAxleSeqNbr;
							aDataNew.equipOrientationCode = equipOrientationCode;
							aDataNew.leftNormTemp = wheelNormTempLeft;
							aDataNew.rightNormTemp = wheelNormTempRight;
							aDataNew.meanTemp = normalMeanTem; 
							aDataNew.leftTemp=wheelTempLeft;
							aDataNew.rightTemp=wheelTempRight;
							aDataNew.leftBearingTemp=bearingTempLeft;
							aDataNew.rightBearingTemp=bearingTempRight;
							aDataNew.leftWheelZScore=leftZScore;
							aDataNew.rightWheelZScore=rightZScore;
							//aDataNew.predictedWheelTemperature = predictedWheelTemperature;
							aDataNew.predictedWheelTemperatureLeft = predictedWheelTemperatureLeft;
							aDataNew.predictedWheelTemperatureRight=predictedWheelTemperatureRight;
							aDataNew.predictedNormWheelTempLeft=predictedNormWheelTempLeft;
							aDataNew.predictedNormWheelTempRight=predictedNormWheelTempRight;
							aDataNew.carAvgTemp = carAvgTemp;
							aDataNew.leftBearingKValue=bearingKValueLeft;
							aDataNew.rightBearingKValue=bearingKValueRight;
							axleReads.push(aDataNew);
					   }
					}

				}
				
				
			}
			 
			return {detectorAxleReadSummary:detectorAxleReadSummary, axleReads:axleReads};
			
		} else{
			return null;
		}
	};
	



/* --------- Annotation functions -------------------- */
/*Save Annotation Data*/
	$scope.saveUserAnnotation = function(item){

		var trainPassDataItem = !item ?
				$scope.getCurrentTrainPassDataItemByIndex() :
				item;
		
		if (!trainPassDataItem) {
			return;
		}
		
		var userAnnotationData = trainPassDataItem.userAnnotationData;
		if (!userAnnotationData) {
			return;
		}
		
		if (!userAnnotationData.dirty) {
			return
		}
		
		var form = $scope.detectorTrainPassAssesmentRequestFormFactory.createNew();
		var code = userAnnotationData.annotationCode.toUpperCase();
		$scope.translateDetectorHealthCodes(code, form);
		
		delete form['text']; // We don't want to send this.
		delete form['valid']; // We don't want to send this.
		
		form.eventId = $scope.trainPassData[$scope.selectedTrainPassIndex].eventGuid;
		form.assessmentText = trainPassDataItem.userAnnotationData.assessmentText;
	
		var payload = JSON.stringify(form);
	    $.ajax({
	        type: 'POST',
	        url:  serviceLocations.detectorServicesBase+"main/secure/detectorTrainPassAssessment",
			contentType: "application/json; charset=utf-8",		
			data: payload,
			dataType: 'json',
	        async: true,
	        traditional : true,
	        success: function(result) {
	        	userAnnotationData.dirty = false;
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            alert(jqXHR.status + " " + jqXHR.responseText);
	        }
	    });
	};
    
//	$scope.detectorTrainPassAssesmentRequestForm = 
//	   {"eventId": '', 
//		"userName": ''+userData.userId+'', 
//		"dataQualityCode": '',
//		"trainDynamicsCode": '', 
//		"outlierTypeCode": '',
//		"detectorHealthCode": '',
//		"detectorIssueCode": '', 
//		"assessmentText": '', 
//		"dataIssueCode": ''
//	   };
	
	$scope.annotationCodeStateTreeChild = [
	                       		    {code: 'G', text:'Good',
	                       		    	children:[{code: 'B', text:'Braking', 
	                       		    				children:[
	                       				                {code: 'C', text:'Cold', 
	                       				                	acceptCode: function(form, input){form.outlierTypeCode = input;}}, 
	                       				                {code: 'H', text:'Hot',
	                       				                	acceptCode: function(form, input){form.outlierTypeCode = input;}}, 
	                       				                {code: 'B', text:'Both',
	                       				                	acceptCode: function(form, input){form.outlierTypeCode = input;}}, 
	                       				                {code: 'N', text:'None',
	                       				                	acceptCode: function(form, input){form.outlierTypeCode = input;}}], 
	                       				            acceptCode: function(form, input){form.trainDynamicsCode = input;},
	                       				            extractChildCode: function(assessment){return assessment.outlierTypeCode;}},
	                       			            {code: 'N', text:'Non-Braking', 
	                       			            	children:[
	                       			            	   {code: 'H', text:'Hot',
	                       			            		   acceptCode: function(form, input){form.outlierTypeCode = input;}}], 
	                       			            	acceptCode: function(form, input){form.trainDynamicsCode = input;},
	                       			            	extractChildCode: function(assessment){return assessment.outlierTypeCode;}},
	                       			            {code: 'P', text:'Partially', 
	                       			            	children:[
	                       				                {code: 'C', text:'Cold', 
	                       				                	acceptCode: function(form, input){form.outlierTypeCode = input;}}, 
	                       				                {code: 'H', text:'Hot',
	                       				                	acceptCode: function(form, input){form.outlierTypeCode = input;}}, 
	                       				                {code: 'B', text:'Both',
	                       				                	acceptCode: function(form, input){form.outlierTypeCode = input;}}, 
	                       				                {code: 'N', text:'None',
	                       				                	acceptCode: function(form, input){form.outlierTypeCode = input;}}],
	                       			            	acceptCode: function(form, input){form.trainDynamicsCode = input;},
	                       			            	extractChildCode: function(assessment){return assessment.outlierTypeCode;}},
	                       			            {code: 'U', text:'Unknown', 
	                       			                children:[
	                       			                    {code: 'H', text:'Hot',
	                       			                    	acceptCode: function(form, input){form.outlierTypeCode = input;}}], 
	                       			                acceptCode: function(form, input){form.trainDynamicsCode = input;},
	                       			                extractChildCode: function(assessment){return assessment.outlierTypeCode;}}
	                       			             ], 
	                       	             acceptCode: function(form, input){
	                       	            	 form.detectorHealthCode = 'G';
	                       	            	 form.dataQualityCode = input;},
	                       	             extractChildCode: function(assessment){return assessment.trainDynamicsCode;}
	                       		
	                       	       },
	                       	       {code: 'X', text:'Bad',
	                       	    	   children:[
	                           	             {code: 'A', text:'Alignment', 
	                           	            	 acceptCode: function(form, input){
	                           	            		 form.detectorHealthCode = 'B';
	                           	            		 form.detectorIssueCode = input;}}, 
	                           	             {code: 'T', text:'Technology', 
	                       	            		 acceptCode: function(form, input){
	                       	            			 form.detectorHealthCode = 'B';
	                       	            			 form.detectorIssueCode = input;}},
	                           	             {code: 'U', text:'Unknown', 
	                       	            		 acceptCode: function(form, input){
	                       	            			 form.detectorHealthCode = 'U';
	                       	            			 form.detectorIssueCode = input;}},
	                           	             {code: 'I', text:'Insufficient sample size', 
	                       	            		 acceptCode: function(form, input){
	                       	            			 form.detectorHealthCode = 'U';
	                       	            			 form.dataIssueCode = input;}},
	                       	            	 {code: 'N', text:'Noise', 
	    	                       	         	 acceptCode: function(form, input){
	    	                       	         		 form.detectorHealthCode = 'U';
	    	                       	         		 form.dataIssueCode = input;}}
	                       	    	   ],
	                       	    	   acceptCode: function(form, input){form.dataQualityCode = input;},
	                       	    	   extractChildCode: function(assessment){
	                       	    		   return assessment.detectorIssueCode ?
	                       	    				   assessment.detectorIssueCode :
	                       	    				   assessment.dataIssueCode;}
	                       	       },
	                       	       {code: 'U', text:'Unknown', 
	                       	    	   acceptCode: function(form, input){form.dataQualityCode = input;}}
	                       	    ];
	                       	    //acceptCode: function(form, input){},
	                       	    //extractChildCode: function(assessment){return assessment.dataQualityCode;}
	                       	//};

	
	$scope.annotationCodeStateTree= {code: 'root', children: [
	                                                          	{code:'N', text:'Normal',
	                                                          		children:$scope.annotationCodeStateTreeChild,
	                                                          		acceptCode: function(form, input){form.dataDistributionCode = input;},
	                                    				            extractChildCode: function(assessment){return assessment.dataQualityCode;}
	                                                        	  
	                                                          	},
	                                                          	{code:'L', text:'LogNormal',
	                                                          		children:$scope.annotationCodeStateTreeChild,
	                                                          		acceptCode: function(form, input){form.dataDistributionCode = input;},
	                                    				            extractChildCode: function(assessment){return assessment.dataQualityCode;}
	                                                        	  
	                                                          	},
	                                                          	{code:'S', text:'Scattered',
	                                                          		children:$scope.annotationCodeStateTreeChild,
	                                                          		acceptCode: function(form, input){form.dataDistributionCode = input;},
	                                    				            extractChildCode: function(assessment){return assessment.dataQualityCode;}
	                                                        	  
	                                                          	},
	                                                          	{code:'U', text:'Unspecified',
	                                                          		children:$scope.annotationCodeStateTreeChild,
	                                                          		acceptCode: function(form, input){form.dataDistributionCode = input;},
	                                    				            extractChildCode: function(assessment){return assessment.dataQualityCode;}
	                                                        	  
	                                                          	}
	                                                          ],
	                                                          acceptCode: function(form, input){},
	                                                  	    extractChildCode: function(assessment){return assessment.dataDistributionCode;}
	};
		
		

	
	/*
	 * Return the path through $scope.annotationCodeStateTree described by given codes. 
	 */
	$scope.extractPathForCodes = function(codes) {
		var path = [];
		
		var currentNode = $scope.annotationCodeStateTree;
		var valid = true;

		for (var i = 0, len = codes.length; i < len; i++) {
			if (valid) {
				var code = codes[i];
				if (currentNode != null) {
					currentNode = $scope.transitionToAnnotationCodeState(currentNode, code);
				}
				path.push(currentNode);
			}
		};
		
		return text;
	};
	
	/*
	 * Implementation of light-weight finite state machine to traverse 
	 * states embodied by $scope.annotationCodeStateTree based on a string of 
	 * assessment codes.
	 */
	$scope.traverseDetectorHealthCodes = function(codes, form) {
		var currentNode = $scope.annotationCodeStateTree;
		var text = '';
		form.valid = true;

		for (var i = 0, len = codes.length; i < len; i++) {
			var code = codes[i];
			var translation;
			if (currentNode != null) {
				currentNode = $scope.transitionToAnnotationCodeState(currentNode, code);
			}
			if (currentNode == null) {
				form.valid = false;
				translation = "Invalid:"+code+"";
			} else {
				translation = currentNode.text;
				if (currentNode.acceptCode) {
					currentNode.acceptCode(form, code);
				};
			};
			if (text == '') {
				text += translation;	
			} else {
				text += ' - '+translation;
			};
		};
		
		return text;
	};

	$scope.transitionToAnnotationCodeState = function(currentNode, nextCode) {
		if (!currentNode.children) {
			return null;
		}
		
		for ( var i = 0; i < currentNode.children.length; i++) {
			var prospectiveNode = currentNode.children[i];
			if (prospectiveNode["code"] == nextCode) {
				return prospectiveNode;
			}
		}
		
		return null;
	};
	
	$scope.translateDetectorHealthCodes = function(codes, inputForm) {
		form = inputForm ?
				inputForm :
				$scope.detectorTrainPassAssesmentRequestFormFactory.createNew();
		
		form.text = $scope.traverseDetectorHealthCodes(codes.toUpperCase(), form);
		
		return form.text;
	};
	
	/*
	 * Extract and return the annotation code from the assessment data
	 */
	$scope.extractAnnotationCodes = function(assessment) {
		var codes = '';
		var currentNode = $scope.annotationCodeStateTree;
		
		while (currentNode != null) {
			currentNode = $scope.traverseToNextAnnotationCode(assessment, currentNode);
			if (currentNode != null) {
				codes += currentNode.code;
			};
		};
		
		return codes;
	};
	
	$scope.traverseToNextAnnotationCode = function(assessment, node) {
		if (!node.extractChildCode) {
			return null;
		}

		var code = node.extractChildCode(assessment);

		if (node.children) {
			for (var i = 0; i < node.children.length; i++) {
				if (node.children[i].code == code) {
					return node.children[i]; 
				};
			};
		}
		
		return null;
		
	};
	
	$scope.getCurrentTrainPassDataItemByIndex = function() {
		if (('undefined' == typeof $scope.selectedTrainPassIndex) || !$scope.trainPassDataItem) {
			return;
		}
		
		return $scope.trainPassData[$scope.selectedTrainPassIndex];
	};
	
	/*
	 * Remove the current user annotation data.
	 */
	$scope.invalidateCurrentUserAnnotationData = function() {
		if ($scope.trainPassDataItem) {
			delete $scope.trainPassDataItem.userAnnotationData;
			delete $scope.trainPassDataItem.userAnnotations;
		}
	};
	
	$scope.updateAnnotationCodeInDocument = function() {
		$('#annotationCode').val($scope.trainPassDataItem.userAnnotationData.annotationCode);
	};
	
	$scope.updateAnnotationCodeTranslationInDocument = function(value) {
		$('#annotationCodeTranslation').html(value);
	};
	
	$scope.getAnnotationCodeFromDocument = function() {
		return $('#annotationCode').val();
	};
	
	$scope.updateAssessmentTextInDocument = function() {
		$('#assessmentText').val($scope.trainPassDataItem.userAnnotationData.assessmentText);
	};

	$scope.getAssessmentTextFromDocument = function() {
		return $('#assessmentText').val();
	};
	
	$scope.clearAnnotationFieldsInDocument = function() {
		$('#annotationCode').val('');
		$('#assessmentText').val('');
		$scope.updateAnnotationCodeTranslationInDocument('');
	};
	
}]);