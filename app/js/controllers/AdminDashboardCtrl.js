assetHealthApp.controller('AdminDashboardCtrl',['$scope' , '$http', 'UserData', 'ServiceLocations', function($scope, $http, userData, serviceLocations){

	var hosts = serviceLocations.hostNames.split(',');
	var numHosts = hosts.length;
	var urlList = new Array(numHosts);
	for(var i = 0; i < numHosts; i++){
		urlList[i] = hosts[i] + 
		serviceLocations.dataSummaryAppRoot + 
		serviceLocations.dataSummaryContextPath;
	}

	$scope.hostNames = serviceLocations.hostNames;
	$scope.urlList = urlList;	

	$http.get('global/version')
	.success(function(data){
		$scope.svnData = data.trim().split('\n');	
	})
	.error(function(input){
		$scope.svnData = 'error loading version info'.split('\n');
	});
}]);