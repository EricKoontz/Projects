
/**
 * Activate a Task, set Complete=N, and assign cap staff to the Task
 * @param workFlowTaskArray {Array}
 * @param workflowStatusArray {Array}
 * @param taskNameToActivate
 * @returns {Boolean} true if wfTask and status matched, and if updates succeeded, false otherwise 
 */
function activateAndAssignWfTask(workFlowTaskArray, workflowStatusArray, taskNameToActivate) {

	var statusMatch = false;

	//check Tasks
	for (w in workFlowTaskArray) {
		if (wfTask == workFlowTaskArray[w]) {
			statusMatch = true;
			break;
		}
	}//for all workFlowTaskArray
	if (!statusMatch) {
		return false;
	}

	//check Status
	for (s in workflowStatusArray) {
		if (wfStatus == workflowStatusArray[s]) {
			statusMatch = true;
			break;
		}
	}//for all status options
	if (!statusMatch) {
		return false;
	}

	var task = aa.workflow.getTask(capId, taskNameToActivate);
	if (task.getSuccess())
		task = task.getOutput();

	task.setActiveFlag("Y");
	task.setCompleteFlag("N");
	task.setDisposition(null);//makes Status = In Progress
	var edited = aa.workflow.editTask(task);
	if (!edited.getSuccess()) {
		logDebug("**WARN editTask failed, error:" + edited.getErrorMessage());
	}//edit success?

	var capDetails = aa.cap.getCapDetail(capId).getOutput();
	var recordStaff = capDetails.getAsgnStaff();

	if (recordStaff == null || recordStaff == "") {
		logDebug("**WARN No staff assigned on record:");
		return false;
	}
	recordStaff = aa.person.getUser(recordStaff);
	if (!recordStaff.getSuccess()) {
		logDebug("**WARN failed to getUser for Staff:" + recordStaff);
		return false;
	}
	recordStaff = recordStaff.getOutput();

	task.getTaskItem().setAssignedUser(recordStaff);
	edited = aa.workflow.assignTask(task.getTaskItem());
	if (!edited.getSuccess()) {
		logDebug("**WARN assignTask failed, error:" + edited.getErrorMessage());
		return false;
	}//edit success?
	return true;
}