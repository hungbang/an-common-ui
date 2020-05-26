var ROLE_DETECTOR_OWNER = "AHDRGOWNER";

assetHealthApp.controller('DetectorUploadResultsCtrl',['$scope','$http', 'UserData', 'ServiceLocations', function($scope,$http, userData, serviceLocations) {
	$scope.fileList = [];
	$scope.fileSpinner=true;
	var permissions = userData.permissions;
	var entities = null;
	
	if (permissions.hasOwnProperty(ROLE_DETECTOR_OWNER)) {
		entities = permissions[ROLE_DETECTOR_OWNER]; // TODO This role should be a constant defined somewhere
	}

	if (entities == null || entities.length == 0) {
		$scope.fileList = [];
		// TODO Do additional error handling. Maybe display a message?
		return;
	}
	
	// Default to first entity. This should be the only one anyway.
	var companyMark = entities[0]; 
	
	$http.get(serviceLocations.detectorServicesBase+'main/secure/detectorsRegistrationStatusList/' + companyMark)
		.success(function(data) {
			$scope.fileSpinner=false;
			$scope.fileList = data.result;
			
		})
		.error(function(input){
			$scope.fileSpinner=false;
			$scope.fileList = [];
		});
	
	
	$scope.getFileDetails = (function(){
		var jobId=$scope.fileItem.jobInstanceId;
		$scope.fileDetails=[];
		$scope.fileDetailsFlag=true;
		$scope.fileDetailsSpinner=true;

		if(jobId!=null && jobId!=''){
	        $http.get(serviceLocations.detectorServicesBase+'main/secure/detectorRegistrationLineItemList/' + jobId)
	        .success(function(data) {
	        	$scope.fileDetailsSpinner=false;
	               if(data.result.length>0){
	            	   $scope.fileDetails=data.result;
	                  }
	               else{
	            	   
	               }
	        })
	        .error(function(input){
	        $scope.fileDetailsSpinner=false;   
	        });
		}
		else{
			$scope.fileDetailsSpinner=false;
		}
       
	});
	
		
}]);