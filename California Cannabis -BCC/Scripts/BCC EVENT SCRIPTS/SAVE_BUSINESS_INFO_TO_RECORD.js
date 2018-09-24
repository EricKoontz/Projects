// Copy Business contact information (Business Name and Address) to record
//if ((publicUser && vEventName == "ConvertToRealCAPAfter") || (!publicUser && vEventName == "ApplicationSubmitAfter")) {
var vBusinesses = [];
var vBusiness;
var vBusinessObj;
var vAddressType;
var vAddresses = [];
var vAddress;
var x = 0;
var vCapScriptModel;
var vCapModel;
var vAddrModel;

// Get Business contact object
if (appMatch("Licenses/*/Event Organizer/*") || appMatch("Licenses/*/Temporary Event/*")) {
	vBusinesses = getContactObjsByCap_BCC(capId, 'Event Business');
	vAddressType = "Mailing";
} else {
	vBusinesses = getContactObjsByCap_BCC(capId, 'Business');
	vAddressType = "Premise";
}

// Save the business name to the app name if it doesn't exist. This can happen when the ACA user selects defer payment and the ASA event actions do not save.
//if (vBusinesses.length > 0 && (getAppName() == null || getAppName() == "")) { // ETW Updated 3/16/18
if (vBusinesses.length > 0) {
	// Assume only one business contact
	vBusiness = vBusinesses[0];
	if (vBusiness && typeof vBusiness.people != "undefined") { // account for the missing contact bug
		// Save business name
		vBusinessObj = vBusiness.people;
		// If contact type is individual use the contact type 2
		if (vBusinessObj.getContactTypeFlag() == "individual" || (vBusinessObj.getContactTypeFlag() == null && vBusinessObj.getBusinessName2() != null && vBusinessObj.getBusinessName2() != "")) {
			editAppName(vBusinessObj.getBusinessName2());
		}
		// For all others use business name US#2389 and 2392
		else if (vBusinessObj.getBusinessName() != null && vBusinessObj.getBusinessName() != "") {
			editAppName(vBusinessObj.getBusinessName());
		}
		// Business name is required so we should not come here, but just in case
		else if (vBusinessObj.getTradeName() != null && vBusinessObj.getTradeName() != "") {
			editAppName(vBusinessObj.getTradeName());
		}
		// Use Business Name as a last resort

		// Copy Business Entity type from contact to ASI story 2672
		vBusEntity = vBusiness.getCustomField("What is your business's organizational structure?");
		if (vBusEntity != null && vBusEntity != "") {
			editAppSpecific("What is your business's organizational structure?", vBusEntity);
		}

		if (!appMatch("Licenses/*/Temporary Event/*")) { // events use the address for something else
			// Save address to the record if it doesn't already exists. This can happen when the ACA user selects defer payment and the ASA event actions do not save.
			vAddresses = vBusiness.addresses;
			//if (vAddresses && getAddress(capId) == null) {
			if (vAddresses.length > 0) {
				// Remove existing record addresses
				removeAllCapAddresses(capId);
				x = 0;
				for (x in vAddresses) {
					vAddress = vAddresses[x];
					// Use only the Premise address type - assumes only one
					if (vAddress.getAddressType() == vAddressType) {
						// Get transactional address model
						vCapScriptModel = aa.cap.getCap(capId).getOutput();
						vCapModel = vCapScriptModel.getCapModel();
						vAddrModel = vCapModel.getAddressModel();

						// Populate address model with Business address info
						vAddrModel.setHouseNumberStart(vAddress.getHouseNumberStart());
						vAddrModel.setStreetPrefix(vAddress.getStreetPrefix());
						vAddrModel.setStreetName(vAddress.getStreetName());
						vAddrModel.setStreetSuffix(vAddress.getStreetSuffix());
						vAddrModel.setStreetSuffixdirection(vAddress.getStreetSuffixDirection());
						vAddrModel.setUnitStart(vAddress.getUnitStart());
						vAddrModel.setUnitType(vAddress.getUnitType());
						vAddrModel.setCity(vAddress.getCity());
						vAddrModel.setState(vAddress.getState());
						vAddrModel.setZip(vAddress.getZip());
						vAddrModel.setPrimaryFlag('Y');
						vAddrModel.setCapID(capId);
						vAddrModel.setAuditID('ADMIN');

						// Save the address
						var vAddrResult = aa.address.createAddress(vAddrModel);
						if (!vAddrResult.getSuccess()) {
							logDebug("Failed creating transactional address. " + vAddrResult.getErrorMessage());
						} else {
							// Add County and Census Tract Info
							addCountyAndCensusToAddrModel(capId);
						}

						// Exit loop - assumes only one Business address type
						break;
					}
				}
			}
		}
	} else {
		slackDebug("Undefined Business Contact in SAVE_BUSINESS_INFO_TO_RECORD: " + debug);
	}
}

//}
