// Begin script to send temporary denial notice - Story 1804
if (wfTask == "Supervisory Review" && wfStatus == "Temporary Denied") {
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	emailContacts_BCC("All", "DCA OWNER APPLICANT TEMP DENIED NOTIFICATION", vEParams, "Denial of Temporary License", vRParams);
}
// End script to send temporary denial notice - Story 1804

