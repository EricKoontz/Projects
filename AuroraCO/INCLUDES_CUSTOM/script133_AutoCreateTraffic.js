//script133_AutoCreateTraffic
//Record Types:	ODA/Pre App/Na/NA
//Event: WTUA - WorkflowTaskUpdateAfter
//Desc: When the workflow status Complete on WF task Prepare Preliminary Letter on a ODA/Pre App/Na/NA record,
//		check Traffic Review WF task TSI field Is Traffic Impact Study Required if Yes,
//		Then then automatically create the Traffic Impact Study record as a child to the ODA record. 
//Created By: Silver Lining Solutions

function script133_AutoCreateTraffic() {
	
	logDebug("script133_AutoCreateTraffic started.");
	try{
		if (wfTask==("Prepare Preliminary Letter") && wfStatus ==("Complete")) {
			if (AInfo["Traffic Impact Study Required"] == "Yes") {
				trafficCap = createChild("PublicWorks","Traffic","Traffic Impact","NA","Traffic Impact Study");
				if (!trafficCap.getSuccess()) {
					comment("Unable to create child record on script133_AutoCreateTraffic. Please contact administrator.");
				}
			}
		}
	} catch(err){
		showMessage = true;
		comment("Error on custom function script133_AutoCreateTraffic. Please contact administrator. Err: " + err);
		logDebug("script133: Error on custom function script133_AutoCreateTraffic. Please contact administrator. Err: " + err);
		logDebug("script133: A JavaScript Error occurred: WTUA:ODA/Pre App/Na/NA 133: " + err.message);
		logDebug(err.stack)
	}
	logDebug("script133_AutoCreateTraffic ended.");
//	if function is used        };//END WTUA:ODA/Pre App/Na/NA;

}

