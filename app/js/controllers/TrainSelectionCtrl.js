assetHealthApp.controller('TrainSelectionCtrl',['$scope','$location','LocationModel','SiteModel','TrainApi','EquipmentApi','$filter', function($scope, $location, locationModel, siteModel, trainApi, equipmentApi, $filter) {
	
	$scope.location = locationModel;
	
	$scope.site = siteModel;
	
	//initialize site list
	var promise = trainApi.sites();
	promise.then(function(sites){
	  locationModel.setSites(sites);
	});
	
	$scope.getSiteTrains = function(){
	  siteModel.reset();
	  siteModel.setDataPending(true);
	  var promise = trainApi.trains(locationModel.selectedSite);
	  promise.then(function(trains){
		var filter = $filter('trainSummaryFilter');
	    siteModel.setTrains(filter(trains));
	  }).then(function(){
		siteModel.setDataPending(false);
	  })
	}
	
		
	$scope.trainSelected = function(train){
		$location.path("/trainEquipment");
		siteModel.setSelectedTrain(train);
		siteModel.setSelectedEquipment(null);
		siteModel.setDataPending(true);
		var promise = trainApi.trainEquipment(train.trainId);
		promise.then(function(equipments){
			siteModel.setTrainEquipment(train,equipments);
		  }
	    ).then(function(){
			siteModel.setDataPending(false);
			angular.forEach(siteModel.selectedTrain.equipment,function(id){
			  var filter = $filter('equipmentHealthFilter');
			  var healthPromise = equipmentApi.healthSummaries(id.equipInitial + id.equipNumber);
			  healthPromise.then(function(healthSummaries){
				  id.health = filter(healthSummaries[0]); //only asked for 1
			  });
			});
		});
	};
	
	$scope.isSelectedTrain = function(train){
	  return train === siteModel.selectedTrain;
	};
	
}]);