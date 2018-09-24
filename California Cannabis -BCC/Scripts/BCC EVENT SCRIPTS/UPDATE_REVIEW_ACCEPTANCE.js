// Begin script to move workflow task Review to Submitted once payment has been recieved. Runs thr WTUA event.
if (isTaskActive("Review") && isTaskStatus("Review", "Waiting for Payment") && balanceDue == 0) {
	var vProcessID;
	var vProcessCode;
	var vTaskStepNum;
	vProcessID = getProcessID("Review", capId);
	vProcessCode = getProcessCode("Review", capId);
	vTaskStepNum = getTaskStepNumber(vProcessCode, "Review", capId);
	resultWorkflowTask("Review", "Submitted", "Updated by UPDATE_REVIEW_ACCEPTANCE", "Updated by UPDATE_REVIEW_ACCEPTANCE");
	runWTUAForWFTaskWFStatus("Review", vProcessID, vTaskStepNum, "Submitted", capId);		
}
// End script to move workflow task Review to Submitted once payment has been recieved. Runs thr WTUA event.