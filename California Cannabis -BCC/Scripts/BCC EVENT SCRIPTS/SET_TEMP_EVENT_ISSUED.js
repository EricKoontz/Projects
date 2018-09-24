// Start script to update Issuance task with Issued status for Temp Event Applications
if (wfTask == "Supervisory Review" && wfStatus == "Approved" && balanceDue == 0) {
	var vProcessID;
	var vProcessCode;
	var vTaskStepNum;
	vProcessID = getProcessID("Issuance", capId);
	vProcessCode = getProcessCode("Issuance", capId);
	vTaskStepNum = getTaskStepNumber(vProcessCode, "Issuance", capId);
	resultWorkflowTask("Issuance", "Issued", "Updated by SET_TEMP_EVENT_ISSUED", "Updated by SET_TEMP_EVENT_ISSUED");
	runWTUAForWFTaskWFStatus("Issuance", vProcessID, vTaskStepNum, "Issued", capId);
}
// End script to update Issuance task with Issued status for Temp Event Applications
