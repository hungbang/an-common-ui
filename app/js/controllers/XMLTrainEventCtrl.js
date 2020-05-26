assetHealthApp.controller('XMLTrainEventCtrl',['$scope','TrainEventApi', function($scope,$trainEventApi) {
	
	$scope.xml = "";
	
	$scope.xmlError = null;
	
	$scope.submittedSuccessfully = null;
	
	$scope.reset = function(){
      $scope.xml = "";
      $scope.submittedSuccessfully = null;
	};
	
	$scope.submitEvent = function(){
      $trainEventApi.reportEvent($scope.xml).then(function(response){
        if(response.status == 202){
           $scope.submittedSuccessfully = true;
           $scope.xml = '';
        }else{
           $scope.submittedSuccessfully = false;
        }
      });
	};
	
}]);