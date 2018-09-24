// Begin script to copy contacts from license to renewal for public users
if (publicUser == true) {
	// Get the parent license
	var vLicenseID = getParentLicenseCapID(capId);
	// Copy Contacts from license to renewal
	copyContactsByType(vLicenseID, capId,"Business Owner");
	copyContactsByType(vLicenseID, capId,"Owner Applicant");
	copyContactsByType(vLicenseID, capId,"Agent of Service");
	if (getContactByType("Business",capId) == false) {
		copyContactsByType(vLicenseID, capId,"Business");
	}
	if (getContactByType("Primary Contact Person",capId) == false) {
		copyContactsByType(vLicenseID, capId,"Primary Contact Person");
	}	
}
// End script to copy contacts from license to renewal for public users