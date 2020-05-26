assetHealthApp.service('EquipmentApi',['$http','$q', 'ServiceLocations', function($http,$q,serviceLocations){
	
	var queryHealthSummaries = function(equipmentIds){
		var deferred = $q.defer();
		equipmentIds = equipmentIds || '';
		if(equipmentIds == ''){
			deferred.resolve([]);
		}else{
			$http.get(serviceLocations.equipmentHealthServicesContextPath + '/equipment/health/summaries/' + equipmentIds,{cache:true} )
		      .success(function(result) {
			    deferred.resolve(result.healthSummary || [])
	 	      }
		    );
		}
		return deferred.promise;
	}
	
	var queryRecord = function(equipmentId){
		var deferred = $q.defer();
		equipmentId = equipmentId || '';
		if(equipmentId == ''){
			deferred.resolve({});
		}else{
			$http.get(serviceLocations.equipmentHealthServicesContextPath + '/equipment/health/records/' + equipmentId,{cache:true})
		      .success(function(result) {
			    deferred.resolve(result.healthRecord || {})
	 	      }
		    );
		}
		return deferred.promise;
	}
	
	var queryLineOfRoadFailures = function(equipmentId, daysLimit, next){
		$http.get(serviceLocations.trainEventContextPath + '/lineofroadfailures?days=' + daysLimit + '&equipmentid=' + equipmentId,{cache:true})
		.success(function(result) {
			next(result.v1LineOfRoadFailureEventList || []);
		});
	}
	
	return{
		healthSummaries: queryHealthSummaries,
		healthRecord: queryRecord,
		lineOfRoadFailures: queryLineOfRoadFailures
	}
	
}]);