'use strict';

angular.module('assetHealthApp.version', [
  'assetHealthApp.version.interpolate-filter',
  'assetHealthApp.version.version-directive'
])

.value('version', '0.1');
