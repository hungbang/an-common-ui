assetHealthApp.controller('UploadCtrl',['$scope' , 'UserData', 'UploadFormData', function($scope,userData,UploadFormData){
  $scope.userData = userData;

  $scope.uploadFormData = UploadFormData;

  $scope.reset = function() {
	 //
  }

  $scope.submitted = function(content, completed) {
    if (completed) {
      $scope.uploadFormData.response = content;
    }
  }
}]);