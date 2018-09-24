//Define and get expression variables
var servProvCode = expression.getValue("$$servProvCode$$").value;
var vBusOrgStr = expression.getValue("CONTACT3TPLFORM::CON_BUS::BUSINESS CONTACT::What is your business's organizational structure?");
var vConTypeFlag = expression.getValue("CONTACT3::contactsModel2*contactTypeFlag");
var vFName = expression.getValue("CONTACT3::contactsModel2*firstName");
var vMName = expression.getValue("CONTACT3::contactsModel2*middleName");
var vLName = expression.getValue("CONTACT3::contactsModel2*lastName");
var vBusName = expression.getValue("CONTACT3::contactsModel2*businessName");
var vTradeName = expression.getValue("CONTACT3::contactsModel2*tradeName");
var vBusName2 = expression.getValue("CONTACT3::contactsModel2*businessName2");
var vCountry = expression.getValue("CONTACT3::contactsModel2*countryCode");
var vSSN = expression.getValue("CONTACT3::contactsModel2*maskedSsn");
var vFEIN = expression.getValue("CONTACT3::contactsModel2*fein");
//var vBirthDate = expression.getValue("CONTACT3::contactsModel2*birthDate");
var vEmail = expression.getValue("CONTACT3::contactsModel2*email");
var vPhone1 = expression.getValue("CONTACT3::contactsModel2*phone1");
var vPhone2 = expression.getValue("CONTACT3::contactsModel2*phone2");
var vPublicUserEmail = expression.getValue("$$publicuser_email$$");
var totalRowCount = expression.getTotalRowCount();

//Define program variables
var aa = expression.getScriptRoot();
var vPublicUser;
var vPublisUserSysSeq;
var vPublicUserAssociatedContacts;
var x;
var vRefContact;
//var vBirthDateJSDate;
//var vBirthMonth;
//var vBirthDay;
//var vBirthYear;

//For the "Sole Proprietorship" selection:
//Change contact type to "Individual" and enable SSN, First Name, Middle Name, Last Name, Sole Proprietorship Business Name.
//Disable Name of Business, DBA/Trade Name, FEIN
//Populate contact fields with reference contact related to public user.

