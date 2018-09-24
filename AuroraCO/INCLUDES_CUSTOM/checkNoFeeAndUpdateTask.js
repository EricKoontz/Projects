
/**
 * Check Check if workflow status and workflow task matches arguments, then updates: a task, appStatus, and send email to Applicant
 * @param recordCapId
 * @param workFlowTask
 * @param workflowStatusArray
 * @param emailTemplate
 * @param updateWfTaskName
 * @param updateTaskToStatus
 * @param newAppStatus
 * @returns {Boolean} true if task name and status matches, false if error
 */
function checkNoFeeAndUpdateTask(recordCapId, workFlowTask, workflowStatusArray, emailTemplate, updateWfTaskName, updateTaskToStatus, newAppStatus) {
	if (wfTask == workFlowTask) {

		var statusMatch = false;

		for (s in workflowStatusArray) {
			if (wfStatus == workflowStatusArray[s]) {
				statusMatch = true;
				break;
			}
		}//for all status options

		if (!statusMatch) {
			return false;
		}

		//closeTask() will not promote (activate) next task
		branchTask(updateWfTaskName, updateTaskToStatus, "by script No-Fees", "by script No-Fees");

		//update app status
		updateAppStatus(newAppStatus, "by script No-Fees");

		//send email
		var applicant = getContactByType("Applicant", recordCapId);
		if (!applicant || !applicant.getEmail()) {
			logDebug("**WARN no applicant found on or no email capId=" + recordCapId);
			return false;
		}
		var toEmail = applicant.getEmail();
		var files = new Array();

		var eParams = aa.util.newHashtable();
		addParameter(eParams, "$$altID$$", cap.getCapModel().getAltID());
		addParameter(eParams, "$$recordAlias$$", cap.getCapType().getAlias());
		addParameter(eParams, "$$recordStatus$$", cap.getCapStatus());
		addParameter(eParams, "$$balance$$", feeBalance(""));
		addParameter(eParams, "$$wfTask$$", wfTask);
		addParameter(eParams, "$$wfStatus$$", wfStatus);
		addParameter(eParams, "$$wfDate$$", wfDate);
		addParameter(eParams, "$$wfComment$$", wfComment);
		addParameter(eParams, "$$wfStaffUserID$$", wfStaffUserID);
		addParameter(eParams, "$$wfHours$$", wfHours);

		var sent = aa.document.sendEmailByTemplateName("", toEmail, "", emailTemplate, eParams, files);
		if (!sent.getSuccess()) {
			logDebug("**WARN sending email failed, error:" + sent.getErrorMessage());
			return false;
		}
		return true;
	} else {
		return false;
	}
}