
/**
 * check if wfTaskToCheck status equals statusToCheck, method will activate wfTaskToActivate
 * @param wfTaskToCheck task name to check status
 * @param statusToCheck status value to check if match match
 * @param wfTaskToActivate task name to activate
 * @returns {Boolean} true if criteria matched, and task activated, false otherwise
 */
function checkWfTaskToActivateAnother(wfTaskToCheck, statusToCheck, wfTaskToActivate) {
	if (isTaskStatus(wfTaskToCheck, statusToCheck)) {
		activateTask(wfTaskToActivate);
		return true;
	}
	return false;
}