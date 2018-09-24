//Script 143
//Record Types:	P​ublicWorks/Traffic/Traffic Engineering Request/NA
//Event: 		WorkflowTaskUpdateAfter (WTUA)
//Desc:			If the wfTask = “Work Order to Traffic OPS” and the wfStatus = “Completed” 
//				Then send email notification(Email Template TBD by Aurora) 
//				to Anna Bunce(abunce@auroragov.org) which will have details 
//				that the work order has been completed.    
//Created By: Silver Lining Solutions

function script143_SendRenewalEmailWhenWOtoTrafficOPSComplete() {
	logDebug("script143_SendRenewalEmailWhenWOtoTrafficOPSComplete() started.");
	try{
		var emlTo = "chad@esilverliningsolutions.com";
		
		if ( wfTask == "Work Order to Traffic OPS" && wfStatus == "Completed" ) 
		{
			var capID4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());
			var emailParameters = aa.util.newHashtable();
			var reportFile = [];
			var sendResult = sendNotification("noreply@aurora.gov",emlTo,"","TEST_FOR_SCRIPTS",emailParameters,reportFile,capID4Email);
			if (!sendResult) { logDebug("script143: UNABLE TO SEND NOTICE!  ERROR: "+sendResult); }
			else { logDebug("script143: Sent email notification that work order is complete to "+emlTo)}
		}
	}
	catch(err){
		showMessage = true;
		comment("Error on custom function script143_SendRenewalEmailWhenWOtoTrafficOPSComplete(). Please contact administrator. Err: " + err);
		logDebug("Error on custom function script143_SendRenewalEmailWhenWOtoTrafficOPSComplete(). Please contact administrator. Err: " + err);
	}
	logDebug("script143_SendRenewalEmailWhenWOtoTrafficOPSComplete() ended.");
};//END script143_SendRenewalEmailWhenWOtoTrafficOPSComplete();
