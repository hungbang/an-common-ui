assetHealthApp.controller('SwipableEquipmentListCtrl',['$scope','SiteModel','EquipmentApi','$filter','$http', function($scope, siteModel, equipmentApi, $filter, $http) {
	var today = new Date(); 
		
	$scope.site = siteModel;
	
	$scope.selectedEquipmentIndex = siteModel.getEquipmentIndex(
      siteModel.selectedTrain,
      siteModel.selectedEquipment
	);
	
	$scope.isSelectedEquipment = function(equipment){
	  return equipment === siteModel.selectedEquipment;
	};
	
	$scope.$watch('selectedEquipmentIndex',function(){
		if(siteModel.selectedTrain && siteModel.selectedTrain.equipment){
		  var equipment = siteModel.selectedTrain.equipment[$scope.selectedEquipmentIndex]
		  siteModel.setSelectedEquipment(equipment);
		  loadEquipmentData(equipment);
		}
	});
	
	$scope.$on("siteModel::selectedEquipmentUpdated",function(event,equipment){
		if(equipment == null){
			$scope.selectedEquipmentIndex = 0;
		}else{
			$scope.selectedEquipmentIndex = siteModel.getEquipmentIndex(
				siteModel.selectedTrain,
				siteModel.selectedEquipment
			);
		}
	});
	
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