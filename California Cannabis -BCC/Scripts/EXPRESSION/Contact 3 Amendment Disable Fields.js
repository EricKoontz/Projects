// User Story 2168

var contact = {};
contact.vBusOrgStr = expression.getValue("CONTACT3TPLFORM::CON_BUS::BUSINESS CONTACT::What is your business's organizational structure?");
contact.birthRegion = expression.getValue("CONTACT3::contactsModel2*birthRegion");
contact.birthState = expression.getValue("CONTACT3::contactsModel2*birthState");
contact.businessName2 = expression.getValue("CONTACT3::contactsModel2*businessName2");
contact.city = expression.getValue("CONTACT3::contactsModel2*city");
contact.contactTypeFlag = expression.getValue("CONTACT3::contactsModel2*contactTypeFlag");
contact.countryCode = expression.getValue("CONTACT3::contactsModel2*countryCode");
contact.deceasedDate = expression.getValue("CONTACT3::contactsModel2*deceasedDate");
contact.tradeName = expression.getValue("CONTACT3::contactsModel2*tradeName");
contact.driverLicenseNbr = expression.getValue("CONTACT3::contactsModel2*driverLicenseNbr");
contact.driverLicenseState = expression.getValue("CONTACT3::contactsModel2*driverLicenseState");
contact.email = expression.getValue("CONTACT3::contactsModel2*email");
contact.fax = expression.getValue("CONTACT3::contactsModel2*fax");
contact.fein = expression.getValue("CONTACT3::contactsModel2*fein");
contact.firstName = expression.getValue("CONTACT3::contactsModel2*firstName");
contact.fullName = expression.getValue("CONTACT3::contactsModel2*fullName");
contact.gender = expression.getValue("CONTACT3::contactsModel2*gender");
contact.internalUserFlag = expression.getValue("CONTACT3::contactsModel2*internalUserFlag");
contact.lastName = expression.getValue("CONTACT3::contactsModel2*lastName");
contact.middleName = expression.getValue("CONTACT3::contactsModel2*middleName");
contact.comment = expression.getValue("CONTACT3::contactsModel2*comment");
contact.contactOnSRChange = expression.getValue("CONTACT3::contactsModel2*contactOnSRChange");
contact.businessName = expression.getValue("CONTACT3::contactsModel2*businessName");
contact.postOfficeBox = expression.getValue("CONTACT3::contactsModel2*postOfficeBox");
contact.passportNumber = expression.getValue("CONTACT3::contactsModel2*passportNumber");
contact.phone1 = expression.getValue("CONTACT3::contactsModel2*phone1");
contact.phone2 = expression.getValue("CONTACT3::contactsModel2*phone2");
contact.phone3 = expression.getValue("CONTACT3::contactsModel2*phone3");
contact.preferredChannel = expression.getValue("CONTACT3::contactsModel2*preferredChannel");
contact.flag = expression.getValue("CONTACT3::contactsModel2*flag");
contact.race = expression.getValue("CONTACT3::contactsModel2*race");
contact.relation = expression.getValue("CONTACT3::contactsModel2*relation");
contact.salutation = expression.getValue("CONTACT3::contactsModel2*salutation");
contact.maskedSsn = expression.getValue("CONTACT3::contactsModel2*maskedSsn");
contact.state = expression.getValue("CONTACT3::contactsModel2*state");
contact.stateIDNbr = expression.getValue("CONTACT3::contactsModel2*stateIDNbr");
contact.namesuffix = expression.getValue("CONTACT3::contactsModel2*namesuffix");
contact.title = expression.getValue("CONTACT3::contactsModel2*title");
contact.contactType = expression.getValue("CONTACT3::contactsModel2*contactType");
contact.userID = expression.getValue("CONTACT3::contactsModel2*userID");
contact.zip = expression.getValue("CONTACT3::contactsModel2*zip");
contact.accessLevel = expression.getValue("CONTACT3::contactsModel2*accessLevel");
contact.addressLine1 = expression.getValue("CONTACT3::contactsModel2*addressLine1");
contact.addressLine2 = expression.getValue("CONTACT3::contactsModel2*addressLine2");
contact.addressLine3 = expression.getValue("CONTACT3::contactsModel2*addressLine3");
contact.birthDate = expression.getValue("CONTACT3::contactsModel2*birthDate");
contact.birthCity = expression.getValue("CONTACT3::contactsModel2*birthCity");

var recordType = "" + expression.getValue("CAP::capType").value;

if (recordType.indexOf("Incomplete Contact Information") > 0  || recordType.indexOf("Renewal") > 0 ) {

	// Default all fields to read-only
	for (var p in contact) {
		contact[p].readOnly = true;
		expression.setReturn(contact[p]);
	}
	// Turn on  Email, website, and phone number.
	contact.email.readOnly = false;
	expression.setReturn(contact.email);
	contact.addressLine3.readOnly = false;
	expression.setReturn(contact.addressLine3);
	contact.phone1.readOnly = false;
	expression.setReturn(contact.phone1);
}
