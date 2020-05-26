assetHealthApp.controller('LandingPageCtrl',['$scope', '$rootScope', 'UserData', 'ServiceLocations', 'EnvData', function($scope, $rootScope, userData, serviceLocations, envData){
  $scope.userData = userData;
  
  var permissions = userData.permissions;
  
  var ROLE_CONSIST_MANAGER = "AHCONMGR";
  var ROLE_DETECTOR_SUPER = "AHDRGSUPER";
  var ROLE_ADMIN = "AHAPPADM";
  var ROLE_IT_SUPPORT = "AHITSUPPORT";
  var ROLE_TECH_SUPPORT = "AHTECHSUPPORT";
  var ROLE_INF_SUPPORT = "AHINFRSUPPORT";
  
  $scope.isProduction = envData.isCurrentEnvironment('PROD');
  $scope.isConsistManager = permissions.hasOwnProperty(ROLE_CONSIST_MANAGER);
  $scope.isDetectorEnable = permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) || permissions.hasOwnProperty(ROLE_DETECTOR_SUPER);
  $scope.isSupportUiEnable = permissions.hasOwnProperty(ROLE_ADMIN) || permissions.hasOwnProperty(ROLE_IT_SUPPORT) || permissions.hasOwnProperty(ROLE_TECH_SUPPORT);
  $scope.isAEIDQUiEnable = permissions.hasOwnProperty(ROLE_ADMIN) || permissions.hasOwnProperty(ROLE_IT_SUPPORT) || permissions.hasOwnProperty(ROLE_TECH_SUPPORT);
  $scope.isAdminUiEnable = permissions.hasOwnProperty(ROLE_ADMIN) || permissions.hasOwnProperty(ROLE_INF_SUPPORT);  
  $rootScope.isAdminAndITUiEnable = permissions.hasOwnProperty(ROLE_ADMIN) || permissions.hasOwnProperty(ROLE_IT_SUPPORT); 
  $scope.viewRegistryEnabled = permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) || permissions.hasOwnProperty(ROLE_DETECTOR_SUPER);
  $scope.viewDetectorSubscriptionEnabled = permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) || permissions.hasOwnProperty(ROLE_DETECTOR_SUPER);
  $scope.viewApproveSubscriptionEnabled = permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) || permissions.hasOwnProperty(ROLE_DETECTOR_SUPER);
  $scope.temperatureReaderEnabled = permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) || permissions.hasOwnProperty(ROLE_DETECTOR_SUPER);
  $scope.waysideErrorAnalysisEnabled = permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) || permissions.hasOwnProperty(ROLE_DETECTOR_SUPER);
  $scope.uploadDetectorEnabled = permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) || permissions.hasOwnProperty(ROLE_DETECTOR_SUPER);
  $scope.viewUploadResultsEnabled = permissions.hasOwnProperty(ROLE_DETECTOR_OWNER) || permissions.hasOwnProperty(ROLE_DETECTOR_SUPER);
  
  $scope.userGuideURL= serviceLocations.userGuideURL;
  
  $scope.openUserGuide = function(){
      window.open($scope.userGuideURL);
  };
  
}]);