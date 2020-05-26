assetHealthApp.controller('DetectorRegHistoryCtrl',['$scope','$http','UserData','$routeParams','ServiceLocations', function($scope, $http,userData, $routeParams, serviceLocations) {
	var permissions = userData.permissions;
	var entities = null;
	if (permissions.hasOwnProperty(ROLE_DETECTOR_OWNER)) {
		entities = permissions[ROLE_DETECTOR_OWNER]; // TODO This role should be a constant defined somewhere
	}
	if (entities == null || entities.length == 0) {
		$scope.sites = [];
		// TODO Do additional error handling. Maybe display a message?
		return;
	}
	// Default to first entity. This should be the only one anyway.
	$scope.detectorId = $routeParams.detectorId;
	$scope.detectorName = $routeParams.detectorName;
	
	$http.get(serviceLocations.detectorServicesBase+'main/secure/detectorHistory/' + $scope.detectorId +'/'+$scope.detectorName +'/'+'EOU')
     .success(function(data) {
        $scope.detector = data.result.changeList;
        $scope.detectorName = data.result.detectorName;
        $scope.firstRecord= $scope.detector[$scope.detector.length-1];
        $scope.firstRecord.hideLink=true;
        $scope.detector[$scope.detector.length-1]=$scope.firstRecord;
        
        for (var i=0;i<$scope.detector.length;i++){
        	$scope.detector[i].id=i;        	
        }
    });
	
	
	/*
	 * Get previous detector History details 
	 */
	$scope.getRegisterHistoryDetailPrevious = function(){
		$scope.getRegisterHistoryDetail($scope.detector[$scope.previousIndex],$scope.previousRowIndex);
    };


	/*
	 * Get next detector History details 
	 */
    $scope.getRegisterHistoryDetailNext = function(){
    	$scope.getRegisterHistoryDetail($scope.detector[$scope.nextIndex],$scope.nextRowIndex);
    };
    
    
   
        
	
	$scope.getRegisterHistoryDetail = function(record,index){
		SortUtil.getSortOrder(index,"registerHistoryDetailTable","regHistoryFilterLength","regHistoryRecordId",$scope);
		$http.get(serviceLocations.detectorServicesBase+'main/secure/detectorDetails/' + record.detectorId+'/'+record.effectiveTs+'/'+ record.expirationTs )
        .success(function(data) {
            $scope.selectedDetector = data.result;
            $scope.detectorSiteName = record.detectorName;
        });
    };
	
	$scope.getHistoryChangesDetail = function(record){
		$http.get(serviceLocations.detectorServicesBase+'main/secure/detectorDetails/' + record.detectorId+'/'+record.updatedOninMilli )
        .success(function(data) {
            $scope.selectedDetector = data.result.changeList;
            $scope.detectorChangeName = record.detectorName;
            $scope.message = data.result.message;
            $scope.success = data.result.success;
        });
    };

}]);