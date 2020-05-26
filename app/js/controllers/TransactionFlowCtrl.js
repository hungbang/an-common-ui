assetHealthApp.controller('TransactionFlowCtrl',['$scope', '$filter', '$http', 'UserData', 'ServiceLocations', function($scope, $filter, $http, userData, serviceLocations){

	$scope.filters = [];

	$scope.addFilter = function() {
		i = $scope.filters.length;
		filter = {'id':'filter' + i, 'dt': new Date()};
		$scope.filters.push(filter);
		$scope.showFilterLabel = true;
		$scope.newFilter = filter;
	};
	
	$scope.dateFormat = 'MM/dd/yyyy HH:mm:ss';
	$scope.hstep = 1;
	$scope.mstep = 1;

	// These are the fields from the transaction context table
	/*
	$scope.criteria = [
	                   {id: "systemId", name: "System ID"},
	                   {id: "messageType", name: "Message Type"},
	                   {id: "userId", name: "User ID"},
	                   {id: "companyMark", name: "Mark"},
	                   {id: "transactionDateStart", name: "Transaction Date Start"},
	                   {id: "transactionDateEnd", name: "Transaction Date End"},
	                   {id: "messageDateStart", name: "Message Date Start"},
	                   {id: "messageDateEnd", name: "Message Date End"},
	                   {id: "userCorrelationId", name: "Correlation ID"},
	                   {id: "transactionId", name: "Transaction ID"}
	                  ];
	 */

	$scope.criteria = [
	                   {id: "transactionId", name: "Transaction ID"},
	                   {id: "documentId", name: "Document ID"},
	                   {id: "elementId", name: "Element ID"},
	                   {id: "propertyId", name: "Property ID"},
	                   {id: "documentType", name: "Document Type"},
	                   {id: "origin", name: "Origin"},
	                   {id: "phase", name: "Phase"},
	                   {id: "status", name: "Status"},
	                   {id: "logLevel", name: "Log Level"},
	                   {id: "transactionDateStart", name: "Datetime Start"},
	                   {id: "transactionDateEnd", name: "Datetime End"},
//	                   {id: "userCorrelationId", name: "Correlation ID"},
	                   ];

	$scope.getResults = function() {
		$scope.submitted = true;

		var params = '';
		var filters = $scope.filters;
		var numFilters = filters.length;
		for(var i = 0; i < numFilters; i++){
			var paramChar = params == '' ? '?' : '&';
			if(filters[i].selectedItem == null) {
				continue;
			}
			var val = filters[i].text;
			if(val == null) {
				val = $filter('date')(filters[i].dt, $scope.dateFormat);
			}
			params += paramChar + filters[i].selectedItem.id + '=' + val;
		}
		var fetchUrl = serviceLocations.detectorServicesBase+'main/secure/transactions/' + params;
		$scope.fetchUrl = fetchUrl;

		$http.get(fetchUrl)
		.success(function(data){
			$scope.transactionData = data;
			$scope.isTransactionData = data.transactionLogEntryList.length > 0;
		})
		.error(function(input){
			$scope.transactionData = 'failed to obtain transaction data';
		});	 
	};
	
	$scope.populateFilterOptions = function(){
		var numFilters = $scope.filters.length;
		for(var i = 0; i < numFilters; i++){
			var filter = $scope.filters[i];
			if (!filter.selectedItem)
			{
				// Ignore filters where type has not been selected
				filter.showDropdown = false;
				filter.showCalendar = false;
				filter.showTextInput = false;
				continue;
			}
			filter.options = getFilterOptions(filter.selectedItem.id);
			filter.showDropdown = filter.options ? true : false;
			filter.showCalendar = filter.selectedItem.id.indexOf('Date') >= 0 ? true : false;
			filter.showTextInput = !(filter.showDropdown || filter.showCalendar);
		}
	};
	
	function getFilterOptions(type){
		return $scope.filterVals[type];
	}
	
	function buildFilterValList(filterVals){
		var sz = filterVals.length;
		var vals = [];
		for(var i = 0; i < sz; i++) {
			menuItem = {};
			if(filterVals[i] == null){
				// Ignore items with no values
			}
			else {
				menuItem['name'] = filterVals[i];
				menuItem['value'] = filterVals[i];
				vals.push(menuItem);
			}
		}
		return vals;
	}

//	$scope.logLevels = true;

	$scope.filterVals = {};
	var filterTypes = ['phase', 'origin', 'documentType', 'logLevel'];
	var filterValuesUrl = serviceLocations.detectorServicesBase+'main/secure/transaction/filterValues';
	
//	// This needs to be made into a callback to work correctly.  As written, the loop 
	// executes completely (for all i values) before the  first http.get returns.  
	// So, all of the results are stored in filterVals[filterName] where filterName
	// is the last one in filterTypes.
//	var numFilterTypes = filterTypes.length;
//	for (var i = 0; i < numFilterTypes; i++) {
//		var filterName = filterTypes[i];
//		$http.get(filterValuesUrl, {params: {filterType : filterTypes[i]}})
//		.success(function(values){
//			$scope.url = filterValuesUrl;
//			$scope.values = values;
//			$scope.tmp = params;
//			$scope.tmp2 = values.stringList;
//			$scope.filterVals[filterName] = values.stringList;
//		})
//		.error(function(input){
//			$scope.tmp = 'fail';
//		});	
//	}	

	// As a temporary solution, unroll the loop.
	$http.get(filterValuesUrl, {params: {filterType : filterTypes[0]}})
	.success(function(values){
		$scope.filterVals[filterTypes[0]] = buildFilterValList(values.stringList);
	})
	.error(function(input){
		$scope.filterVals[filterTypes[0]] = 'error obtaining filter values';
	});		
	$http.get(filterValuesUrl, {params: {filterType : filterTypes[1]}})
	.success(function(values){
		$scope.filterVals[filterTypes[1]] = buildFilterValList(values.stringList);
	})
	.error(function(input){
		$scope.filterVals[filterTypes[1]] = 'error obtaining filter values';
	});		
	$http.get(filterValuesUrl, {params: {filterType : filterTypes[2]}})
	.success(function(values){
		$scope.filterVals[filterTypes[2]] = buildFilterValList(values.stringList);
	})
	.error(function(input){
		$scope.filterVals[filterTypes[2]] = 'error obtaining filter values';
	});		
	$http.get(filterValuesUrl, {params: {filterType : filterTypes[3]}})
	.success(function(values){
		$scope.filterVals[filterTypes[3]] = buildFilterValList(values.stringList);
	})
	.error(function(input){
		$scope.filterVals[filterTypes[3]] = 'error obtaining filter values';
	});			
}]);
