// Begin script to check for an Owner Applicant prior to any workflow progress
if (wfStatus != "Void" && wfStatus != "Withdrawn") {
	var vOwnerApplicant = getContactObj(capId, "Owner Applicant");
	if (vOwnerApplicant == false) {
		showMessage = true;
		comment("An Owner Applicant contact is required prior to processing");
		cancel = true;
	}
}
// End script to check for an Owner Applicant prior to any workflow progress
