// Begin script to check that Owner Applicant and Business Owner count matches the Owners ASIT
if (wfTask == "Review" && wfStatus == "Review Completed") {
	var parentId = null;
	var numberOfOwners;
	var numberOfParentContacts;
	var parentOwnerTable;
	
	parentId = getParent();

	numberOfOwners = 0;
	parentOwnerTable = loadASITable("LIST OF OWNERS", parentId);
	if (parentOwnerTable && parentOwnerTable != null) {
		numberOfOwners = parentOwnerTable.length;
	}
	
	numberOfParentContacts = 0;
	conArray = getContactObjsByCap_BCC(parentId);
	for (var cIndex in conArray) {
		thisContact = conArray[cIndex];
		if (thisContact.type == "Business Owner") {
			numberOfParentContacts++;
		}
	}
	
	logDebug("numberOfOwners: "  + numberOfOwners);
	logDebug("numberOfParentContacts: " + numberOfParentContacts);
	
	// numbers match set application workflow Application Acceptance to Application Recieved
	// call WTUA for Application Received
	if (numberOfOwners == numberOfParentContacts) {
		var vProcessID = getProcessID("Application Acceptance", parentId);
		var vProcessCode = getProcessCode("Application Acceptance", parentId);
		var vTaskStepNum;
		vTaskStepNum = getTaskStepNumber(vProcessCode, "Application Acceptance", parentId);
		
		var vTmpCapId = capId;
		capId = parentId;		
		resultWorkflowTask("Application Acceptance", "Application Received", "Update by SET_APP_RECIEVED_OWNER_SUBMITTALS_MATCH_ASIT.js", "Update by SET_APP_RECIEVED_OWNER_SUBMITTALS_MATCH_ASIT.js");
		capId = vTmpCapId;
		
		runWTUAForWFTaskWFStatus("Application Acceptance", vProcessID, vTaskStepNum, "Application Received", parentId);
	}
}
// Begin script to check that Owner Applicant and Business Owner count matches the Owners ASIT
