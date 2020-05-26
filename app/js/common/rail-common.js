'use strict';

var railCommon = angular.module('railCommon', []);

railCommon.directive('rlHeader', function() {
    return {
      restrict: 'A',
      link : function(scope, element, attrs) {
        scope.user = attrs.user;
        scope.name = attrs.name;
        scope.company=attrs.company;
        
      },
      replace: true,
      //transclude: true,
      templateUrl: '../template/rail-header.tmpl.html'
    };
  });

railCommon.directive('rlNavbar', function($location) {
	  return {
	    restrict: 'A',
	    transclude: true,
	    link : function(scope, element, attrs) {
	      element.addClass("rl-navbar");
	      scope.isActive = function (viewLocation) { 
	          var pat = new RegExp(viewLocation);
	          return pat.test($location.path());
	      };
	    },
	    replace: true,
	    templateUrl: '../template/rail-navbar.tmpl.html'
	  };
	});

railCommon.directive('rlFooter', function() {
	  return {
	    restrict: 'A',
	    link : function(scope, element, attrs) {
	    },
	    replace: true,
	    templateUrl: '../template/rail-footer.tmpl.html', 
	    scope: {
	      year: "@"
	    }

	  };
	});


railCommon.directive('csvexport', function() {
	return {
		restrict :"AC",
		scope: {
			data : "=csvexport",
		},
		link : function(scope,element,attrs) {
			var dataString = "";
			var csvContent = "";
			scope.data.forEach(function(headArray, index){
				   dataString = headArray;
				   csvContent += dataString + ",";
			}); 
			csvContent += "\n";
	//		arr.forEach(function(infoArray, index){
	//			   dataString = infoArray.join(",");
	//			   csvContent += dataString + "\n";
	//		});
			if (element !== undefined) { // feature detection
			    // Browsers that support HTML5 download attribute
			    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			    var url = URL.createObjectURL(blob);            
			    element.attr("href", url);
			    element.attr("download", "export.csv");
			}				
		},
		 
	};		
});


/*railCommon.directive('rlFooter', function() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/rail-footer.tmpl.html', 
      scope: {
        year: "@"
      }

    };
  });

railCommon.factory('alertService', function($rootScope, $sce) {
  var alertService = {};

  $rootScope.alerts = [];
  
  alertService.clearAndAdd = function(type, msg) {
    this.closeAll();
    this.add(type, $sce.trustAsHtml(msg));
  };
  
  alertService.add = function(type, msg) {
    $rootScope.alerts.push({
      'type' : type,
      'msg' : msg
    });
  };
  
  alertService.closeAlert = function(index) {
    $rootScope.alerts.splice(index, 1);
  };
  
  alertService.closeAll = function() {
    $rootScope.alerts.length = 0;
  };

  alertService.length = function() {
    return $rootScope.alerts.length;
  };

  return alertService;
  
});

railCommon.directive('rlNavbar', function($location) {
  return {
    restrict: 'A',
    transclude: true,
    link : function(scope, element, attrs) {
      element.addClass("rl-navbar");
      scope.isActive = function (viewLocation) { 
          var pat = new RegExp(viewLocation);
          return pat.test($location.path());
      };
    },
    replace: true,
    templateUrl: 'template/rail-navbar.tmpl.html'
  };
})

railCommon.filter('markColumn', function($filter) {
  return function(input, k, v, exclude) {
    var results = [];
    var query = {}; 
    
    if (!v) return input;
    if (exclude=="true") v = '!' + v;
    query[k] = v;
    //console.log('query', query);
    results = ($filter('filter')(input, query));

    return results;

  }
});

railCommon.directive('rlEquipment', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, el, attr, ngModel) {    
      var tmp = [];
      var patt = /^[a-z,A-Z]+[0-9]+$/;
      var numeric = (attr.rlEquipment==='numeric') ? true : false;
      
      el.bind('keypress', function(event) {
        if(event.keyCode === 32) {  //prevent space kb input
          event.preventDefault();
        }
      });

      scope.$watch(attr.ngModel, function(newValue, oldValue) {

        if (newValue) {               
          newValue = newValue.replace(/\s/g,''); //clean up
          var valid = patt.test(newValue);
          var arr = newValue.split("");
          //console.log('rlEquipment', valid, arr)
          if (numeric) {
            tmp = _.remove(arr, function(n) {
              if (isNaN(n)) return n;  //remove alpha
            })
          } else {
            tmp = _.remove(arr, function(n) {
              if (parseInt(n) >= 0) return n;   //remove number
            })
          }
          newValue = arr.join('');

          if (valid) {
            ngModel.$setViewValue(newValue);
            ngModel.$render(); 
          } else if (arr.length == 0 || arr.length>attr.maxlen ||  tmp.length )  {
            ngModel.$setViewValue(oldValue);
            ngModel.$render();
          }
        }
      });
    }
  }
});

railCommon.directive('rlResizeheight', function(){   
  return {
    restrict: 'A',
    link : function(scope,element,attr){   
      $( window ).resize(function() {       
        element.css("height", $(window).height() - attr.rlResizeheight);
      });
      element.resize();
    }
  }  
});

railCommon.directive('rlDragable', function(){   
         return {
           restrict: 'A',
           link : function(scope,element,attr){
             $(element.parent()).draggable();
           }
         }  
});*/




