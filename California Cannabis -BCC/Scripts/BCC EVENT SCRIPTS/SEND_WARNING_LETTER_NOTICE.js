if ((wfTask == "BCC Supervisor") && wfStatus == "Issue Letter of Warning") {
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	emailContacts_BCC("All", "DCA WARNING LETTER", vEParams, "Warning Letter", vRParams);
}
