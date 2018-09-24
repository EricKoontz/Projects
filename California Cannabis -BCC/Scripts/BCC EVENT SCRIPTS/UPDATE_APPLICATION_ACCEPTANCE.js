// Begin script to move workflow task Application Acceptance to Submitted once payment has been received. Runs the WTUA event.
if (isTaskActive("Application Acceptance") && isTaskStatus("Application Acceptance", "Waiting for Payment") && balanceDue == 0) {
	var vProcessID;
	var vProcessCode;
	var vTaskStepNum;
	vProcessID = getProcessID("Application Acceptance", capId);
	vProcessCode = getProcessCode("Application Acceptance", capId);
	vTaskStepNum = getTaskStepNumber(vProcessCode, "Application Acceptance", capId);
	resultWorkflowTask("Application Acceptance", "Submitted", "Updated by UPDATE_APPLICATION_ACCEPTANCE", "Updated by UPDATE_APPLICATION_ACCEPTANCE");
	runWTUAForWFTaskWFStatus("Application Acceptance", vProcessID, vTaskStepNum, "Submitted", capId);		
}
// End script to move workflow task Application Acceptance to Submitted once payment has been received. Runs the WTUA event.
