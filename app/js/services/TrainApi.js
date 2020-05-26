assetHealthApp.service('TrainApi',['$http','$q', 'ServiceLocations', function($http, $q, serviceLocations){
	
	var querySites = function(next){
		var deferred = $q.defer();
		var sites = [{"name": "Durham, NC","id": "Durham"}]; 
		deferred.resolve(sites);
		return deferred.promise;
	}
	
	var queryTrains = function(siteId, next){
		var deferred = $q.defer();
		siteId = siteId || '';
		if(siteId == ''){
			deferred.resolve([]);
		}else{			
			$http.get(serviceLocations.equipmentHealthServicesContextPath + '/equipment/health/summaries/stations/' + siteId,{cache:true})
			  .success(function(result) {
			  	deferred.resolve(result.groupSummary || []);
		 	 })
		}
		return deferred.promise;
	}
	
	var queryTrainEquipment = function(trainId, next){
		var deferred = $q.defer();
		trainId = trainId || '';
		if(trainId == ''){
			deferred.resolve([]);
		}else{
		  $http.get(serviceLocations.equipmentHealthServicesContextPath + '/equipment/groups/' + trainId,{cache:true})
		    .success(function(result) {
		    	deferred.resolve(result.equipId || []);
	 	   })
		}
		return deferred.promise;
	}

	
	return{
		sites: querySites,
		trains: queryTrains,
		trainEquipment: queryTrainEquipment
	}
	
}]);