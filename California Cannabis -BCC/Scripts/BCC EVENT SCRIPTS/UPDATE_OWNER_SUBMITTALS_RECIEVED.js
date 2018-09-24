// Begin script to update Application to Owner Submittals Received when all have been submitted.
if ((publicUser && vEventName == "ConvertToRealCAPAfter") || (!publicUser && vEventName == "ApplicationSubmitAfter")) {
	var parentId = null;
	var parentIdResult;
	var numberOfOwners;
	var numberOwnerSubmittals;
	var parentOwnerTable;
	var relatedOwnerSubmittals;
	
	logDebug("ETW isAmendment(): " + isAmendment());
	
	if (AInfo["Application ID"] && AInfo["Application ID"] != "") {
		parentIdResult = aa.cap.getCapID(AInfo["Application ID"]);
		if (parentIdResult.getSuccess()) {
			parentId = parentIdResult.getOutput();
			numberOfOwners = 0;
			parentOwnerTable = loadASITable("LIST OF OWNERS", parentId);
			if (parentOwnerTable && parentOwnerTable != null) {
				numberOfOwners = parentOwnerTable.length;
			}
			numberOwnerSubmittals = 0;
			relatedOwnerSubmittals = getChildren("Licenses/Cannabis/Application Amendment/Owner Submittal", parentId);
			if (relatedOwnerSubmittals != null) {
				numberOwnerSubmittals = relatedOwnerSubmittals.length;
			}
			
			logDebug("original numberOwnerSubmittals: " + numberOwnerSubmittals);
			
			/*
			//CTRCA doesn't return the current record as a child when the amendment button is selected in ACA. In this case the parentCapId is defined.
			if (vEventName == "ConvertToRealCAPAfter" && parentCapId != null) {
				numberOwnerSubmittals = numberOwnerSubmittals + 1;
			}
			*/
			
			logDebug("numberOfOwners: " + numberOfOwners);
			logDebug("numberOwnerSubmittals: " + numberOwnerSubmittals);
			
			// numbers match set application workflow Application Acceptance to Owner Submittals Received
			// call WTUA for Application Received
			if (numberOfOwners == numberOwnerSubmittals) {
				var vProcessID = getProcessID("Application Acceptance", parentId);
				var vProcessCode = getProcessCode("Application Acceptance", parentId);
				var vTaskStepNum;
				vTaskStepNum = getTaskStepNumber(vProcessCode, "Application Acceptance", parentId);

				// defect 2768.   Owner submittals turning off the "Additional Info Required?" record status.   we will mitigagte by changing it back. 2547
				
				var addlInfoNeeded = (aa.cap.getCap(parentId).getOutput().getCapModel().getCapStatus().equals("Additional Info Needed"));
				
				var vTmpCapId = capId;
				capId = parentId;
				resultWorkflowTask("Application Acceptance", "Owner Submittals Received", "Update by UPDATE_OWNER_SUBMITTALS_RECIEVED.js", "Update by UPDATE_OWNER_SUBMITTALS_RECIEVED.js");
				capId = vTmpCapId;
				
				runWTUAForWFTaskWFStatus("Application Acceptance", vProcessID, vTaskStepNum, "Owner Submittals Received", parentId);

				// defect 2768.   Owner submittals turning off the "Additional Info Required?" record status.   we will mitigagte by changing it back. 2547
				if (addlInfoNeeded) {
					updateAppStatus("Additional Info Needed","reset back to this status by UPDATE_OWNER_SUBMITTALS_RECIEVED",parentId);
				}
			}
		}
	}
}
// End script to update Application to Owner Submittals Received when all have been submitted.