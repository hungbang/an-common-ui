assetHealthApp.controller('UploadDetectorCtrl',['$scope' , 'UserData', 'UploadDetectorFormData', function($scope,userData,UploadDetectorFormData){
  $scope.userData = userData;
  $scope.UploadDetectorFormData='';
  $scope.UploadDetectorFormData = UploadDetectorFormData;
  
  $scope.reset = function() {
	 //
  }

  $scope.submitted = function(content, completed) {
    if (completed) {
      $scope.UploadDetectorFormData.response = content;
    }
  }
  
  $scope.closeWindow = function(){
	  $scope.UploadDetectorFormData.response.success=false;
	  $scope.UploadDetectorFormData.response.error=false;
	  $scope.UploadDetectorFormData.response.error=false;
	  $scope.UploadDetectorFormData.formTarget='';
	  $scope.file='';
	 
	  angular.forEach(
			    angular.element("input[type='file']"),
			    function(inputElem) {
			      angular.element(inputElem).val(null);
			    });
	  
	  if(getInternetExplorerVersion()!=-1)
		  {
		  clearFileInputField("clearFlag");
	      }
	  
	  location.href = "#/assethealth";
	 
  };
}]);

function clearFileInputField(tagId) {
    document.getElementById(tagId).innerHTML =
        document.getElementById(tagId).innerHTML;
    }


function getInternetExplorerVersion()
	//Returns the version of Windows Internet Explorer or a -1
	//(indicating the use of another browser).
	{
	var rv = -1; // Return value assumes failure.
	if (navigator.appName == 'Microsoft Internet Explorer')
	{
	   var ua = navigator.userAgent;
	   var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	   if (re.exec(ua) != null)
	      rv = parseFloat( RegExp.$1 );
	}
	return rv;
}
