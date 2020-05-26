assetHealthApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/assethealth', {templateUrl: '../partials/assethealth-landing.html', controller: 'LandingPageCtrl'}).
    when('/equipment', {templateUrl: '../partials/equip-query.html',   controller: 'EquipQueryCtrl'}).
    when('/detectorRegistry', {templateUrl: '../partials/detector-registry.html', controller: 'DetectorRegistryCtrl'}).
    when('/detectorSubscription', {templateUrl: '../partials/detector-subscription.html', controller: 'DetectorSubscriptionCtrl'}). 
    when('/approveSubscription', {templateUrl: '../partials/approve-subscription.html', controller: 'ApproveSubscriptionCtrl'}).  
    when('/temperatureReader', {templateUrl: '../partials/temperature-reader.html', controller: 'TemperatureReaderCtrl'}).
    when('/waysideErrorAnalysis', {templateUrl: '../partials/wayside-error-analysis.html', controller: 'WaysideErrorAnalysisCtrl'}).
    when('/detectorHistory/:detectorId/:detectorName', {templateUrl: '../partials/detector-registry-history.html', controller: 'DetectorRegHistoryCtrl'}).
    when('/viewUploadResults', {templateUrl: '../partials/detector-upload-results.html', controller: 'DetectorUploadResultsCtrl'}).
    when('/submissions', {templateUrl: '../partials/submissions.html', controller: 'SubmissionsCtrl'}).
    when('/dashboard', {templateUrl: '../dashboard.html', controller: 'TrainSelectionCtrl'}).
    when('/trainEquipment', {templateUrl: '../partials/train-equipment.html', controller: 'TrainEquipmentCtrl'}).
    when('/equipmentList', {templateUrl: '../partials/equipment-carousel.html', controller: 'SwipableEquipmentListCtrl'}).
    when('/submitEventXml', {templateUrl: '../partials/train-event-xml.html', controller: 'XMLTrainEventCtrl'}).
    when('/admin', {templateUrl: '../partials/admin-dashboard.html', controller: 'AdminDashboardCtrl'}).
    when('/support/transaction-flow-tracing', {templateUrl: '../partials/support/transaction-flow-tracing.html', controller: 'TransactionFlowCtrl'}).
    when('/support/audit-log-tracing', {templateUrl: '../partials/support/audit-log-tracing.html', controller: 'AuditLogTracingCtrl'}).
    when('/support/resubmit-source-events', {templateUrl: '../partials/support/resubmit-source-events.html', controller: 'ResubmitSourceEventsCtrl'}).
    when('/aeidq/view-metrics', {templateUrl: '../partials/aeidq/view-metrics.html', controller: 'ViewMetricsCtrl'}).
    when('/aeidq/generate-metrics', {templateUrl: '../partials/aeidq/generate-metrics.html', controller: 'GenerateMetricsCtrl'}).
    when('/aeidq/metrics-trending', {templateUrl: '../partials/aeidq/metrics-trending.html', controller: 'ViewMetricsTrendingCtrl'}).
    when('/aeidq/tag-status-summary', {templateUrl: '../partials/aeidq/tag-status-summary.html', controller: 'TagStatusSummaryCtrl'}).
    when('/aeidq/tag-status-detail', {templateUrl: '../partials/aeidq/tag-status-detail.html', controller: 'TagStatusDetailCtrl'}).
    when('/eventDetectorUpload',{templateUrl:'../partials/detector-upload.html',controller:'UploadDetectorCtrl'}).
    otherwise({redirectTo: '/assethealth'});
  }]
);
