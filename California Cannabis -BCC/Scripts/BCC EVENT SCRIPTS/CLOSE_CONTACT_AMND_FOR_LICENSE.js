//Begin script to auto-close contact amendment if started from a license record, story 2736
var vReviewTask;
var vNewStatus;

vReviewTask = "Review";
vNewStatus = "Changes Accepted";

if ((appMatch("Licenses/*/*/License", parentCapId)) && (isTaskActive(vReviewTask) && (taskStatus(vReviewTask) == "Submitted" ))) {
	var vProcessID = getProcessID(vReviewTask, capId);
	var vProcessCode = getProcessCode(vReviewTask, capId);
	var vTaskStepNum;
	vTaskStepNum = getTaskStepNumber(vProcessCode, vReviewTask, capId);
	resultWorkflowTask(vReviewTask, vNewStatus, "Closed by CLOSE_CONTACT_AMND_FOR_LICENSE", "Closed by CLOSE_CONTACT_AMND_FOR_LICENSE");
	runWTUAForWFTaskWFStatus(vReviewTask, vProcessID, vTaskStepNum, vNewStatus, capId);
	closeTask("Close Out","Completed", "Closed by CLOSE_CONTACT_AMND_FOR_LICENSE", "Closed by CLOSE_CONTACT_AMND_FOR_LICENSE");
}


////End script to auto-close contact amendment if started from a license record, story 2736

