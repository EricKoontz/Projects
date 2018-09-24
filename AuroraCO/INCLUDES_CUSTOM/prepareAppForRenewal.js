function prepareAppForRenewal() {
	logDebug("in prepareAppForRenewal");
	var partialCapId = getIncompleteCapId();
	var parentCapId = aa.env.getValue("ParentCapID");

	logDebug("Parent Cap id from environment = " + parentCapId);
	//1. Check to see if license is ready for renew
	if (isRenewProcess(parentCapId, partialCapId)) {
		logDebug("CAPID(" + parentCapId + ") is ready for renew. PartialCap (" + partialCapId + ")");
		//2. Associate partial cap with parent CAP.
		var result = aa.cap.createRenewalCap(parentCapId, partialCapId, true);
		if (result.getSuccess()) {
			//3. Copy key information from parent license to partial cap
			// copyKeyInfo(parentCapId, partialCapId);
			
			// 4. Update Veteran Custom field if contact is a veteran
			// if(getIfVeteran(parentCapId)) editAppSpecific("Veteran","Yes",partialCapId);
			// if(appMatch("Licenses/Nursing/Registered Nurse/Renewal",partialCapId)) updateRNSpecialtyCertificationTable(partialCapId,parentCapId);
			
			//4. Set B1PERMIT.B1_ACCESS_BY_ACA to "Y" for partial CAP to allow that it is searched by ACA user.
			aa.cap.updateAccessByACA(partialCapId, "Y");
		}
		else { logDebug("ERROR: Associate partial cap with parent CAP. " + result.getErrorMessage()); }
	}
	else { logDebug("This is not renewal process. PartialCapId = " + partialCapId + " ParentCapId = " + parentCapId); }
}