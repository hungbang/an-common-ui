assetHealthApp.controller('DetectorSubscriptionCtrl', [
	'$scope',
	'$rootScope',
	'$http',
	'$filter',
	'$window',
	'$location',
	'$anchorScroll',
	'UserData',
	'ServiceLocations',
	'ngTableParams',
	function($scope, $rootScope, $http, $filter, $window, $location, $anchorScroll, userData, serviceLocations, ngTableParams) {

		////////////////////////////////////
		//
		//  Manage My Subscriptions Tab
		///////////////////////////////////
		
		$scope.mySubscriptions = [];
		$scope._mySubscriptions = []; //used by ng-table
		$scope.pageno = 1;
		$scope.subscriptionsSpinner = false;
		$scope.selectAllActiveSubsClicked = false;
		
		$scope.tableParams = new ngTableParams({
			page: 1,
			total: $scope.mySubscriptions.length,
			count: 10,
			counts: [10, 50, 100, 250, 500],
			trigger: 0
		});

		$scope.view = {
			selectAllDetectors: false,
			selectAllActiveSubs: false
		};
		
		$scope.selectAllFilteredActiveSubs = function (){
			$scope.tableParams.trigger++;	
      	  	$scope.selectAllActiveSubsClicked = true;
  	  	};
  	  	
  	  	
  	  	
		$scope.selectedSubs = []; // ng-table watch function populates Detector Sub IDs here
		$scope.showUnsubscribeSuccessAlert = false;

		////////////////////////////////////
		//
		//  Search & Request Detectors
		//  To Subscribe To
		///////////////////////////////////

		// Get detector types
		$http.get(
			serviceLocations.detectorServicesBase + 'main/secure/detectorTypes').success(
			function(data) {
				$scope.detectorTypeOptions = [];
				$scope.rawData = data.result;
				angular.forEach($scope.rawData, function(detType, index) {
					var detectorType = {};
					detectorType.detectorTypeId = detType;
					detectorType.detectorTypeName = detType;
					if(detType === 'HBD') {
						detectorType.selected = true;
						detectorType.disabled = false;
					} else {
						detectorType.selected = false;
						detectorType.disabled = true;
					}
					//console.log("detectorType -> " + JSON.stringify(detectorType));
					$scope.detectorTypeOptions.push(detectorType);
				});
			}).error(function(input) {
			$scope.detectorTypeOptions = [];
		});
		
		$scope.selectAllFilteredDetectors = function (){
			$scope.detectorTableParams.trigger++;	
      	  	$scope.selectAllDetectorsClicked = true;
  	  	}; 		

		// first search form: Choose Detector Owners & Type
		$scope.detectorsByTypeForm = {
			detectorType: '',
			detectorOwners: []
		};

		$scope.masterDetectorsByTypeForm = {};

		// second form: Select Detector(s) to Subscribe to
		$scope.detectorSubscriptionForm = {

			comments: '',
			detectors: [],
			detectorType: '',
			detectorOwners: []
		};

		////////////////////////////////
		// Search Detector ng-table vars
		////////////////////////////////
		
		$scope.detectorSpinner = false;
		$scope.selectAllDetectorsClicked = false;
		
		$scope.detectors = [];
		$scope._detectors = []; //used by ng-table
		$scope.detectorPageno = 1;

		$scope.detectorTableParams = new ngTableParams({
			page: 1,
			total: $scope.detectors.length,
			count: 10,
			counts: [10, 50, 100, 250, 500],
			trigger: 0
		});
		
		/////////////////////////////////////
		
		
		$scope.mySubscriptions = [];
		$scope._mySubscriptions = []; //used by ng-table
		$scope.pageno = 1;

		$scope.tableParams = new ngTableParams({
			page: 1,
			total: $scope.mySubscriptions.length,
			count: 10,
			counts: [10, 50, 100, 250, 500],
			trigger: 0
		});
		
		$scope.detectorOwners = [];
		$scope.selectedDetectors = [];
		var filter = $filter('filter');		
		$scope.searchPerformed = false;

		// error message controls
		$scope.showDetectorOwnerRequiredError = false;
		$scope.showDetectorTypeRequiredError = false;
		

		// search for detector by:
		// type:  e.g. HBD, AEI, etc
		// owner:  UP, NS, CSX, etc
		$scope.getDetectorsByTypeAndMark = (function(_detectorsByTypeForm) {

			$scope.showSubscriptionSuccessAlert = false;
			
			// bind form values
			detectorsByTypeForm = {
				detectorType: _detectorsByTypeForm.detectorType,
				detectorOwners: []
			};

			// find selected detector owners
			angular.forEach(_detectorsByTypeForm.detectorOwners, function(_detectorOwner, index) {
				if (_detectorOwner.selected) {
					detectorsByTypeForm.detectorOwners.push(_detectorOwner.mark);
				}
			});

			var valError = false;
			//short circuit #1
			$scope.showDetectorTypeRequiredError = false;
			if (_detectorsByTypeForm.detectorType === '') {
				$scope.showDetectorTypeRequiredError = true;
				valError = true;
			}

			$scope.showDetectorOwnerRequiredError = false;
			//short circuit #2
			if (detectorsByTypeForm.detectorOwners.length === 0) {
				// no roadmarks selected				
				$scope.showDetectorOwnerRequiredError = true;
				valError = true;
			}
			
			//If validation error return
			if(valError) {
				return;
			}

			// start search animation
			$scope.detectorSpinner = true;
			$scope.detectorSearchPerformed = true;

			$http.post(serviceLocations.detectorServicesBase + 'main/secure/detectorsByTypeAndMark', detectorsByTypeForm)
				.success(function(data) {
					
					$scope.detectors = []; // clear previous server results
					$scope._detectors = []; // clear table data in ng-table
					$scope.view.selectAllDetectors = false;  // uncheck 'select all' from a previous search
										
					$scope.detectorSpinner = false;
					$scope.detectorSearchPerformed = true;		
					$scope.detectorSearch = '';					
					$scope.detectors = $scope.transform(data);
					$scope.detectorTableParams.total = $scope.detectors.length;
					$scope.detectorTableParams.trigger++;
					
					
				})
				.error(function(input) {
					$scope.detectors = [];
					$scope.detectorSpinner = false;
					$scope.detectorSearchPerformed = true;
				});
		});

		// Get detector owners on page load
		$http.get(
			serviceLocations.detectorServicesBase + 'main/secure/detectorOwners').success(
			function(data) {
				$scope.rawData = data.result;

				angular.forEach($scope.rawData.detectorOwners, function(detectorOwnerName, index) {
					$scope.detectorOwner = {
						mark: detectorOwnerName,
						selected: false
					};
					$scope.detectorsByTypeForm.detectorOwners.push($scope.detectorOwner);
				});

				$scope.masterDetectorsByTypeForm = angular.copy($scope.detectorsByTypeForm);
			}).error(function(input) {
			$scope.detectorOwners = [];
		});

		$scope.getMySubscriptions = function() {
			$scope.tableParams.page = 1;
			$http.get(serviceLocations.detectorServicesBase + 'main/secure/mySubscriptions')
				.success(
					function(data) {
						
						$scope.mySubscriptions = []; // clear previous server results
						$scope._mySubscriptions = []; // clear table data in ng-table
						$scope.view.selectAllActiveSubs = false; // uncheck 'select all' from a previous search
						
						$scope.mySubscriptions = data.result;
						$scope.tableParams.total = $scope.mySubscriptions.length;
						$scope.subscriptionsSpinner = false;
	
					}).error(function(input) {
					$scope.subscriptionsSpinner = false;
					$scope.mySubscriptions = [];
				});
		};
		

		$scope.refreshMySubscriptions = function() {
			$scope.mySubscriptions = [];
			$scope._mySubscriptions = []; //used by ng-table
			$scope.tableParams.trigger++;
			$scope.selectedSubs = []; 
			$scope.showUnsubscribeSuccessAlert = false;
			$scope.subscriptionsSpinner = true;
			$scope.getMySubscriptions();
		};
		
		// client side transformation of Train Directions
		$scope.transform = function(response) {

			$scope.detectorsFromServer = response.result;
			var detectors = [];

			var TRAIN_DIR_NORTH = "North Bound";
			var TRAIN_DIR_SOUTH = "South Bound";
			var TRAIN_DIR_EAST = "East Bound";
			var TRAIN_DIR_WEST = "West Bound";

			angular.forEach($scope.detectorsFromServer, function(detectorObj, index) {

				$scope.detector1 = {};
				$scope.detector2 = {};

				if (detectorObj.detectorTrackSide === 'N' || detectorObj.detectorTrackSide === 'S') {
					
					if (!$scope.objArrayContains(detectorObj.existingSubscriptions, TRAIN_DIR_EAST)) {

						// create Eastbound Train Direction Entry
						detectorObj.trainDirection = TRAIN_DIR_EAST;
						angular.copy(detectorObj, $scope.detector1);
						detectors.push($scope.detector1);

					}
					if (!$scope.objArrayContains(detectorObj.existingSubscriptions, TRAIN_DIR_WEST)) {
						// create Westbound Train Direction Entry
						detectorObj.trainDirection = TRAIN_DIR_WEST;
						angular.copy(detectorObj, $scope.detector2);
						detectors.push($scope.detector2);
					}

				} else if (detectorObj.detectorTrackSide === 'E' || detectorObj.detectorTrackSide === 'W') {
					
					if (!$scope.objArrayContains(detectorObj.existingSubscriptions, TRAIN_DIR_NORTH)) {
						// create Northbound Train Direction Entry
						detectorObj.trainDirection = TRAIN_DIR_NORTH;
						angular.copy(detectorObj, $scope.detector1);
						detectors.push($scope.detector1);
					}
					if (!$scope.objArrayContains(detectorObj.existingSubscriptions, TRAIN_DIR_SOUTH)) {
						// create Southbound Train Direction Entry
						detectorObj.trainDirection = TRAIN_DIR_SOUTH;
						angular.copy(detectorObj, $scope.detector2);
						detectors.push($scope.detector2);
					}
				} else if (detectorObj.detectorTrackSide === 'U') {
					//console.log('Unknown Track Side!');
				}

			});
			
			return detectors;

		};

		$scope.$watch('detectorTableParams', function(params) {
			
			var orderedData = $scope.detectors;
			orderedData = params.sorting ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;
			orderedData = params.filter ? $filter('filter')(orderedData, $scope.detectorSearch) : orderedData;
			params.total = orderedData.length; // set total for recalc pagination
			
			var onePageOfData = orderedData.slice((params.page - 1) * params.count, params.page * params.count);
			$scope._detectors = onePageOfData;
			
			if( !($scope.selectAllDetectorsClicked == true && $scope.view.selectAllDetectors == true)){
  			  	$scope.selectedDetectors = [];
  			  	$scope.view.selectAllDetectors = false;
  		  	}
			$scope.selectAllDetectorsClicked = false;
			
			
			onePageOfData.map(function(detector, key) {
				if ($scope.view.selectAllDetectors) {
					
					var detectorSubscriptionRequest = {
							detectorId: detector.detectorId,
							trainDirection: detector.trainDirection,
					};
					
					$scope.selectedDetectors.push(detectorSubscriptionRequest);
					detector.selected = true;
				} else {
					$scope.selectedDetectors = [];
					detector.selected = false;
				}

				return detector;
			});		

			//render filtered, paginated, sorted data
//			$scope._detectors = sortedFilteredPaginatedData;
		}, true);
		
		$scope.doFilterDetectors = function() {
			$scope.detectorTableParams.filter = $scope.detectorSearch;
		};
		
		$scope.objArrayContains = function(arr, val) {
			return arr.indexOf(val) !== -1;
		};

		$scope.getAngularIndexOf = function arrayObjectIndexOf(arr, obj){
		    for(var i = 0; i < arr.length; i++){
		        if(angular.equals(arr[i], obj)){
		            return i;
		        }
		    }
		    return -1;
		};
		
		$scope.resetDetectorSearchForm = function() {

			$scope.detectorSpinner = false;
			$scope.detectorSearchPerformed = false;
			$scope.detectorSearch = '';
			$scope.showDetectorOwnerRequiredError = false;
			$scope.showDetectorTypeRequiredError = false;
			$scope.detectorsByTypeForm = angular.copy($scope.masterDetectorsByTypeForm);			
			$scope.detectorSubscriptionForm.comments = '';
			$scope.selectedDetectors = [];
			$scope.showSubscriptionSuccessAlert = false;
		};

		$scope.resetDetectorResultsForm = function() {

			$scope.detectorSpinner = false;
			$scope.detectorSearchPerformed = true;
			$scope.detectorSearch = '';
			$scope.showDetectorOwnerRequiredError = false;
			$scope.showDetectorTypeRequiredError = false;			
			$scope.detectorSubscriptionForm.comments = '';
			$scope.selectedDetectors = [];
			$scope.showSubscriptionSuccessAlert = false;
			
			//go to page 1
			$scope.detectorTableParams.page = 1;
			
			// uncheck 'select all' checkbox
			$scope.view.selectAllDetectors = false;
			
			// Remove all selections (checked checkboxes)
			angular.forEach($scope._detectors, function(_detector, index) {
				_detector.selected = false;					
			});
			
		};

		$scope.removeComments = function() {

			$scope.detectorSubscriptionForm.comments = '';
			$scope.comments = '';

		};

		$scope.roadMarkSelected = function(_detectorOwners) {
			return Object.keys(_detectorOwners).some(function(key) {
				return _detectorOwners[key].selected;
			});
		};		

		$scope.requestSubscription = function() {

			$scope.selectedOwners = [];
			angular.forEach($scope.detectorsByTypeForm.detectorOwners, function(_detectorOwner, index) {
				if (_detectorOwner.selected === true) {
					//only use selected detectorOwners
					$scope.selectedOwners.push(_detectorOwner.mark);
				}
			});

			$scope.detectorSubscriptionForm = {

				comments: $scope.comments,
				detectors: $scope.selectedDetectors,
				detectorType: $scope.detectorsByTypeForm.detectorType,
				detectorOwners: $scope.selectedOwners
			};

			// form values
			$http.post(serviceLocations.detectorServicesBase + 'main/secure/submitSubscriptionRequest', $scope.detectorSubscriptionForm)
				.success(function(data) {

					$scope.detectorsSpinner = false;
					$scope.comments = '';
					$scope.showSubscriptionSuccessAlert = true;
					$scope.detectorSearch = ' '; //blank out the filter 

					// The list of detectors should be refreshed after submission
					// Detectors that are subscribed to are no longer available in this list					
					$scope.detectors = $scope.transform(data);
					$scope.detectorTableParams.total = $scope.detectors.length;
					$scope.gotoTop();
					//go to page 1
					$scope.detectorTableParams.page = 1;
					
					// uncheck 'select all' checkbox
					$scope.view.selectAllDetectors = false;
				})
				.error(function(input) {
					$scope.detectorSpinner = false;
					$scope.selectedDetectors = [];
					$scope.comments = ''
					$scope.showSubscriptionSuccessAlert = false;
				});
		};

		$scope.selectDetector = function(_detectorId, _trainDirection) {
			
			var detectorSubscriptionRequest = {
					detectorId: _detectorId,
					trainDirection: _trainDirection,
				};

			var index = $scope.getAngularIndexOf($scope.selectedDetectors, detectorSubscriptionRequest);
							
			if (index < 0) {
				//not selected yet
				$scope.selectedDetectors.push(detectorSubscriptionRequest);
			} else {
				// removed Id from Selected Subs
				$scope.selectedDetectors.splice(index, 1);
			}	
		};

		$scope.gotoTop = function() {
			//$window.scrollTo(0, angular.element('topAnchor').offsetTop);
			$window.scrollTo(0, 0);
		};


		////////////////////////////////////
		//
		//  Manage My Subscriptions Tab
		///////////////////////////////////

		$scope.doFilterSubs = function() {
			$scope.tableParams.filter = $scope.subsSearch;
		};

		$scope.unsubscribe = function() {			

			$scope.unsubscribeDetectorsForm = {
				detectorSubIds: $scope.selectedSubs					
			};

			$http.post(serviceLocations.detectorServicesBase + 'main/secure/unsubscribe', $scope.unsubscribeDetectorsForm)
				.success(function(data) {

					$scope.subscriptionsSpinner = false;
					$scope.showUnsubscribeSuccessAlert = true;
					$scope.subsSearch = '';
					$scope.selectedSubs = [];
					// The list of my detector subs should be refreshed after submission					
					$scope.getMySubscriptions();
					$scope.gotoTop();
					
					//go to page 1
					$scope.tableParams.page = 1;
					
					// uncheck 'select all' checkbox
					$scope.view.selectAllActiveSubs = false;
				})
				.error(function(input) {
					$scope.subscriptionsSpinner = false;
					$scope.selectedSubs = [];
					$scope.showUnsubscribeSuccessAlert = false;
				});

		};

		$scope.selectSub = function(detectorSubId) {
			
			var index = $scope.selectedSubs.indexOf(detectorSubId);
			
			if (index < 0) {
				//not selected yet
				$scope.selectedSubs.push(detectorSubId);
			} else {
				// removed Id from Selected Subs
				$scope.selectedSubs.splice(index, 1);
			}	
							
		};

		$scope.resetMySubs = function() {
			
			$scope.selectedSubs = [];
			$scope.subscriptionsSpinner = false;			
			$scope.showUnsubscribeSuccessAlert = false
			
			$scope.view.selectAllActiveSubs = false; //uncheck 'select all' checkbox
			//uncheck individual checkboxes
			angular.forEach($scope._mySubscriptions, function(_sub, index) {
				_sub.selected = false;					
			});
			
			
		};
		
		$scope.showUnsubscribeCheckbox = function(mySub) {
			
			var approved = 'APPROVED';
			if (mySub.subStatus === approved) {
				return true;
			} else {
				return false;
			}
		};
		
		$scope.getMySubscriptions = function() {
			$scope.tableParams.page = 1;
			$http.get(serviceLocations.detectorServicesBase + 'main/secure/mySubscriptions')
				.success(
					function(data) {
						$scope.mySubscriptions = data.result;
						$scope.tableParams.total = $scope.mySubscriptions.length;
						$scope.subscriptionsSpinner = false;
	
					}).error(function(input) {
					$scope.siteSpinner = false;
					$scope.mySubscriptions = [];
				});
		};
		
		$scope.$watch('tableParams', function(params) {
			
			var orderedData = $scope.mySubscriptions;
			orderedData = params.sorting ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;
			orderedData = params.filter ? $filter('filter')(orderedData, $scope.subsSearch) : orderedData;
			params.total = orderedData.length; // set total for recalc pagination
			
			var sortedFilteredPaginatedData = orderedData.slice((params.page - 1) * params.count, params.page * params.count);
			if( !($scope.selectAllActiveSubsClicked == true && $scope.view.selectAllActiveSubs == true)){
  			  	$scope.selectedSubs = [];
  			  	$scope.view.selectAllActiveSubs = false;
  		  	}
			$scope.selectAllActiveSubsClicked = false;

			sortedFilteredPaginatedData.map(function(myDetectorSub, key) {
				if ($scope.view.selectAllActiveSubs) {
						if (myDetectorSub.subStatus === 'APPROVED') {
							// select all checkbox checked, but only 'select' other rows if status is APPROVED 
							$scope.selectedSubs.push(myDetectorSub.detectorSubscriptionId);
							myDetectorSub.selected = true;
						}
				} else {
					$scope.selectedSubs = [];
					myDetectorSub.selected = false;
				}

				return myDetectorSub;
			});
			
			if ($scope.selectedSubs.length < 1) {
				// select all clicked, but none of the subs are status = 'APPROVED'
				// so uncheck the 'select all' checkbox
				$scope.view.selectAllActiveSubs = false;
			}
			
			//render filtered, paginated, sorted data
			$scope._mySubscriptions = sortedFilteredPaginatedData;
			
		}, true);

	}
]);