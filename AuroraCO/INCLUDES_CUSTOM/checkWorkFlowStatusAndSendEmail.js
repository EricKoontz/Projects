function checkWorkFlowStatusAndSendEmail(workflowTask, workflowStatus, emailTemplateName, reportName, rptParams) {
	var applicantEmail = null;
	var recordApplicant = getContactByType("Applicant", capId);
	if (recordApplicant) {
		applicantEmail = recordApplicant.getEmail();
	}
	if (applicantEmail == null) {
		logDebug("**WARN Applicant on record " + capId + " has no email");
		return false
	}
	if (wfTask == workflowTask && wfStatus == workflowStatus) {

		var emailParams = aa.util.newHashtable();
		addParameter(emailParams, "$$altID$$", cap.getCapModel().getAltID());
		addParameter(emailParams, "$$recordAlias$$", cap.getCapModel().getCapType().getAlias());
		addParameter(emailParams, "$$recordStatus$$", cap.getCapModel().getCapStatus());
		addParameter(emailParams, "$$wfComment$$", wfComment);
		addParameter(emailParams, "$$wfTask$$", wfTask);
		addParameter(emailParams, "$$wfStatus$$", wfStatus);
		sendEmailWithReport(applicantEmail, "", emailTemplateName, reportName, rptParams, emailParams);

	}
	return true;
}
