SortUtil = (function(){
    /*
	 * Adjust nextIndex and previousIndex based on the index of selectedIndex to 
	 * accurately point to the next and previous indices in the list of detector.
	 * In HTML column 7 and 8 are hidden to get the index of list and length of the filtered search
	 */
 // Get SortOrder 
	function getSortOrder(index,tableName,filterLengthId,recordId,$scope){
		var tableNm = document.getElementById(tableName);
		//filteredLength=tableNm.getElementsByClassName(filterLengthId).length;
		filteredLength=tableNm.querySelectorAll('.'+filterLengthId)[index].innerHTML;
		document.getElementById("next").disabled=false;
		document.getElementById("previous").disabled=false;
		$('#previous').show();
		$('#next').show();
		//console.log(index);		
		if (index==0 && index==filteredLength-1){
			$('#previous').hide();
			$('#next').hide();
			
		}
		else if(index==0){
			document.getElementById("previous").disabled=true;
			document.getElementById("next").disabled=false;
			$scope.nextIndex=tableNm.querySelectorAll('.'+recordId)[index+1].innerHTML;
			$scope.nextRowIndex=index+1;
			$scope.currentRowIndex=index;
		}
		else if(index==filteredLength-1){
			document.getElementById("next").disabled=true;
			document.getElementById("previous").disabled=false;
			$scope.previousIndex=tableNm.querySelectorAll('.'+recordId)[index-1].innerHTML;
			$scope.previousRowIndex=index-1;
			$scope.currentRowIndex=index;
		}
		else{
			
			//$scope.previousIndex=tableNm.getElementsByClassName(recordId)[index-1].innerHTML;
			$scope.previousIndex=tableNm.querySelectorAll('.'+recordId)[index-1].innerHTML;
			$scope.previousRowIndex=index-1;
			$scope.nextIndex=tableNm.querySelectorAll('.'+recordId)[index+1].innerHTML;
			//$scope.nextIndex=tableNm.getElementsByClassName(recordId)[index+1].innerHTML;
			$scope.nextRowIndex=index+1;
			$scope.currentRowIndex=index;
		}
		
	}
	
	return {
		getSortOrder:getSortOrder
	};
	
})();