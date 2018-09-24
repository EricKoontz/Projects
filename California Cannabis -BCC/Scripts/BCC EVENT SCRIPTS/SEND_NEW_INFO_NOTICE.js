if (wfTask.equals("Issuance") && !wfStatus.equals("Waiting for Payment")) {
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	emailContacts_BCC("All", "BCC NEW INFO NOTIFICATION", vEParams, "", "");
}
