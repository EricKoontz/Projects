if (wfStatus.equals("90-Day Extension Issued")) {
	//Generate license report and email
	var vEmailTemplate;
	var vReportTemplate;
	var vLicenseID = getParentCapID4Renewal();

	vEmailTemplate = "BCC TEMP LICENSE 90 DAY EXTENSION NOTIFICATION";
	if (appMatch("Licenses/Cannabis/Event Organizer/Temporary License", vLicenseID)) {
		vReportTemplate = "CEO Temporary License";
	} else {
		vReportTemplate = "Temporary Cannabis License";
	}

	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", vLicenseID.getCustomID());
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", vLicenseID.getCustomID());

	tmpCap = capId;
	capId = vLicenseID;
	emailContacts_BCC("All", vEmailTemplate, vEParams, vReportTemplate, vRParams);
	capId = tmpCap;
}
