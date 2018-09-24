// Begin script to check that Owner Applicant and Business Owner count matches the Owners ASIT
if ((wfTask == "Application Acceptance" && wfStatus == "Application Received") || (wfTask == "Initial Review" && wfStatus == "Recommend Approval")) {
	var vOwnersAllSubmitted = businessOwnersMatchASIT(capId);
	
	if (vOwnersAllSubmitted == false) {
		cancel = true;
		showMessage = true;
		comment("'" + wfStatus + "' cannot be selected because not all Owner Submittals have been processed");
	}
}
// Begin script to check that Owner Applicant and Business Owner count matches the Owners ASIT
