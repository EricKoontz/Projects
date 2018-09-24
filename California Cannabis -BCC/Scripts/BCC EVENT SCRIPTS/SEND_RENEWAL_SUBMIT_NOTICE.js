// Begin script to send renewal submit email - User Story 180
if (wfStatus.equals("Submitted")) {
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	
	emailContacts_BCC("All", "DCA_OWNER_APPLICANT_RENEWAL_SUBMITTED", vEParams, "", "");
}
// End script to send renewal submit email
