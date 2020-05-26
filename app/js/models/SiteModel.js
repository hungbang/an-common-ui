assetHealthApp.service('SiteModel',['$rootScope', function($rootScope){
	  return {
		dataPending: false,
		selectedTrain: null,
		selectedEquipment: null,
		trains:[],
		setDataPending: function(isPending){
		  this.dataPending = isPending;
		},
	    setTrains: function(trains){
	      this.trains = trains;
	    },
		setSelectedTrain: function(train){
		  this.selectedTrain = train;
		  $rootScope.$broadcast('siteModel::selectedTrainUpdated', train);
		},
		hasSelectedTrain:function(){
		  return this.selectedTrain != null;
		},
		setTrainEquipment: function(train,equipment){
		  train.equipment = equipment;
		},
		getEquipmentIndex: function(train,equipment){
			var equipments = train.equipment;
			for(var i = 0;i < equipments.length;i++){
				if(equipments[i] === equipment){
					return i;
				}
			}
			return 0;
		},
		setSelectedEquipment: function(equipment){
	      this.selectedEquipment = equipment;
	      $rootScope.$broadcast('siteModel::selectedEquipmentUpdated', equipment);
		},
		reset: function(){
			this.selectedTrain = null;
			this.selectedEquipment = null;
			this.trains = [];
		}
	 }
}]);