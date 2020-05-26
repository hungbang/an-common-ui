assetHealthApp.controller('ResubmitSourceEventsCtrl', [ '$scope', '$filter',
		'$route', '$modal', '$http', 'UserData', 'ServiceLocations',
		function($scope, $filter, $route, $modal, $http, userData, serviceLocations) {

			$scope.filters = {};
			$scope.fetchUrl = '(none)';
			$scope.dateFormat = 'MM/dd/yyyy HH:mm:ss';
			$scope.filters.dt = new Date();
			$scope.bucketIds = [];
			$scope.showFailedCount = false;
			$scope.showResubmit = false;
			$scope.failedCount = 0;
			$scope.showGetCountError = false;
			$scope.getCountErrorMsg = "System Encoutered Some Errors When Getting Failed Source Events Count.";
			$scope.resubmitErrorMsg = "Resubmit Source Events Encountered Some Errors, Please Try It Later.";
			$scope.resubmitSuccessMsg = "Resumbit Source Events Have Been Processed Successfully.";
			$scope.isResubmitSuccess = true;
			$scope.initBucketIds = function() {
				// assume the bucketId count to 200, this may need to change if
				// we update total bucket number
				for (var i = 1; i <= 200; i++) {
					$scope.bucketIds[i - 1] = i;
				}
			};

			$scope.setReportClass = function() {
				if ($scope.failedCount > 0) {
					$scope.reportClass = "alert alert-danger";
					$scope.showResubmit = true;
				}
				else {
					$scope.reportClass = "alert alert-success";
					$scope.showResubmit = false;
				}
			};

			// initialize the bucketIds and reportClass
			$scope.initBucketIds();
			$scope.setReportClass();

			$scope.getFailedCount = function() {
				var requestUrl = serviceLocations.detectorServicesBase + 'main/secure/failedsourceevents/count';
				requestUrl = requestUrl + "?bucketId="+ $scope.filters.bucketId +"&startDate=" + $filter('date')($scope.filters.dt, $scope.dateFormat);
				$http.get(requestUrl)
				.success(function(data){
					$scope.failedCount = data.result;
//					$scope.failedCount = 100;
					$scope.showFailedCount = true;
					$scope.showGetCountError = false;
					$scope.setReportClass();
				})
				.error(function(input){
					$scope.showFailedCount = false;
					$scope.showGetCountError = true;
				});	
			};
            
			// reload the current page and reset all variables
			$scope.resetReport = function() {
				$route.reload();
			};
			
			// handle the resubmit source events request
			$scope.resubmitEvents = function() {
				var requestUrl = serviceLocations.detectorServicesBase + 'main/secure/resubmitsourceevents';
				requestUrl = requestUrl + "?bucketId="+ $scope.filters.bucketId +"&startDate=" + $filter('date')($scope.filters.dt, $scope.dateFormat);
				var requestBody = {};
				$http.post(requestUrl,requestBody)
				.success(function(data){
					$scope.isResubmitSuccess = true;
					$scope.generateModalMsg();
				})
				.error(function(input){
					$scope.isResubmitSuccess = false;
					$scope.generateModalMsg();
				});
			};
			
			// trigger the modal message pop up after resubmit source events
			// show success or error message based on resubmit response
			$scope.generateModalMsg = function() {
				var ResubmitModalInstanceCtrl = function($scope, $modalInstance, respItems) {
					$scope.respItems = respItems;
					$scope.ok = function() {
						$modalInstance.close();
					};
				};
				var respMsg;
				var msgClass;
				var modalInstance = $modal.open({
				      templateUrl: 'resubmit-modal.html',
				      controller: ResubmitModalInstanceCtrl,
				      resolve: {
				        respItems: function(){
				        	if($scope.isResubmitSuccess){
				        		respMsg = $scope.resubmitSuccessMsg;
				        		msgClass = "alert alert-success";
				        	}else{
				        		respMsg = $scope.resubmitErrorMsg;
				        		msgClass = "alert alert-danger";
				        	}
				        	return {
				        		msg:respMsg,
					        	msgClass:msgClass
				        	};
				        }
				      }
				    });
				 modalInstance.result.then($scope.resetReport());
			};
			$scope.open = function($event) {
			    $event.preventDefault();
			    $event.stopPropagation();
			    $scope.opened = true;
			  };
		} ]);