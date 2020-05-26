
assetHealthApp.filter('yesNoUknown',function(){
  return function(obj){
	  if(obj == null || obj == undefined){
		  return 'UKN';
	  }else if(obj){
		  return 'Y';
	  }
	  return 'N';
  };
});


assetHealthApp.filter('yesNo',function(){
	  return function(obj){
        return (obj || false)? 'Y': 'N';
	  };
	});




assetHealthApp.filter('equipmentHealthFilter',function(){
    var isUnknownOrPastDue = function(date){
      if(!date){
        return true;
      }else{
        return (date <= new Date());
      }
    }
    var yOrN = function(obj){
      obj = obj | false;
      return obj? 'Y':'N';
    }
    var yNOrUnknown = function(obj){
      if(obj == undefined || obj == null){
        return 'UKN';
      }else if(obj){
    	 return 'Y';
      }
      return 'N';
    }
    var abtDueDate = function(dateString){
        if(dateString && dateString.length == 16){
          return new Date(dateString.substring(0,4),parseInt(dateString.substring(5,7))-1,dateString.substring(8,10),dateString.substring(11,13),dateString.substring(14,16));
        }
        return null;
	}
	return function(healthSummary){
	    return {
	      hazmat: yOrN(healthSummary.hazmat),
	      abtRequired: yOrN(healthSummary.abtRequired),
	      abtDueDate: abtDueDate(healthSummary.abtDueDate),
	      abtPastDue: isUnknownOrPastDue(abtDueDate(healthSummary.abtDueDate)),
	      ddctIncidentCount: healthSummary.numDdctIncidents || 0,
	      wildAlertCount:healthSummary.numWildAlerts || 0,
	      thdAlertCount: healthSummary.numThdAlerts || 0,
	      earlyWarningCount: healthSummary.numEarlyWarnings || 0,
	      maintenanceAdvisoryCount: healthSummary.numMaintenanceAdvisories || 0,
	      equipmentTypeCode: healthSummary.equipTypeCode,
	      umlerStatusAcceptable: (healthSummary.equipStatus == 'A'),
	      umlerStatus: healthSummary.equipStatus,
	      interchangeRestricted: yOrN(healthSummary.interchangeRestricted),
	      udeScore: healthSummary.udeScore,
	      hasEffectiveBrakes: yNOrUnknown(healthSummary.effectiveBrakes),
	      hasMandatoryWildAlerts: (healthSummary.highWildAlertLevel == 'M')
	    }
	  }
	});

assetHealthApp.filter('trainSummaryFilter',function(){
  return function(summary){
    var trainList = [];
    angular.forEach(summary,function(train){
      var effectiveBrakePercentage = (train.numEquipWithEffectiveBrakes/train.numEquipment * 100);
      trainList.push({
        trainId: train.groupId,
        equipmentCount: train.numEquipment,
        hazmatCount: train.numEquipWithHazmat,
        abtOverdueCount: train.numEquipWithAbtOverdue,
        abtOverOneYearCount: train.numEquipWithLastAbtOverOneYear,
        ddctIncidentCount: train.numEquipWithDdctIncidents,
        wildAlertCount: train.numEquipWithOpenWildAlerts,
        thdAlertCount: train.numEquipWithOpenThdAlerts,
        earlyWarningCount: train.numEquipWithEarlyWarnings,
        maintenanceAdvisoryCount: train.numEquipWithMaintenanceAdvisories,
        interchangeRestricted: train.numInterchangeRestricted,
        udeScoreCount: train.numEquipWithUdeScore,
        effectiveBrakeCount: train.numEquipWithEffectiveBrakes,
        effectiveBrakePercentage: effectiveBrakePercentage.toFixed(1),
        isAboveEffectiveBrakesThreshold: (effectiveBrakePercentage < 95),
        hasMandatoryWildAlerts: (train.numEquipWithOpenMandatoryWildAlerts > 0),
        includesHazmat: (train.numEquipWithHazmat > 0),
        hasAbtOverDue: (train.numEquipWithAbtOverdue > 0),
        hasAnnualAbtOverdue: (train.numEquipWithLastAbtOverOneYear > 0)
      });
    })
    return trainList;
  }
});

