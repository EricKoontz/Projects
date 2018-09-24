// Begin script to complete the renewal and send notifications
if (wfTask == "Issuance" && wfStatus == "Issued" && balanceDue == 0) {
	var vLicenseID;
	var vIDArray;
	var renewalCapProject;
	var vExpDate;
	var vNewExpDate;
	var vLicenseObj;
	var vTempId;
	var vEParams;
	var vRParams;
	
	// Get the parent license
	vLicenseID = getParentLicenseCapID(capId);
	vIDArray = String(vLicenseID).split("-");
	vLicenseID = aa.cap.getCapID(vIDArray[0],vIDArray[1],vIDArray[2]).getOutput();

	if (vLicenseID != null) {
		// Get current expiration date.
		vLicenseObj = new licenseObject(null, vLicenseID);
		vExpDate = vLicenseObj.b1ExpDate;
		vExpDate = new Date(vExpDate);
		// Extend license expiration by 1 year
		vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
		// Update license expiration date
		logDebug("Updating Expiration Date to: " + vNewExpDate);
		vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
		// Set license record expiration to active
		vLicenseObj.setStatus("Active");

		//Set renewal to complete, used to prevent more than one renewal record for the same cycle
		renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
		if (renewalCapProject != null) {
			renewalCapProject.setStatus("Complete");
			renewalCapProject.setRelationShip("R");  // move to related records
			aa.cap.updateProject(renewalCapProject);
		}
		
		// Copy contacts from renewal to license
		copyContactsByType(capId, vLicenseID, "Business");
		copyContactsByType(capId, vLicenseID, "Primary Contact Person");
		
		// Send renewed license email/report
		// Save current capId
		vTempId = capId;
		capId = vLicenseID;

		vEParams = aa.util.newHashtable();
		addParameter(vEParams, "$$LicenseType$$", aa.cap.getCap(vLicenseID).getOutput().getCapModel().getAppTypeAlias());
		addParameter(vEParams, "$$ExpirationDate$$", vLicenseObj.b1ExpDate);
		addParameter(vEParams, "$$ApplicationID$$", vLicenseID.getCustomID());

		vRParams = aa.util.newHashtable();
		addParameter(vRParams, "p1Value", vLicenseID.getCustomID());

		emailContacts_BCC("All", "BCC LICENSE RENEWED NOTIFICATION", vEParams, "License - Cannabis", vRParams);

		// Reset capId to original
		capId = vTempId;
		
		// Close renewal workflow
		closeTask("Close Out", "Issued", "Closed by COMPLETE_RENEWAL", "Closed by COMPLETE_RENEWAL");
	}
}
// End script to complete the renewal and send notifications