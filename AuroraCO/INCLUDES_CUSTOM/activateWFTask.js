function activateWFTask(wfstr,ItemCapId) 
{
	var workflowResult = aa.workflow.getTaskItems(ItemCapId, wfstr, null, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) {
			var stepnumber = fTask.getStepNumber();
			aa.workflow.adjustTask(ItemCapId, stepnumber, "Y", "N", null, null)
			logMessage("Activating Workflow Task: " + wfstr);
			logDebug("Activating Workflow Task: " + wfstr);
		}
	}
}
 