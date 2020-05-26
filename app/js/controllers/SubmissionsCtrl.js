assetHealthApp.controller('SubmissionsCtrl',['$scope','UserData','$filter','$http','ServiceLocations',function($scope, UserData, $filter, $http, serviceLocations) {
	$scope.submissions = [];
	$scope.pendingRequest = true;
	$scope.submissionSearch = null;
	$scope.selectedSubmission = null;;
	$http.get(serviceLocations.transactionContextPath + '/transactions?includeEntries=true&limit=100&offset=0&userid=' + UserData.userId).success(
	  function(result) {
		  var filter = $filter('transactionToSubmission');
		  angular.forEach(result.transactionList,function(value){
		    this.push(filter(value));	  
		  },$scope.submissions);
		  $scope.pendingRequest = false;
	  }
	);
	$scope.setSelectedSubmission = function(submission){
		$scope.selectedSubmission = submission;
	};
}]);