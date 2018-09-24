// Begin script to copy Owner Applicant information to the Owners ASIT.
var vTableName = "LIST OF OWNERS";
var vContactModel = aa.env.getValue("Contact");
if (vContactModel.getContactType() == "Owner Applicant") {
	var vOwnerApplicant = getContactObj(capId, 'Owner Applicant');
	var vOwnerAddresses;
	var vOwnerAddress;
	var vAddressType;
	var x;
	var vFName;
	var vLName;
	var vTitle;
	var vPhone;
	var vEmail;
	var vAddrLine1;
	var vAddrLine2;
	var vCity;
	var vState;
	var vZip;
	var vSeqNbr;
	var vASITable = [];
	var vASITRow = [];
	if (vOwnerApplicant != null && vOwnerApplicant != false) {
		vFName = vOwnerApplicant.people.firstName;
		vLName = vOwnerApplicant.people.lastName;
		vPhone = vOwnerApplicant.people.phone1;
		vEmail = vOwnerApplicant.people.email;
		vSeqNbr = vOwnerApplicant.refSeqNumber;
		vOwnerAddresses = vOwnerApplicant.addresses;

		x = 0;
		for (x in vOwnerAddresses) {
			vOwnerAddress = vOwnerAddresses[x];
			vAddressType = vOwnerAddress.getAddressType();
			if (vAddressType = "Mailing") {
				vAddrLine1 = vOwnerAddress.getAddressLine1();
				vAddrLine2 = vOwnerAddress.getAddressLine2();
				vCity = vOwnerAddress.getCity();
				vState = vOwnerAddress.getState();
				vZip = vOwnerAddress.getZip();
				break; //assume only one
			}
		}

		/*
		aa.print(vFName);
		aa.print(vLName);
		aa.print(vPhone);
		aa.print(vEmail);
		aa.print(vAddrLine1);
		aa.print(vAddrLine2);
		aa.print(vCity);
		aa.print(vState);
		aa.print(vZip);
		 */

		// Save values in uppercase to match manual entry
		if (vAddrLine1 != null && vAddrLine1 != "") {
			vAddrLine1 = vAddrLine1 + "";
			vAddrLine1 = vAddrLine1.toUpperCase();
		}
		if (vAddrLine2 != null && vAddrLine2 != "") {
			vAddrLine2 = vAddrLine2 + "";
			vAddrLine2 = vAddrLine2.toUpperCase();
		}
		else {
			vAddrLine2 = "";
		}
		if (vCity != null && vCity != "") {
			vCity = vCity + "";
			vCity = vCity.toUpperCase();
		}
		if (vState != null && vState != "") {
			vState = vState + "";
			vState = vState.toUpperCase();
		}
	
		vASITRow["First Name"] = new asiTableValObj("First Name", "" + vFName, "Y");
		vASITRow["Last Name"] = new asiTableValObj("Last Name", "" + vLName, "Y");
		vASITRow["Phone Number"] = new asiTableValObj("Phone Number", "" + vPhone, "Y");
		vASITRow["Email Address"] = new asiTableValObj("Email Address", "" + vEmail, "Y");
		vASITRow["Address Line 1"] = new asiTableValObj("Address Line 1", "" + vAddrLine1, "Y");
		vASITRow["Address Line 2"] = new asiTableValObj("Address Line 2", "" + vAddrLine2, "Y");
		vASITRow["City"] = new asiTableValObj("City", "" + vCity, "Y");
		vASITRow["State"] = new asiTableValObj("State", "" + vState, "Y");
		vASITRow["Zip Code"] = new asiTableValObj("Zip Code", "" + vZip, "Y");
		vASITRow["Contact Sequence Number"] = new asiTableValObj("Contact Sequence Number", "" + vSeqNbr, "Y");

		vASITable.push(vASITRow);

		removeASITable(vTableName, capId);
		addASITable(vTableName, vASITable, capId);
	}
}
// End script to copy Owner Applicant information to the Owners ASIT.
