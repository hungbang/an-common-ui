assetHealthApp.controller('ApproveSubscriptionCtrl', [
                                                      '$scope',
                                                      '$rootScope',
                                                      '$http',
                                                      '$filter',
                                                      '$window',
                                                      'UserData',
                                                      'ServiceLocations',
                                                      'ngTableParams',
                                                      function($scope, $rootScope, $http, $filter, $window, userData, serviceLocations, ngTableParams ) {
                                                    	  $scope.siteSpinner=true;
                                                    	  $scope.selectedSubs=[];
                                                    	  $scope.comments = '';
                                                    	  $scope.approvalStatus = '';
                                                    	  $scope.modalText;
                                                    	  $scope.statusText;
                                                    	  $scope.statusMessage;
                                                    	  $scope.showSuccessAlert = false;			
                                                    	  $scope.detectorSubDetails = [];
                                                    	  $scope._detectorSubDetails = [];
                                                    	  $scope.newfilter=false;
                                                    	  $scope.selectedAllClicked = false;

                                                    	  var permissions = userData.permissions;
                                                    	  var entities = null;			

                                                    	  var filter = $filter('filter');

                                                    	  $scope.view = {
                                                    			  selectedAll : false
                                                    	  }

                                                    	  $scope.selectAllFilteredItems = function (){
                                                    		  $scope.tableParams.trigger++;	
                                                        	  $scope.selectedAllClicked = true;
                                                    	  }; 		

                                                    	  if (permissions.hasOwnProperty(ROLE_DETECTOR_OWNER)) {
                                                    		  entities = permissions[ROLE_DETECTOR_OWNER]; // TODO This role should be a constant defined somewhere
                                                    	  }

                                                    	  $scope.approveRejectSubscriptionForm = {
                                                    			  status : '',
                                                    			  comments : '',
                                                    			  subscriptionIds : []
                                                    	  };

                                                    	  $scope.updateStatus = function(stats){
                                                    		  $scope.comments = '';
                                                    		  $scope.approvalStatus = stats;
                                                    		  if($scope.approvalStatus === 'APPROVED'){
                                                    			  $scope.modalText = 'Approval';
                                                    			  $scope.statusText = 'approve';
                                                    			  $scope.statusMessage = 'approved';
                                                    		  }else if($scope.approvalStatus === 'REJECTED'){
                                                    			  $scope.modalText = 'Rejection';
                                                    			  $scope.statusText = 'reject';
                                                    			  $scope.statusMessage = 'rejected';
                                                    		  }else if($scope.approvalStatus === 'REVOKED'){
                                                    			  $scope.modalText = 'Revocation';
                                                    			  $scope.statusText = 'revoke';
                                                    			  $scope.statusMessage = 'revoked';
                                                    		  }
                                                    	  }

                                                    	  $scope.tableParams = new ngTableParams({	           
                                                    		  page: 1,            
                                                    		  total: $scope.detectorSubDetails.length, 
                                                    		  count: 10,
                                                    		  counts : [10, 50, 100, 250, 500],
                                                    		  trigger : 0
                                                    	  });

                                                    	  $scope.getSubscriptions = (function(fetchStatus){
                                                    		  // alert("Done !!" + $scope.selectedSubs + "  **  " + $scope.comments);
                                                    		  $scope.selectedSubs=[];
                                                    		  $scope.showSuccessAlert = false;	
                                                    		  $scope.view.selectedAll = false;					
                                                    		  $scope.tableParams.page = 1 ;
                                                    		  $scope.siteSearch = '';                                                    		  
                                                    		  $scope.tableParams.count = 10;
                                                    		  $scope._detectorSubDetails = [];
                                                    		  
                                                    		  $http.get(serviceLocations.detectorServicesBase+'main/secure/subscriptionsByStatus/'+ fetchStatus,{cache:false})
                                                    		  .success(function(data) {
                                                    			  $scope.detectorSubDetails = data.result;
                                                    			  $scope.tableParams.sorting = {};
                                                    			  $scope.tableParams.total = $scope.detectorSubDetails.length ;
                                                    			  $scope.siteSpinner=false;
                                                    			  $scope.drawTable($scope.tableParams);
                                                    		  })
                                                    		  .error(function(input){
                                                    			  $scope.siteSpinner=false;
                                                    			  $scope.detectorSubDetails = [];
                                                    		  });
                                                    	  });

                                                    	  $scope.getSubscriptions('PENDING');

                                                    	  $scope.doFilter = function () {
                                                    		  $scope.tableParams.filter = $scope.siteSearch; 
                                                    		  $scope.newfilter=true;
                                                    	  }

                                                    	  $scope.drawTable = function(params) {
                                                    		  // use build-in angular filter
                                                    		  var orderedData = $scope.detectorSubDetails;
                                                    		  orderedData = params.sorting ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;
                                                    		  orderedData = params.filter ? $filter('filter')(orderedData, $scope.siteSearch) : orderedData;
                                                    		  
                                                    		  if( !($scope.selectedAllClicked == true && $scope.view.selectedAll == true)){
                                                    			  $scope.selectedSubs = [];
                                                    			  $scope.view.selectedAll = false;
                                                    		  }
                                                			  $scope.selectedAllClicked = false;                                                    			  

                                                    		  params.total = orderedData.length; // set total for recalc pagination

                                                    		  if($scope.newfilter){
                                                    			  params.page = 1;
                                                    			  $scope._detectorSubDetails = orderedData.slice((params.page - 1) * params.count, params.page * params.count);
                                                    		  }else{
                                                    			  $scope._detectorSubDetails = orderedData.slice((params.page - 1) * params.count, params.page * params.count);
                                                    		  }
                                                    		  $scope.newfilter = false;		

                                                    		  var orderedDataPerPage = $scope._detectorSubDetails;

                                                    		  orderedDataPerPage.map(function(detectorSubDetail, key) {
                                                    			  if($scope.view.selectedAll){
                                                    				  var selIndex = $scope.selectedSubs.indexOf(detectorSubDetail.detectorSubscriptionId);
                                                    				  if(selIndex == -1) {
                                                    					  $scope.selectedSubs.push(detectorSubDetail.detectorSubscriptionId);
                                                    					  detectorSubDetail.selected = true;                                		 
                                                    				  }
                                                    			  }else{
                                                    				  $scope.selectedSubs = [];
                                                    				  detectorSubDetail.selected = false;
                                                    			  }
                                                    			  return detectorSubDetail;
                                                    		  });
                                                    	  };
                                                    	  
                                                    	  $scope.$watch('tableParams', $scope.drawTable, true);

                                                    	  $scope.updateSubscription = (function(){
                                                    		  $scope.approveRejectSubscriptionForm = {
                                                    				  status : $scope.approvalStatus,
                                                    				  comments : $scope.comments,
                                                    				  subscriptionIds : $scope.selectedSubs
                                                    		  };
                                                    		  $scope._detectorSubDetails = [];
                                                    		  $scope.siteSpinner=true;
                                                    		  $http.post(serviceLocations.detectorServicesBase+'main/secure/approveRejectSubscriptions', $scope.approveRejectSubscriptionForm)
                                                    		  .success(function(data){
                                                    			  $scope.detectorSubDetails = data.result;
                                                    			  $scope.siteSpinner=false;	
                                                    			  $scope.siteSearch = ''; 
                                                    			  $scope.comments = '';
                                                    			  $scope.tableParams.total = $scope.detectorSubDetails.length ;
                                                    			  $scope.showSuccessAlert = true;	
                                                    			  $scope.view.selectedAll = false;	
                                                    			  $scope.selectedSubs=[];
                                                    			  $scope.tableParams.page = 1 ;
                                                    			  $scope.drawTable($scope.tableParams);
                                                    			  $scope.gotoTop();	
                                                    		  })
                                                    		  .error(function(input){
                                                    			  $scope.siteSpinner=false;
                                                    			  $scope.detectorSubDetails = [];
                                                    			  $scope.comments = '';
                                                    			  $scope.showSuccessAlert = false;
                                                    			  $scope.view.selectedAll = false;		
                                                    			  $scope.selectedSubs=[];
                                                    		  });
                                                    	  });

                                                    	  $scope.gotoTop = function() {
                                                    		  //$window.scrollTo(0, angular.element('topAnchor').offsetTop);
                                                    		  $window.scrollTo(0, 0);				       
                                                    	  };

                                                    	  $scope.updateSub = function(sub){
                                                    		  var filtered = filter($scope.detectorSubDetails, $scope.siteSearch);
                                                    		  angular.forEach(filtered, function(detectorSubDetail, key) {
                                                    			  if(!$scope.detectorSubDetails[key].selected){
                                                    				  $scope.view.selectedAll = false;					                
                                                    			  }
                                                    		  })

                                                    		  var subIndex = $scope.selectedSubs.indexOf(sub);
                                                    		  if(subIndex == -1) {
                                                    			  $scope.selectedSubs.push(sub); //Add the selected sub into array
                                                    		  } else {
                                                    			  $scope.selectedSubs.splice(subIndex, 1); //Remove the selected sub
                                                    		  }
                                                    	  }			 
                                                      } ]);