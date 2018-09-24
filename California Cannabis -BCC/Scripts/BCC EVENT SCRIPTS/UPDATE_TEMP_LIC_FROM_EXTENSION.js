// Begin script to update temp license with new expiration date
if (wfTask == "90-Day Extension - Temp" && wfStatus == "90-Day Extension Issued") {
	var vLicenseID;
	var tmpCap;
	var renewalCapProject;

	//Get the parent license
	vLicenseID = getParentLicenseCapID(capId);

	//Check if the current record is a renewal.
	if (appTypeArray[3] == "90-Day Temporary Extension" && vLicenseID != null) {
		//get current expiration date.
		vLicenseObj = new licenseObject(null, vLicenseID);
		vExpDate = vLicenseObj.b1ExpDate;
		vExpDate = new Date(vExpDate);
		LicExp_mm = vExpDate.getMonth() + 1;
		LicExp_mm = (LicExp_mm < 10) ? '0' + LicExp_mm : LicExp_mm;
		LicExp_dd = vExpDate.getDate();
		LicExp_yyyy = vExpDate.getFullYear();
		vExpDate = LicExp_mm + "/" + LicExp_dd + "/" + LicExp_yyyy;
		//update expiration by adding 90 days
		vNewExpDate = dateAdd(vExpDate, 90);
		logDebug("Updating Expiration Date to: " + vNewExpDate);
		vLicenseObj.setExpiration(vNewExpDate);
		//set license record expiration to active
		vLicenseObj.setStatus("Active");

		//Set renewal to complete, used to prevent more than one renewal record for the same cycle
		renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
		if (renewalCapProject != null) {
			renewalCapProject.setStatus("Complete");
			aa.cap.updateProject(renewalCapProject);
		}
	}
}
// End script to update temp license with new expiration date
