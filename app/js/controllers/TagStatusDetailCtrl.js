assetHealthApp.controller('TagStatusDetailCtrl', ['$scope','$http','ServiceLocations',function($scope, $http, serviceLocations) {

			$scope.submitted = true;
			var ind = 0;
			var csvContent = "";
			
			$scope.headers = [ 'Tag Status', 'Tag Details Status',
					'Tag Status Description' ];
			$scope.data = [];
			var fetchUrl = serviceLocations.detectorServicesBase
					+ 'main/secure/aeidq/tagstatusdetail';
			$scope.fetchUrl = fetchUrl;
			$scope.finalData = [];
			
			$http.get(fetchUrl).success(function(data) {
				$scope.transactionData = data.objectList;
				$scope.isTransactionData = data.objectList.length > 0;
				var head = $scope.transactionData[0].split(",");
				for (var i = 0; i < head.length; i++) {
					$scope.headers.push(head[i] + " Percent");
				}
				$scope.transactionData[0] = null;
				$scope.sortArray(4);
			}).error(function(input) {
				$scope.transactionData = 'failed to obtain transaction data';
			});
			
			$scope.sortArray = function(index) {
				csvContent = "";
				ind = index;
				var arr = new Array($scope.transactionData.length);
				for (var i = 1; i < $scope.transactionData.length; i++) {
					arr[i - 1] = new Array($scope.transactionData[i].length);
					for (var j = 0; j < $scope.transactionData[i].length; j++) {
						if ($scope.transactionData[i][j] == null) {
							arr[i - 1][j] = 0.0000;
						} else {
							arr[i - 1][j] = $scope.transactionData[i][j];
						}
					}
				}
				arr.sort(function(a, b) {
					return b[ind] - a[ind];
				});
				//form csv content
				$scope.finalData = arr;
				$scope.exportCSV(arr);
			};
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

		} ]);