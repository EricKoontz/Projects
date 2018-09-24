//Script 270
//Record Types:	​PublicWorks\Traffic\Traffic Engineering Request\NA​​
//Event: 		WTUA
//Desc:			IF wfTask = "Generate Work Order" and wfStatus = "Generated"
//				THEN Copy Record ID into Custom Field "Work Order Number"
//					(will now use record ID if ops does not like this they can change the mask.)
//Created By: Silver Lining Solutions

function script270_GenerateWorkOrderNumber() {
	logDebug("script270_GenerateWorkOrderNumber started.");
	try{
		altId = capId.getCustomID();
		if ( wfTask == "Generate Work Order" && wfStatus == "Generated" ) {
			logDebug("script270: Copying Record ID ->"+altId+"<- to Work Order Number!");
			editAppSpecific("Work Order Number",altId);
		}
	}
	catch(err){
		showMessage = true;
		comment("script270: Error on custom function script270_GenerateWorkOrderNumber(). Please contact administrator. Err: " + err);
		logDebug("script270: Error on custom function script270_GenerateWorkOrderNumber(). Please contact administrator. Err: " + err);
	}
	logDebug("script270_GenerateWorkOrderNumber() ended.");
};//END script270_GenerateWorkOrderNumber();
