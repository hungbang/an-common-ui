assetHealthApp.factory('UploadDetectorFormData',['ServiceLocations',function(serviceLocations){
	  return {
	      formTarget: "",
	      eventTargetMap: [
	        {"event": "Detector Upload", "target": (serviceLocations.detectorServicesBase+"main/secure/detectorsUpload")}
	      ],
	      response: {}
	  };
	}]);