assetHealthApp.filter('transactionstatus',function(){
  return function(logEntries){
	  var status = 'processed';
	  angular.forEach(logEntries,function(value,index){
		  if(value.logLevel == 'ERROR'){
			  status = 'error';
		  }
	  },this);
    return status;
  };
});

assetHealthApp.filter('transactionToSubmission',function(){
    return function(transaction){
      
      //Class 1 : eventType=CLASSI,submittingCarrier=,eventDate=2013-09-06T03:01:00-0400,inspectionStation=WI/IL C&M,inspectionState=WI
      //LORF : eventType=LORF,trainId=test0910e,eventDate=2013-09-03T08:00:00-0400
    	
      var extractLookup = function(type, identifier){
    	  var getValue = function(text,key){
	          text = text || '';
	          var idx = text.indexOf(key + '=');
	          if(idx != -1){
	          	idx += (key.length + 1);
	              delIdx = text.indexOf(',',idx);
	              if(delIdx != -1){
	                return text.substring(idx,text.indexOf(',',idx));    
	              }else{
	                return text.substring(idx);    
	              }
	          }else{
	              return 'N/A';
	          }
    	  }
    	  if(type == 'LORF'){
    		  return {
    			eventDate: getValue(identifier,'eventDate'),
     			trainId: getValue(identifier,'trainId')
    		  }
    	  }else if(type == 'CLASSI'){
    		  return{
    			 eventDate: getValue(identifier,'eventDate'),
     			 inspectionStation: getValue(identifier,'inspectionStation'),
     			 inspectionState: getValue(identifier,'inspectionState')
    		  }
    	  }
      };
      
      var submission = {
		  transactionId: transaction.transactionId,
		  filename: transaction.context.userMessageId || "(not from file)",
		  date: transaction.context.transactionDate,
		  status: 'processed',
		  errors: [],
		  type: transaction.context.messageType
      };
	  angular.forEach(transaction.logEntries,function(value,index){
        if(value.logLevel == 'ERROR' || value.logLevel == 'INPUT_ERROR'){
		  this.status = 'error';
		  this.errors.push({
		    lookup: extractLookup(this.type, value.documentId),
			code: value.status,
			details: (value.phase == 'BUSINESS')?value.details:'A system error occured.'
		  });
		}
      },submission);
	    return submission;
	  }
	});

