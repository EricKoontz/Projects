if (wfTask.equals("Issuance") && wfStatus.equals("Waiting for Payment")) {
	var vEParams = aa.util.newHashtable();
	var vFeeDue = parseFloat(balanceDue);
	vFeeDue = formatCurrency(vFeeDue);
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	addParameter(vEParams, "$$FeesDue$$", vFeeDue);
	emailContacts_BCC("All", "BCC FEES DUE NOTIFICATION", vEParams, "", "");
}
