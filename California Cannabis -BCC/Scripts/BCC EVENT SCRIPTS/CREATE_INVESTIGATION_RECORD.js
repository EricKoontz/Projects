// Begin script to create an investigation record
if (wfStatus == "Requires Investigation") {
	var vInvestRecId = createChild("Enforcement", "Cannabis", "Investigation", "Investigation");

	//Copy addresses from child to license
	copyAddress(capId, vInvestRecId);

	//Copy ASI from child to license
	copyASIInfo(capId, vInvestRecId);

	//Copy ASIT from child to license
	copyASITables(capId, vInvestRecId);

	//Copy Contacts from child to license
	copyContacts3_0(capId, vInvestRecId);

	//Copy Work Description from child to license
	aa.cap.copyCapWorkDesInfo(capId, vInvestRecId);

	//Copy application name from child to license
	editAppName(getAppName(capId), vInvestRecId);
	
	//Copy license number User Story 2576
	var lic = getParent();
	if (lic) {
		editAppSpecific("License Number",lic.getCustomID(),vInvestRecId);
		copyContacts3_0(lic, vInvestRecId);
	}
}
// End script to create an investigation record
