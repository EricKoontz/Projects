// User Story 2168

var contact = {};
contact.birthRegion = expression.getValue("APPLICANT::applicant*birthRegion");
contact.birthState = expression.getValue("APPLICANT::applicant*birthState");
contact.businessName2 = expression.getValue("APPLICANT::applicant*businessName2");
contact.city = expression.getValue("APPLICANT::applicant*city");
contact.contactTypeFlag = expression.getValue("APPLICANT::applicant*contactTypeFlag");
contact.countryCode = expression.getValue("APPLICANT::applicant*countryCode");
contact.deceasedDate = expression.getValue("APPLICANT::applicant*deceasedDate");
contact.tradeName = expression.getValue("APPLICANT::applicant*tradeName");
contact.driverLicenseNbr = expression.getValue("APPLICANT::applicant*driverLicenseNbr");
contact.driverLicenseState = expression.getValue("APPLICANT::applicant*driverLicenseState");
contact.email = expression.getValue("APPLICANT::applicant*email");
contact.fax = expression.getValue("APPLICANT::applicant*fax");
contact.fein = expression.getValue("APPLICANT::applicant*fein");
contact.firstName = expression.getValue("APPLICANT::applicant*firstName");
contact.fullName = expression.getValue("APPLICANT::applicant*fullName");
contact.gender = expression.getValue("APPLICANT::applicant*gender");
contact.internalUserFlag = expression.getValue("APPLICANT::applicant*internalUserFlag");
contact.lastName = expression.getValue("APPLICANT::applicant*lastName");
contact.middleName = expression.getValue("APPLICANT::applicant*middleName");
contact.comment = expression.getValue("APPLICANT::applicant*comment");
contact.contactOnSRChange = expression.getValue("APPLICANT::applicant*contactOnSRChange");
contact.businessName = expression.getValue("APPLICANT::applicant*businessName");
contact.postOfficeBox = expression.getValue("APPLICANT::applicant*postOfficeBox");
contact.passportNumber = expression.getValue("APPLICANT::applicant*passportNumber");
contact.phone1 = expression.getValue("APPLICANT::applicant*phone1");
contact.phone2 = expression.getValue("APPLICANT::applicant*phone2");
contact.phone3 = expression.getValue("APPLICANT::applicant*phone3");
contact.preferredChannel = expression.getValue("APPLICANT::applicant*preferredChannel");
contact.flag = expression.getValue("APPLICANT::applicant*flag");
contact.race = expression.getValue("APPLICANT::applicant*race");
contact.relation = expression.getValue("APPLICANT::applicant*relation");
contact.salutation = expression.getValue("APPLICANT::applicant*salutation");
contact.maskedSsn = expression.getValue("APPLICANT::applicant*maskedSsn");
contact.state = expression.getValue("APPLICANT::applicant*state");
contact.stateIDNbr = expression.getValue("APPLICANT::applicant*stateIDNbr");
contact.namesuffix = expression.getValue("APPLICANT::applicant*namesuffix");
contact.title = expression.getValue("APPLICANT::applicant*title");
contact.contactType = expression.getValue("APPLICANT::applicant*contactType");
contact.userID = expression.getValue("APPLICANT::applicant*userID");
contact.zip = expression.getValue("APPLICANT::applicant*zip");
contact.accessLevel = expression.getValue("APPLICANT::applicant*accessLevel");
contact.addressLine1 = expression.getValue("APPLICANT::applicant*addressLine1");
contact.addressLine2 = expression.getValue("APPLICANT::applicant*addressLine2");
contact.addressLine3 = expression.getValue("APPLICANT::applicant*addressLine3");
contact.birthDate = expression.getValue("APPLICANT::applicant*birthDate");
contact.birthCity = expression.getValue("APPLICANT::applicant*birthCity");

var recordType = "" + expression.getValue("CAP::capType").value;

// only for contact amendments
if (recordType.indexOf("Incomplete Contact Information") > 0) {
	// Default all fields to read-only
	for (var p in contact) {
		contact[p].readOnly = true;
		expression.setReturn(contact[p]);
	}
	// Turn on  Phone number, mailing address, email, username, password, security question, title.
	contact.email.readOnly = false;
	expression.setReturn(contact.email);
	contact.addressLine3.readOnly = false;
	expression.setReturn(contact.addressLine3);
	contact.phone1.readOnly = false;
	expression.setReturn(contact.phone1);
}
