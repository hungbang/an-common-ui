assetHealthApp.controller('ViewMetricsCtrl',['$scope', '$filter', '$http', 'UserData', 'ServiceLocations', function($scope, $filter, $http, userData, serviceLocations){

	$scope.filters = [];

	$scope.dateFormat = 'MM/dd/yyyy HH:mm:ss';
	$scope.hstep = 1;
	$scope.mstep = 1;
	
	$scope.filterDate='';
	$scope.markName='';
	
	$scope.getResults = function() {
		$scope.submitted = true;

		var params = '';
		var filterDate = $scope.filterDate;
		var markName = $scope.markName;
		var fetchUrl ='';
		var paramChar = params == '' ? '?' : '&';
		if(filterDate && filterDate != '') {
			params += paramChar+'matrixDate' + '=' +  $filter('date')(filterDate, $scope.dateFormat);
		}
		var paramChar = params == '' ? '?' : '&';
		if(markName && markName != '') {
			params += paramChar+'markName' + '=' + markName;
		}
		if((markName && markName != '') || (filterDate && filterDate != '')) {
			fetchUrl = serviceLocations.detectorServicesBase+'main/secure/aeidq/matrix'+params;
		} else {
			fetchUrl = serviceLocations.detectorServicesBase+'main/secure/aeidq/allmatrix';
		}
		$scope.fetchUrl = fetchUrl;

		$http.get(fetchUrl)
		.success(function(data){
			$scope.transactionData = data;
			$scope.isTransactionData = data.aeiSubmissionMatrixList.length > 0;
		})
		.error(function(input){
			$scope.transactionData = 'failed to obtain transaction data';
		});	 
	};
	
	

}]);
