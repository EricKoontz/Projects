// Begin script to check if a temporary license has not been requested or previously issued and prevent if either is yes
if ((wfTask == "Issuance" && wfStatus == "Temporarily Issued") || (wfTask == "Supervisory Review" && wfStatus == "Temporarily Approved") || (wfTask == "Initial Review" && wfStatus == "Recommend Approval - Temporary")) {
	var vTempASI = getAppSpecific("Are you requesting a temporary license?");

	//check to see if a temporary license has already been issued
	var vIssued = false;
	var vWFTaskHistory = aa.workflow.getWorkflowHistory(capId, 'Issuance', null).getOutput();
	var vTaskModel;
	var vTaskStatus;
	var x = 0;
	for (x in vWFTaskHistory) {
		vTaskModel = vWFTaskHistory[x];
		vTaskStatus = vTaskModel.getDisposition();
		if (vTaskStatus == 'Temporarily Issued' && vTaskStatus != wfStatus) {
			vIssued = true;
			break;
		}
	}

	if (vTempASI != "Yes") {
		cancel = true;
		showMessage = true;
		comment("'" + wfStatus + "' cannot be selected because the Owner Applicant has not requested a temporary license.");
	}
	if (vIssued == true) {
		cancel = true;
		showMessage = true;
		comment("'" + wfStatus + "' cannot be selected because a temporary license has previously been issued for this application.");
	}
}
// End script to check if a temporary license has not been requested or previously issued and prevent if either is yes