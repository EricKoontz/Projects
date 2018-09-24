
/**
 * For all workflow tasks, with status equals one of wfStatusNamesArray, task item is activated (if not active) and updated with newTaskStatus
 * @param wfStatusNamesArray list of statuses to check if tasks have
 * @param newTaskStatus the status to be assigned to matched tasks
 * @returns {Boolean}
 */
function updateTaskStatusAndActivate(wfStatusNamesArray, newTaskStatus) {

	var tasks = aa.workflow.getTasks(capId);
	if (!tasks.getSuccess()) {
		logDebug("**WARN failed to get cap tasks, capId=" + capId + " Error:" + tasks.getErrorMessage());
		return false;
	}
	tasks = tasks.getOutput();

	if (tasks == null || tasks.length == 0) {
		logDebug("**WARN tasks list empty or null, capId=" + capId);
		return false;
	}

	for (w in wfStatusNamesArray) {
		for (t in tasks) {
			if (wfStatusNamesArray[w] == tasks[t].getDisposition()) {
				if (tasks[t].getActiveFlag() == "N") {
					activateTask(tasks[t].getTaskDescription());
				}
				updateTask(tasks[t].getTaskDescription(), newTaskStatus, "by script - document uploaded", "by script - document uploaded");
				//NO break; ... we need to check all tasks against each status
			}//status matched
		}//for all wf Tasks
	}//for all wfStatuses
	return true;
}