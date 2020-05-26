assetHealthApp.controller('EquipQueryCtrl',['$scope','EquipmentData','$http', 'ServiceLocations', function($scope, EquipmentData, $http, serviceLocations) {
	
	$scope.equipmentData = EquipmentData;
	
	$scope.getEquipment = function(data){ 
		data.resultList = []; //clear results
		data.searchPerformed = false;
		var equipments = data.searchText.split(",");
		angular.forEach(equipments,function(equipment){
			
			equipment = equipment.replace(/[^0-9a-zA-Z]/g, ''); //trim it up
			
			data.pendingRequests++; //not good, probably a listener available in angular
			
			$http.get(serviceLocations.equipmentContextPath + '/equipment/' + equipment)
			.success(function(result) {
				data.searchPerformed = true;
				data.pendingRequests--;//not good, probably a listener available in angular
				var v1 = result.v1Equipment;
				//this should be cleaned up, dirty 'null'string poorly indicates health info blocked 
				if(v1.healthSummary && v1.healthSummary.rawUdeCount == null){
					v1.healthSummary = angular.extend({},v1.healthSummary,{rawUdeCount:'hidden',trainCount:'hidden',railroadCount:'hidden'});
				}
				data.resultList.push(v1);
			})
			.error(function(input){
				data.searchPerformed = true;
				data.pendingRequests--;//not good, probably a listener available in angular
			});
		});
	};

	$scope.setFocus = function(equipment){
		equipment.lineOfRoadFailures = [];
		equipment.inspections = [];
		$scope.focus = equipment;
		//fetch line of road failures
		$http.get(serviceLocations.trainEventContextPath + '/lineofroadfailures?days=90&equipmentid=' + equipment.initial + equipment.number )
		.success(function(result) {
			equipment.lineOfRoadFailures = result.v1LineOfRoadFailureEventList;
		});
		//fetch class one inspections
		$http.get(serviceLocations.trainEventContextPath + '/inspections?days=90&equipmentid=' + equipment.initial + equipment.number)
		.success(function(result) {
			equipment.trainInspections = result.v1ClassOneInspectionList;
		});
		//fetch ABT inspection data
		$http.get(serviceLocations.equipmentContextPath + '/equipment/' + equipment.initial + equipment.number + '/inspections?type=ABT')
		.success(function(result) {
			equipment.inspections = result.v1EquipmentInspectionList;
		});
	};
}]);