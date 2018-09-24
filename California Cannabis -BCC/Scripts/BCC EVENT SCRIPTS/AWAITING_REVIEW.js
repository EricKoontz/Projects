// Begin script to set 'Awaiting Review'. Runs the WTUA event for Initial Review - Awaiting Review
var vReviewTask;
if (appMatch("Licenses/Cannabis/Application Amendment/Owner Submittal")){
	vReviewTask = "Review";
}
else {
	vReviewTask = "Initial Review";
}

if (isTaskActive(vReviewTask) && (taskStatus(vReviewTask) == null || taskStatus(vReviewTask) == undefined) && balanceDue == 0 && !isTaskActive("Application Acceptance")) {
	var vProcessID = getProcessID(vReviewTask, capId);
	var vProcessCode = getProcessCode(vReviewTask, capId);
	var vTaskStepNum;
	vTaskStepNum = getTaskStepNumber(vProcessCode, vReviewTask, capId);
	updateTask(vReviewTask, "Awaiting Review", "Update by script AWAITING_REVIEW", "Update by script AWAITING_REVIEW");
	//runWTUAForWFTaskWFStatus(vReviewTask, vProcessID, vTaskStepNum, "Awaiting Review", capId);
}

// End script to set 'Awaiting Review'
