assetHealthApp.controller('WaysideErrorAnalysisCtrl',['$scope','$http','$filter','UserData', 'ServiceLocations', '$q',
                             function($scope,$http,$filter, userData, serviceLocations, $q) {
	
	$scope.retrievingSitesFlag=true;
	$scope.searchPerformed=false;
	$scope.retrievingErrorRecordsFlag=false;
	$scope.canSubmit=false;
	$scope.recordCount=0;
	$scope.sites = [];	
	var entities = null;
	$scope.dateFormat = 'MM/dd/yyyy HH:mm:ss';

	$scope.checkCanSubmit = function() {
		console.log("checkCanSubmit");
		console.log($scope.detectorInfo != null);
		console.log($scope.fromDateCal.date != null);
		console.log($scope.toDateCal.date != null);
		
		$scope.canSubmit = $scope.detectorInfo && $scope.detectorInfo.ownerDetectorId && $scope.fromDateCal.date && $scope.toDateCal.date;
	}
	

	
//	var permissions = userData.permissions;
//	for(var v in permissions)
//	{
//		console.log("permissions[v] = " + v + " --> " + permissions[v]);
//	}
//	console.log("permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) --> " + permissions.hasOwnProperty(ROLE_DETECTOR_OWNER));
//	console.log("permissions[ROLE_DETECTOR_OWNER] --> " + permissions[ROLE_DETECTOR_OWNER]);
//	console.log("permissions['AHDRGOWNER'] --> " + permissions['AHDRGOWNER']);
	
	/*
	 * Check permissions and set company mark.
	 */
	var ROLE_DETECTOR_OWNER = "AHDRGOWNER";
	if (userData.permissions.hasOwnProperty("AHDRGOWNER")) {
		entities = userData.permissions["AHDRGOWNER"]; // TODO This role should be a constant defined somewhere
	}
	
	// Default to first entity. This should be the only one anyway.
	var companyMark = entities[0]; 
	
	/*
	 * ***** GET SITES *****
	 * Retrieve a list of sites and store in $scope.sites
	 */
	var timestamp= new Date().getTime(); // passing timestamp to make sure browser does not pull the data from the cache.
	
	// temporary workaround for localhost.
	// TODO: change this back to the above line before committing
	var detectorFetchUrl = serviceLocations.detectorServicesBase + 'main/secure/';
//	var detectorFetchUrl = 'http://localhost:8380/ah-detector-registration-ui/' + 'main/secure/';
	
	if('RAIL' == companyMark)
	{
		detectorFetchUrl = detectorFetchUrl + 'findAllDetectors/' + companyMark+'/'+timestamp;
	}
	else
	{
		detectorFetchUrl = detectorFetchUrl + 'detectorSummary/' + companyMark+'/'+timestamp;
	}
	
	$http.get(detectorFetchUrl)	
		.success(function(data) {
			$scope.retrievingSitesFlag=false;
			$scope.sites = data.result;
			
		})
		.error(function(input){
			$scope.retrievingSitesFlag=false;
			$scope.sites = [];
		});
	
	$scope.handleSubmit = function() {
		
		$scope.submitted = true;
		$scope.retrievingErrorRecordsFlag=true;
		$scope.canSubmit = false;
		$scope.transactionData = null;
		
		$scope.findRecordCount()
		.then(function(data) {

			$scope.recordCount = data;
			$scope.largeResultFlag = $scope.recordCount > 200;
			
			if(!$scope.largeResultFlag)
			{
				$scope.getResults();
			}
			
			$scope.retrievingErrorRecordsFlag=false;
			$scope.searchPerformed=true;
			$scope.canSubmit=true;
			});
		};
	
	$scope.findRecordCount = function() {
		var fetchUrl = serviceLocations.detectorServicesBase + 
//		'ah-detector-registration-ui/' + // localhost workaround. TODO: remove this line before committing
	   'main/secure/transaction/errorCount' +
	   '?companyDetectorId=' + $scope.detectorId +
	   '&messageDateStart=' + $filter('date')($scope.fromDateCal.date, $scope.dateFormat) +
	   '&messageDateEnd=' + $filter('date')($scope.toDateCal.date, $scope.dateFormat) +
	   (companyMark == 'RAIL' ? '' : ('&companyMark=' + companyMark))
	   ;
		$scope.countUrl = fetchUrl;
		var deferred = $q.defer();
		$http.get(fetchUrl)
		.success(function(data){
			deferred.resolve(data.bigDecimalList[0]);
		})
		.error(function(input){
			deferred.resolve(-1);
		});	
		return deferred.promise;
	};
	
	$scope.getResults = function() {
		
		$scope.retrievingErrorRecordsFlag=true;
		$scope.canSubmit = false;
		
		var fetchUrl = serviceLocations.detectorServicesBase + 
//		'ah-detector-registration-ui/' + // localhost workaround. TODO: remove this line before committing
	   'main/secure/transaction/errors' +
	   '?companyDetectorId=' + $scope.detectorId +
	   '&messageDateStart=' + $filter('date')($scope.fromDateCal.date, $scope.dateFormat) +
	   '&messageDateEnd=' + $filter('date')($scope.toDateCal.date, $scope.dateFormat) +
	   (companyMark == 'RAIL' ? '' : ('&companyMark=' + companyMark))
	   ;
		
		return $http.get(fetchUrl)
		.success(function(data){
			$scope.transactionData = data;
			$scope.isTransactionData = !$.isEmptyObject(data);
			$scope.transactionList = data.transactionList;
			
			$scope.retrievingErrorRecordsFlag=false;
			$scope.canSubmit = true;
		})
		.error(function(input){
			$scope.transactionData = 'failed to obtain transaction data';
			$scope.retrievingErrorRecordsFlag=false;
			$scope.canSubmit = true;
		});	
	};
	
	$scope.exportData = function() {
		$scope.exportingDataFlag = true;
		// If data is already client-side, just export it
		if($scope.transactionData)
		{
			var csvTxt = $scope.JSON2CSV($scope.transactionData.waysideErrorAnalysisRecordList);
			var blob = new Blob([csvTxt], {type: "text/plain;charset=utf-8"});
			saveAs(blob, 'saveFileName.txt');
		}
		// Otherwise, get records directly from the server
		else
		{
			$scope.retrievingErrorRecordsFlag=true;
			$scope.canSubmit = false;
			
			var fetchUrl = serviceLocations.detectorServicesBase + 
//			'ah-detector-registration-ui/' + // localhost workaround. TODO: remove this line before committing
		   'main/secure/transaction/errorsCsv' +
		   '?companyDetectorId=' + $scope.detectorId +
		   '&messageDateStart=' + $filter('date')($scope.fromDateCal.date, $scope.dateFormat) +
		   '&messageDateEnd=' + $filter('date')($scope.toDateCal.date, $scope.dateFormat) +
		   (companyMark == 'RAIL' ? '' : ('&companyMark=' + companyMark))
		   ;
			window.open(fetchUrl, '_blank', '');
		}			
		$scope.retrievingErrorRecordsFlag=false;
		$scope.canSubmit = true;
		$scope.exportingDataFlag = false;
	}
	
	$scope.JSON2CSV = function(objArray) {
	    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

	    var str = '';
	    var line = '';

	    // add column headers
        str =  'Trainpass Timestamp, Error Code, Error Description, Processing Timestamp\r\n';

	    for (var i = 0; i < array.length; i++) {
	        var line = '';

            for (var index in array[i]) {
                var value = array[i][index] + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }

	        line = line.slice(0, -1); // trim last comma
	        str += line + '\r\n';
	    }
	    return str;
	}	
}]);