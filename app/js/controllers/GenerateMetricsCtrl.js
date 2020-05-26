assetHealthApp.controller('GenerateMetricsCtrl',['$scope','$http','$filter','ServiceLocations', function($scope, $http, $filter,serviceLocations) {

							$scope.dateFormat = 'MM/dd/yyyy';

							$scope.metricsDate = '';
							$scope.requestSubmitted = 'Request Submitted Successfully';
							$scope.requestNotSubmitted = 'Error Submitting Request';

							$scope.generateMetrics = function() {
								var metricsDate = $scope.metricsDate;
								var fetchUrl = serviceLocations.detectorServicesBase+'main/secure/aeidq/generatemetrics';
								metricsDate = $filter('date')(metricsDate,
										$scope.dateFormat);
								if ((metricsDate && metricsDate != '')) {
									fetchUrl = serviceLocations.detectorServicesBase+'main/secure/aeidq/generatemetrics?matrixDate='+ metricsDate;
								}
								$http.get(fetchUrl).success(
												function(data) {
													$scope.submitted = true;
												}).error(function(input) {
											$scope.submitted = false;
										});

							};

						} ]);
