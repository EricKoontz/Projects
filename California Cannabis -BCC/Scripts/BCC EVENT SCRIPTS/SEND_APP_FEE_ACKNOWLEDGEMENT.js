//Send email to all contacts when application is submitted in back office. Email is to let them know the application number and fee amount accepted, User Story 1625
if (wfTask == "Application Acceptance" && wfStatus == "Application Received" && !appMatch("Licenses/Cannabis/Temporary Event/Application")) {
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	emailContacts_BCC('Owner Applicant', "DCA APPLICATION ACKNOWLEDGEMENT", vEParams, "Application Fee Acknowledgement", vRParams);
}




