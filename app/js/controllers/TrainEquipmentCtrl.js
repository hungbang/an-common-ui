assetHealthApp.controller('TrainEquipmentCtrl',['$scope','$location','SiteModel','EquipmentApi','$filter','$http', function($scope, $location, siteModel, equipmentApi, $filter, $http) {
	
	if(!siteModel.hasSelectedTrain()){
		$location.path("/dashboard");
	}
	
	$scope.site = siteModel;
	
	$scope.today = new Date();
	
	$scope.equipmentSelected = function(equipment){
		$location.path("/equipmentList");
		siteModel.setSelectedEquipment(equipment);
		loadEquipmentData(equipment);
	};
	
	$scope.deselectEquipment = function(){
		siteModel.setSelectedEquipment({});
	}
	
	$scope.isSelectedEquipment = function(equipment){
	  return equipment === siteModel.selectedEquipment;
	};
	
	var loadEquipmentData = function(equipment){
		var promise = equipmentApi.healthRecord(equipment.equipInitial + equipment.equipNumber);
		var filter = $filter('healthRecordParsingFilter');
		promise.then(function(healthRecord){
		    equipment.characteristics = healthRecord.characteristics;
		    equipment.health.details = filter(healthRecord.healthRecordDetails.healthRecord);
		  }
		);
	}
	
}]);