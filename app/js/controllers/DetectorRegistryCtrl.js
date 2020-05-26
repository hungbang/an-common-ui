assetHealthApp.controller('DetectorRegistryCtrl', ['$scope', '$rootScope', '$http', 'UserData', 'ServiceLocations', function ($scope, $rootScope, $http, userData, serviceLocations) {

    $scope.sites = [];
    $scope.siteSpinner = true;
    $scope.searchPerformed = false;
    $scope.userMarkFlag = false;
    var permissions = userData.permissions;
    var entities = null;
    $scope.userMarks = [];

    if (permissions.hasOwnProperty(ROLE_DETECTOR_OWNER)) {
        entities = permissions[ROLE_DETECTOR_OWNER]; // TODO This role should be a constant defined somewhere
    }

    if (entities == null || entities.length == 0) {
        $scope.sites = [];
        // TODO Do additional error handling. Maybe display a message?
        return;
    }
    // Default to first entity. This should be the only one anyway.
    $scope.getDetectorRegistrySites = (function (companyMark) {
        var timestamp = new Date().getTime();
        $scope.sites = [];
        $scope.siteSpinner = true;
        $scope.searchPerformed = false;
        $http.get(serviceLocations.detectorServicesBase + 'main/secure/detectorSummary/' + companyMark + '/' + timestamp)
            .success(function (data) {
                console.log(data.result);
                $scope.sites = data.result;

                $scope.siteSpinner = false;
                $scope.searchPerformed = true;
                for (var i = 0; i < $scope.sites.length; i++) {
                    $scope.sites[i].id = i;
                }

            })
            .error(function (input) {
                $scope.sites = [];
                $scope.siteSpinner = false;
                $scope.searchPerformed = true;
            });
    });

    // Default to first entity. This should be the only one anyway.
    //$scope.companyMark = entities[0];
    if ($rootScope.isAdminAndITUiEnable) {
        $http.get(serviceLocations.detectorServicesBase + 'main/secure/getAllDetectorCompanyMarks')
            .success(function (data) {
                $scope.userMarks = data.result;
                if ($scope.userMarks.length > 0) {
                    $scope.userMarkFlag = true;
                    $scope.companyMark = $scope.userMarks[0];
                } else {
                    $scope.userMarkFlag = false;
                    $scope.companyMark = entities[0];
                }
                $scope.getDetectorRegistrySites($scope.companyMark);

            })
            .error(function (input) {
                $scope.userMarkFlag = false;
                $scope.userMarks = [];
            });
    } else {
        $scope.userMarkFlag = false;
        $scope.companyMark = entities[0];
        $scope.getDetectorRegistrySites($scope.companyMark);
    }

    /*
     * Get previous detector details
     */
    $scope.getRegisterDetailPrevious = function () {
        $scope.getRegisterDetail($scope.sites[$scope.previousIndex], $scope.previousRowIndex);
    };


    /*
     * Get next detector details
     */
    $scope.getRegisterDetailNext = function () {
        $scope.getRegisterDetail($scope.sites[$scope.nextIndex], $scope.nextRowIndex);

    };


    $scope.getRegisterDetail = function (_detector, index) {
        SortUtil.getSortOrder(index, "registerDetailTable", "regFilterLength", "regRecordId", $scope);
        $http.get(serviceLocations.detectorServicesBase + 'main/secure/detectorDetails/' + _detector.detectorId + '/' + _detector.effectiveTs + '/' + _detector.expirationTs)
            .success(function (data) {
                $scope.selectedDetector = data.result;
            });
    };
}]);
