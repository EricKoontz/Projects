//Begin script to invoice all fees and set workflow task Application Acceptance to Waiting for Payment when user Defers Payment in ACA
if ((publicUser && vEventName == "ConvertToRealCAPAfter") || (!publicUser && vEventName == "ApplicationSubmitAfter")) {
	if (feeAmountAll(capId, "NEW") > 0 && balanceDue == 0) {
		invoiceFeeAllNew(capId);
		updateTask("Application Acceptance", "Waiting for Payment", "Updated by WAITING_FOR_PAYMENT", "Updated by WAITING_FOR_PAYMENT");

		//Send email to all contacts when application is submitted in back office. Email is to let them know the application number and fee amount accepted, User Story 1625
		if (publicUser && vEventName == "ConvertToRealCAPAfter") {
			var vEParams = aa.util.newHashtable();
			addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
			addParameter(vEParams, "$$ApplicationID$$", capIDString);
			emailContacts_BCC("All", "BCC ACA DEFER PAYMENT NOTIFICATION", vEParams, "", "");
		}
	}
	if (balanceDue > 0) {
		logDebug("Updating Task");
		updateTask("Application Acceptance", "Waiting for Payment", "Updated by WAITING_FOR_PAYMENT", "Updated by WAITING_FOR_PAYMENT");
	}
}
//End script to invoice all fees and set workflow task Application Acceptance to Waiting for Payment when user Defers Payment in ACA
