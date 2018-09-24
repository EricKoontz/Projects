
/**
 * Check Check if workflow status and workflow task matches arguments, send email to Applicant
 * @param workFlowTask
 * @param workflowStatusArray
 * @param emailTemplate
 * @returns {Boolean} true if task name and status matches, false if error
 */
function sendIncompleteApplicationEmail(workFlowTask, workflowStatusArray, emailTemplate) {
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

		//send email
		var applicant = getContactByType("Applicant", capId);
		if (!applicant || !applicant.getEmail()) {
			logDebug("**WARN no applicant found on or no email capId=" + capId);
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
		if (typeof wfComment !== 'undefined' && wfComment != null && wfComment != "") {
			addParameter(eParams, "$$wfComment$$", wfComment);
		}
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
