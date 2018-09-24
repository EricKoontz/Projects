if (wfStatus.equals("Additional Info Requested")) {
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	emailContacts_BCC("All", "DCA OWNER APPLICANT DEFICIENCY NOTIFICATION", vEParams, "", "");
}
