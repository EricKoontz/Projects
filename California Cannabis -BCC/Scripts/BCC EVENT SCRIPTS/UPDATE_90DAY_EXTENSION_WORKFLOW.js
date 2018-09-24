// Begin script to auto process 90-Day Temporary Extensions
var vReviewTask;
var vNewStatus;

vReviewTask = "90-Day Extension - Temp";
vNewStatus = "90-Day Extension Issued"

if (isTaskActive(vReviewTask) && (taskStatus(vReviewTask) == null || taskStatus(vReviewTask) == undefined || taskStatus(vReviewTask) == "")) {
	var vProcessID = getProcessID(vReviewTask, capId);
	var vProcessCode = getProcessCode(vReviewTask, capId);
	var vTaskStepNum;
	vTaskStepNum = getTaskStepNumber(vProcessCode, vReviewTask, capId);
	resultWorkflowTask(vReviewTask, vNewStatus, "Update by script UPDATE_90DAY_EXTENSION_WORKFLOW", "Update by script UPDATE_90DAY_EXTENSION_WORKFLOW");
	runWTUAForWFTaskWFStatus(vReviewTask, vProcessID, vTaskStepNum, vNewStatus, capId);
}
// End script to auto process 90-Day Temporary Extensions