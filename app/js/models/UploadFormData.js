assetHealthApp.factory('UploadFormData',function(){
	  return {
	      formTarget: "",
	      eventTargetMap: [
	        {"event": "Line of Road Failure", "target": "/ah-equipment/main/secure/lineOfRoadFailureUpload"},
	        {"event": "Class I Inspection", "target":"/ah-equipment/main/secure/class1InspectionUpload"}
	      ],
	      response: {}
	  };
	});