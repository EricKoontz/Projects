// Check that the Business contact has only one Premise Address
var vBusinesses;
var vBusiness;
var vBusinessObj;
var vAddressType;
var vAddresses = [];
var vAddress;
var x = 0;
var vPremiseCount = 0;

// Get Business contact object
vBusinesses = getContactObjsByCap_BCC(capId, 'Business');
vAddressType = "Premise";

if (vBusinesses) {
	// Assume only one business contact
	vBusiness = vBusinesses[0];

	// Get contact addresses and check for premise types
	vAddresses = vBusiness.addresses;
	if (vAddresses) {
		x = 0;
		for (x in vAddresses) {
			vAddress = vAddresses[x];
			// Use only the Premise address type - assumes only one
			if (vAddress.getAddressType() == vAddressType) {
				vPremiseCount++;
			}
		}
	}
}

if (vPremiseCount > 1) {
	cancel = true;
	showMessage = true;
	comment("Only one Premise address can exist for the Business contact. Please remove additional Premise addresses before continuing.");	
} else if (vPremiseCount == 0) {
	cancel = true;
	showMessage = true;
	comment("A single Premise address is required. Please add a Premise addresses to the Business contact before continuing.");		
}