assetHealthApp.service('AdminSupportData',['$rootScope', function($rootScope){
	  return {
		selectedSite: null,
		sites: [],
	    setSites: function(sites){
	      this.sites = sites;
	    },
		setSelectedSite: function(site){
		  this.selectedSite = site;
		  $rootScope.$broadcast('locationModel::selectedSiteUpdated', train);
		},
		reset: function(){
			this.selectedSite = null;
			this.sites = [];
		}
	 }
}]);