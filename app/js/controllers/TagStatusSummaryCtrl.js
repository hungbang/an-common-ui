assetHealthApp.controller('TagStatusSummaryCtrl',['$scope', '$http', 'ServiceLocations', function($scope, $http, serviceLocations){

		var fetchUrl = serviceLocations.detectorServicesBase+'main/secure/aeidq/tagstatussummary';
		$scope.fetchUrl = fetchUrl;
		
		var csvContent = "";		
		$scope.headers = [ 'Tag Status', 'Tag Details Status','Tag Status Description','Record Count','Percentage' ];

		$http.get(fetchUrl)
		.success(function(data){
			$scope.transactionData = data.objectList;
			$scope.isTransactionData = data.objectList.length > 0;
			$scope.exportCSV($scope.transactionData);
		})
		.error(function(input){
			$scope.transactionData = 'failed to obtain transaction data';
		});

		//TODO : Port this to directive
		$scope.exportCSV = function(arr) {
			$scope.headers.forEach(function(headArray, index){
				   dataString = headArray;
				   csvContent += dataString + ",";
			}); 
			csvContent += "\n";			
			arr.forEach(function(infoArray, index){
				   dataString = infoArray.join(",");
				   csvContent += dataString + "\n";
			});
			var fileName = "export.csv";
			var link = document.getElementById("download");
			if (link.download !== undefined) { // feature detection
			    // Browsers that support HTML5 download attribute
			    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			    var url = URL.createObjectURL(blob);            
			    link.setAttribute("href", url);
			    link.setAttribute("download", fileName);
			}				
			
			if (navigator.msSaveBlob) { // IE 10+
				   link.addEventListener("click", function (event) {
				     var blob = new Blob([csvContent], {
				       "type": "text/csv;charset=utf-8;"
				     });
				   navigator.msSaveBlob(blob, fileName);
				  }, false);
				}			
		};
		
		
}]);
