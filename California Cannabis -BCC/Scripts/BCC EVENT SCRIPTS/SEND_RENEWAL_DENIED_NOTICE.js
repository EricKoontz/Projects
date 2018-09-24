// Begin script to send renewal denial email - User Story 179
if (wfStatus.equals("Denied")) {
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	
	// Use the contacts from the parent license for notification
	var tempId = capId;
	capId = getParentCapID4Renewal();
	emailContacts_BCC("All", "DCA_OWNER_APPLICANT_RENEWAL_DENIED", vEParams, "Denial of License Renewal", vRParams);
	capId = tempId;
}
// End script to send denial email
