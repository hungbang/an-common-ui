'use strict';

// Declare app level module which depends on views, and core components
var assetHealthApp =  angular.module('assethealth', [
  'ui.bootstrap',
  'ngUpload',
  'railCommon','ui.chart', 'angular-carousel',
  'ngTable'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('');

}]);

/* UserData instantiated here to allow server-side data*/
assetHealthApp.factory('UserData',['appSettings',function(appSettings){
  return {
    userId: appSettings.userId,
    companyMark: LoggedUserUtil.extractEmployer(appSettings.SSO_USER),
    permissions: LoggedUserUtil.extractPermissions(appSettings.railincPermission)
  }
}]);

assetHealthApp.factory('EnvData',['appSettings', function(appSettings){
  return {
    isCurrentEnvironment: function isCurrentEnv(env)
    {
      return env === appSettings.instanceEnv;
    }
  }
}]);

assetHealthApp.factory('ServiceLocations',[ 'appSettings' , function(appSettings){
  return {
    detectorServicesBase: appSettings.serviceLocationsDetectorServicesBase,
    equipmentContextPath: appSettings.equipmentContextPath,
    trainEventContextPath: appSettings.trainEventContextPath,
    transactionContextPath: appSettings.transactionContextPath,
    equipmentHealthServicesContextPath: appSettings.equipmentHealthServicesContextPath,
    hostNames: appSettings.hostNames,
    dataSummaryAppRoot: appSettings.dataSummaryAppRoot,
    dataSummaryContextPath: appSettings.dataSummaryContextPath,
    userGuideURL: appSettings.userGuideURL
  }
}]);

// set global configuration of application and it can be accessed by injecting appSettings in any modules
assetHealthApp.constant('appSettings', appConfig);
