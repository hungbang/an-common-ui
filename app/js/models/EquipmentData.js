assetHealthApp.factory('EquipmentData',function(){
  return {
	  searchPerformed: false,
      searchText: "",
      pendingRequests: 0, 
      resultList: [],
      focus:null
  };
});