assetHealthApp.service('TrainEventApi',['$http', 'ServiceLocations', function($http, serviceLocations){
	
	var postEventXml = function(xmlData){
		var response = {
          status: null
		}
		var xsrf = $.param({trainEventXML:xmlData});
		return $http({
		  method: 'POST',
		  url: serviceLocations.trainEventContextPath + '/trainEventSubmission',
		  data: xsrf,
		  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).then(function(data) {
		    return {status:202}; //accepted
		});
	};

	return{
		reportEvent: postEventXml
	};
}]);