// do not run on Contact Amendments
var recordType = "" + expression.getValue("CAP::capType").value;
if (recordType.indexOf("Incomplete Contact Information") < 0) {

	vCountry.value = 'US'; //default
	vCountry.readOnly = false;
	vCountry.hidden = true;
	expression.setReturn(vCountry);

	if ((vBusOrgStr.value != null && vBusOrgStr.value.equals(String("Sole Proprietorship")))) {
		//Set type flag to "Individual"
		vConTypeFlag.value = "individual";
		vConTypeFlag.hidden = true;
		vConTypeFlag.readOnly = true;
		expression.setReturn(vConTypeFlag);

		//enable First, Middle, Last Names
		vFName.hidden = false;
		vFName.required = true;
		expression.setReturn(vFName);

		vMName.hidden = false;
		expression.setReturn(vMName);

		vLName.hidden = false;
		vLName.required = true;
		expression.setReturn(vLName);

		//enable SSN
		vSSN.hidden = false;
		vSSN.required = true;
		expression.setReturn(vSSN);

		//enable Birth Date
		//vBirthDate.hidden = false;
		//vBirthDate.required = true;
		//expression.setReturn(vBirthDate);

		//enable Business Name 2
		vBusName2.hidden = false;
		vBusName2.required = true;
		expression.setReturn(vBusName2);

		//disable Business and Trade Name fields
		vBusName.hidden = true;
		vBusName.required = false;
		expression.setReturn(vBusName);

		vTradeName.hidden = true;
		expression.setReturn(vTradeName);

		vFEIN.hidden = true;
		vFEIN.required = false;
		expression.setReturn(vFEIN);

		//Populate contact fields with reference contact related to public user.
		if (vPublicUserEmail.getValue() != null && vPublicUserEmail.getValue() != "") {
			vPublicUser = aa.publicUser.getPublicUserByEmail(vPublicUserEmail.getValue());
			if (vPublicUser.getSuccess() && vPublicUser.getOutput()) {
				vPublicUser = vPublicUser.getOutput();
				vPublisUserSysSeq = vPublicUser.getUserSeqNum();
				if (vPublisUserSysSeq != null && vPublisUserSysSeq != "") {
					vPublicUserAssociatedContacts = aa.people.getUserAssociatedContact(vPublisUserSysSeq);
					if (vPublicUserAssociatedContacts.getSuccess() && vPublicUserAssociatedContacts.getOutput()) {
						vPublicUserAssociatedContacts = vPublicUserAssociatedContacts.getOutput();
						if (vPublicUserAssociatedContacts != null && vPublicUserAssociatedContacts != "") {
							vPublicUserAssociatedContacts = vPublicUserAssociatedContacts.toArray();
							x = 0;
							//for (x in vPublicUserAssociatedContacts) {
							vRefContact = vPublicUserAssociatedContacts[x]; //assume only one contact
							//}
							if (vRefContact != null && vRefContact != "") {
								vFName.value = vRefContact.getFirstName();
								vFName.readOnly = true;
								expression.setReturn(vFName);

								vMName.value = vRefContact.getMiddleName();
								vMName.readOnly = true;
								//expression.setReturn(vMName);

								vLName.value = vRefContact.getLastName();
								vLName.readOnly = true;
								expression.setReturn(vLName);

								//vBusName2.value = vRefContact.getBusinessName2();
								//expression.setReturn(vBusName2);

								/*
								vCountry.value = vRefContact.getCountryCode();
								vCountry.readOnly = true;
								expression.setReturn(vCountry);
								 */

								vEmail.value = vRefContact.getEmail();
								vEmail.readOnly = true;
								expression.setReturn(vEmail);

								//vPhone1.value = vRefContact.getPhone1();
								//expression.setReturn(vPhone1);

								//vPhone2.value = vRefContact.getPhone2();
								//expression.setReturn(vPhone2);

								vSSN.value = vRefContact.getSocialSecurityNumber();
								vSSN.hidden = true;
								vSSN.readOnly = true;
								expression.setReturn(vSSN);

								/*
								if (vRefContact.getBirthDate() != null && vRefContact.getBirthDate() != "") {
								vBirthDateJSDate = (vRefContact.getBirthDate().getMonth() + 1) + "/" + vRefContact.getBirthDate().getDate() + "/" + vRefContact.getBirthDate().getYear();
								vBirthDateJSDate = new Date(vBirthDateJSDate);

								vBirthMonth = vBirthDateJSDate.getMonth() + 1;
								if (vBirthMonth < 10) {
								vBirthMonth = "0" + vBirthMonth;
								}
								vBirthDay = vBirthDateJSDate.getDate();
								if (vBirthDay < 10) {
								vBirthDay = "0" + vBirthDay;
								}
								vBirthYear = vBirthDateJSDate.getFullYear();

								//vBirthDate.value = vBirthMonth + "/" + vBirthDay + "/" + vBirthYear;
								vBirthDate.readOnly = true;
								vBirthDate.hidden = true;
								expression.setReturn(vBirthDate);
								}
								 */
							}
						}
					}
				}
			}
		}

	} else {
		//Set type flag to "organization"
		vConTypeFlag.value = "organization";
		vConTypeFlag.hidden = true;
		vConTypeFlag.readOnly = true;
		expression.setReturn(vConTypeFlag);

		//disable First, Middle, Last Names
		vFName.hidden = true;
		vFName.required = false;
		expression.setReturn(vFName);

		vMName.hidden = true;
		expression.setReturn(vMName);

		vLName.hidden = true;
		vLName.required = false;
		expression.setReturn(vLName);

		//disable SSN
		vSSN.hidden = true;
		vSSN.required = false;
		expression.setReturn(vSSN);

		//disable Birth Date
		//vBirthDate.hidden = true;
		//vBirthDate.required = false;
		//expression.setReturn(vBirthDate);

		//disable Business Name 2
		vBusName2.hidden = true;
		vBusName2.required = false;
		expression.setReturn(vBusName2);

		//enable Business, Trade Name, FEIN fields
		vBusName.hidden = false;
		vBusName.required = true;
		vBusName.readOnly = false;
		expression.setReturn(vBusName);

		vTradeName.hidden = false;
		vTradeName.readOnly = false;
		expression.setReturn(vTradeName);

		vFEIN.hidden = false;
		vFEIN.required = true;
		vFEIN.readOnly = false;
		expression.setReturn(vFEIN);

		//Clear contact fields that may have been populated by reference contact related to public user.
		if (vPublicUserEmail.getValue() != null && vPublicUserEmail.getValue() != "") {
			vFName.value = null;
			expression.setReturn(vFName);

			vMName.value = null;
			expression.setReturn(vMName);

			vLName.value = null;
			expression.setReturn(vLName);

			vBusName2.value = null;
			expression.setReturn(vBusName2);

			/*
			vCountry.value = 'US'; //default
			vCountry.readOnly = false;
			expression.setReturn(vCountry);
			 */
			
			/* comment out for defect 2788
			vEmail.value = null;
			vEmail.readOnly = false;
			expression.setReturn(vEmail);
			*/

			//vPhone1.value = null;
			//expression.setReturn(vPhone1);

			//vPhone2.value = null;
			//expression.setReturn(vPhone2);

			vSSN.value = null;
			expression.setReturn(vSSN);

			//vBirthDate.value = null;
			//expression.setReturn(vBirthDate);
		}
	}
}