assetHealthApp.filter('healthRecordParsingFilter',function(){
    var today = new Date(); 
	
    var asDate = function(dateString){
      if(dateString == null || dateString == undefined){
    	  return null;
      }else{
    	  return new Date(dateString);
      }
    }
    
	var isPastDate = function(date){
      if(date != null && date != undefined){
        return (date < today);
      }
      return false;
    }

	var extractDetailsValue = function(details,key){
		var re = new RegExp("(^|[ ;])" + key + "=(.*?)(;|$)");
		var groups = re.exec(details) || [];
		if(groups.length >= 3){
			return groups[2];
		}
		return null;
	}
	
	var extractPkiValue = function(pkis,key){
	  if(pkis.pki["@label"] == key){
        return pkis.pki["$"];
      }
      return null;
	}
	
	var ehmsAlertHandler = function(record,health){
		health.ehmsAlerts.push(
		   {
			 type:record.type,
			 date:record.effectiveTimestamp,
			 level:record.conditionCode,
			 location:record.location
		   }
		);
	};
	
	var mappedParsers = {
		"INSPECTION":{
			"ABP":function(record,health){},
			"ABT":function(record,health){
              health.umlerInspectionData.abtDateDone = record.effectiveTimestamp
			},
	    	"AFM":function(record,health){},
	    	"ARC":function(record,health){},
	    	"ARI":function(record,health){},
	    	"ARR":function(record,health){},
	    	"CSI":function(record,health){},
	    	"DLI":function(record,health){},
	    	"FRA":function(record,health){},
	    	"FRB":function(record,health){},
	    	"FRQ":function(record,health){},
	    	"FRY":function(record,health){},
	    	"QMI":function(record,health){},
	    	"REF":function(record,health){},
	    	"VFC":function(record,health){}
		},
		"COMPONENT":{
			"ASSOCIATION":function(record,health){}
		},
		"INDUSTRY_ALERT":{
			"ABD":ehmsAlertHandler,
			"THD":ehmsAlertHandler,
	    	"TPDG":ehmsAlertHandler,
	    	"TPDL":ehmsAlertHandler,
	    	"WILD":ehmsAlertHandler
		},
		"HEALTH_STATUS":{
		  "EFFECTIVE_BRAKE_IND":function(record,health){
            health.brakeEffectiveness = record.conditionCode;
		  },
       	  "HAZMAT_IND":function(record,health){
            health.hazmatIndicator = record.conditionCode;
		  },
       	  "UDE_SCORE":function(record,health){
            health.udeData.score = extractPkiValue(record.pkis,'UdeScore');
            health.udeData.count = extractDetailsValue(record.details,'TOTAL_UDE_COUNT');
            health.udeData.groupCount = extractDetailsValue(record.details,'TOTAL_CAR_GROUPS');
		  }
		},
		"EARLY_WARNINGS":{
		  "EW":function(record,health){
			  health.earlyWarningsAdvisories.push(
			    {type:record.type,
			     noticeNumber:record.recordKey,
			     effectiveDate:record.effectiveTimestamp,
			     expirationDate:extractDetailsValue('Expires'),
			     title:record.title
			   });  
		  },
	      "MA":function(record,health){
	    	  health.earlyWarningsAdvisories.push(
	  			    {type:record.type,
	  			     noticeNumber:record.recordKey,
	  			     effectiveDate:record.effectiveTimestamp,
	  			     expirationDate:extractDetailsValue(record.details,'Expires'),
	  			     title:record.title
	  			   });    
		  }
		},
		"DDCT_INCIDENT":{
		  "1":function(record,health){},
		  "107":function(record,health){},
		  "108":function(record,health){},
		  "95":function(record,health){}
		},"DDCT_INCIDENT_DEFECT":{
		  "1":function(record,health){},
		  "107":function(record,health){},
		  "108":function(record,health){},
		  "95":function(record,health){}
		},
		"DDCT_DEFECT_CARD":{
		  "1":function(record,health){},
		  "107":function(record,health){},
		  "108":function(record,health){},
		  "95":function(record,health){}
		},
		"DATA_SUMMARY":{
		  "ACOUSTIC_RBAM":function(record,health){},
		  "SALIENT_WHEEL_IMPACT":function(record,health){}
		},
		"INSPECTION_DUE":{
		  "ABT_5/8_YEAR":function(record,health){
			var date = asDate(record.effectiveTimestamp);
	        health.umlerInspectionData.abt58DueDate = date;
	        health.umlerInspectionData.abt58PastDue = isPastDate(date);
		  },
		  "ABT_ANNUAL":function(record,health){
			var date = asDate(record.effectiveTimestamp);
			health.umlerInspectionData.abtAnnualDueDate = date;
			health.umlerInspectionData.abtAnnualPastDue = isPastDate(date);
		  },
		  "AUTORACK":function(record,health){},
		  "DOOR_LUBE":function(record,health){}
		}
	}
	
    return function(healthRecordDetail){
      var parsedHealthRecord = {
        ehmsAlerts:[], //type,date,level,location
        earlyWarningsAdvisories:[], //type,noticeNumber,effectiveDate,expirationDate,title
        umlerInspectionData:{
          abtDateDone:null,
          abtAnnualDueDate:null,
          abtAnnualPastDue: false,
          abt58DueDate:null,
          abt58PastDue:false
        },
        udeData:{
          score:null,
          count:null,
          groupCount:null
        },
        hazmatIndicator:null,
        brakeEffectiveness:null
      }
      
      angular.forEach(healthRecordDetail,function(value){
    	  mappedParsers[value.category][value.type](value,parsedHealthRecord);
	  },this);
      
      
      
      return parsedHealthRecord;
    }
});