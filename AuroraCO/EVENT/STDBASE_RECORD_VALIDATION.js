/*Title : Record Validation
Purpose : TO validate record type based on the provided JSON 
Author: Haetham Eleisah
Functional Area : ACA,AV Events
Description : JSON Example :
 "Building/Commercial/New Construction/NA": {
		"Pageflow": [{
			"preScript":" ",
			"customLists": {										
				"CUSTOM LIST/Item Numer": "12345",
				"CUSTOM LIST/Item Description": "haetham",
			},
			
			"customFields" : {
				"Job Value": "2000",
				"Code": "KBC 2012"
			} ,
			
			"lpFields": {											
				"licType": "Engineer",								

			},
			
			"addressFields": {										
				"zip": "12345",										

			},
			"parcelFields": {
				"ParcelNumber": "00800"
			},

			"contactFields": {
				"contactType": "Applicant"
				
			},
			"validationMessage":"Test Message",
			"requiredLP": "Engineer",
			"validateLP": true,
			"numberLP": 1,
			"requiredContact": "Applicant",
			"numberContacts": 1,
			"allowBalance": true,
			"parentRequired": "Building/Commercial/Company/Amman04",
			"parentRecordStatus":"",
			"childRequired": "Building/Commercial/Amman/amman55",
			"childRecordStatus":"",
			"requiredField": "Other Job value ID|Proposed Use|Other Job value",
			"taskRequired": "Started Successfull|Started with issues",
			"inspectionRequired": "",
			"assignedUserRequired":true,
			"assignedWorkflowTaskUser":true,
			"RowRequiredInASIT":"FINES|EMPLOYEE NAMES",
			"postScript": "
		} 
		
		],
		"ApplicationSpecificInfoUpdateBefore":[{
			"preScript":" ",
			"customLists": {										
				"CUSTOM LIST/Item Numer": "12345",
				"CUSTOM LIST/Item Description": "haetham",
			},
			
			"customFields" : {
				"Job Value": "2000",
				"Code": "KBC 2012"
			} ,
			
			"lpFields": {											
				"licType": "Engineer",								

			},
			
			"addressFields": {										
				"zip": "12345",										

			},
			"parcelFields": {
				"ParcelNumber": "00800"
			},

			"contactFields": {
				"contactType": "Applicant"
				
			},
			"validationMessage":"Test Message",
			"requiredLP": "Engineer",
			"validateLP": true,
			"numberLP": 1,
			"requiredContact": "Applicant",
			"numberContacts": 1,
			"allowBalance": true,
			"parentRequired": "Building/Commercial/Company/Amman04",
			"parentRecordStatus":"",
			"childRequired": "Building/Commercial/Amman/amman55",
			"childRecordStatus":"",
			"requiredField": "Other Job value ID|Proposed Use|Other Job value",
			"taskRequired": "Started Successfull|Started with issues",
			"inspectionRequired": "",
			"assignedUserRequired":true,
			"assignedWorkflowTaskUser":true,
			"RowRequiredInASIT":"FINES|EMPLOYEE NAMES",
			"postScript": "
		} 

		
		
		
Available Types: contactFields, customFields, customLists, parcelFields, addressFields, lpFields

Available Attributes for each type: 
- Custom Fields and Custom Lists: ALL
- Address: All Custom Attributes, (primaryFlag,houseNumberStart,streetDirection,streetName,streetSuffix,city,state,zip,addressStatus,county,country,addressDescription,xCoordinate,yCoordinate)
- Parcel: All Custom Attributes, (ParcelNumber,Section,Block,LegalDesc,GisSeqNo,SourceSeqNumber,Page,I18NSubdivision,CouncilDistrict,RefAddressTypes,ParcelStatus,ExemptValue,PublicSourceSeqNBR,CensusTract,InspectionDistrict,NoticeConditions,ImprovedValue,PlanArea,Lot,ParcelArea,Township,LandValue)
- Licensed Professional: All Custom Attributes, (licType,lastName,firstName,businessName,address1,city,state,zip,country,email,phone1,phone2,lastRenewalDate,licExpirationDate,FEIN,gender,birthDate)
- Contact: All Custom Attributes, (firstName,lastName,middleName,businessName,contactSeqNumber,contactType,relation,phone1,phone2,email,addressLine1,addressLine2,city,state,zip,fax,notes,country,fullName,peopleModel)
 */
try {
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var scriptSuffix = "RECORD_VALIDATION";
	var settingsArray = [];
	isConfigurableScript(settingsArray, scriptSuffix);
	for (s in settingsArray) {
		var validationMessage = "";
		var rules = settingsArray[s];
		// run preScript

		if (!matches(rules.preScript, null, " ")) {
			eval(getScriptText(rules.preScript, null, false));
		}
		/// this to check if all Rules  if is matched.
		if (isJsonRulesMatchRecordData(rules)) {
			validateRecord(rules);
		}

		/// run post script
		if (!matches(rules.postScript, null, "")) {
			eval(getScriptText(rules.postScript, null, false));
		}
	}

} catch (ex) {
	logDebug("**ERROR:Exception while verificaiton the rules" + ex);
}

/**
 * this function will validate the JSON Rules in order to verify if the rules matched or not.
 * @param rules is the JSON abject that provided from the JSON File CONF_"SOLUTION"_RECORD_VALIDATION
 * 
 * @returns true if the rules is matched otherwise will returns false
 */
function validateRecord(rules) {

	var lpArray = [];
	var LPrequiredCount = 0;
	var contactsArray = [];
	var contactrequiredCount = 0;
	// this to  check if there is required LP related to the record.
	if (rules.requiredLP != "" && rules.requiredLP != null) {
		var requiredLPArray = rules.requiredLP.split("|");
		var isExists = false;
		getLPFields(lpArray);
		if (lpArray.length == 0 || !lpArray)
			isExists = false;
		for ( var licene in requiredLPArray) {
			for (ca in lpArray) {

				if (lpArray[ca]["licType"] == requiredLPArray[licene]) {
					isExists = true
					LPrequiredCount += 1;
				}
			}
		}
		if (!isExists) {
			validationMessage += "these LP are requird " + rules.requiredLP + '</br>';
		}

	}
	// this to  check if related LP's is valid or not.
	if (rules.validateLP) {
		var isExpired = false;
		if (lpArray.length == 0)
			getLPFields(lpArray);
		for ( var licene in requiredLPArray) {
			for (ca in lpArray) {
				if (capHasExpiredLicProf("EXPIRE", lpArray[ca]["licType"])) {
					isExpired = true;
					break;
				}
			}
		}
		if (isExpired) {
			validationMessage += '</br>' + "this LP are expired " + rules.validateLP + '</br>';

		}
	}
	// this to  check if the count of  LP's is valid or not.
	if (rules.numberLP != "" && rules.numberLP != null && parseInt(rules.numberLP) > 0 && !isNaN(parseInt(rules.numberLP))) {
		var lbCount = 0;
		var isValid = true;
		if (lpArray.length == 0)
			getLPFields(lpArray);

		lbCount = lpArray.length;
		if (LPrequiredCount > 0) {
			if (parseInt(rules.numberLP) > LPrequiredCount) {
				validationMessage += '</br>' + "there is should be " + rules.numberLP + " from these  Licenses " + rules.requiredLP.replace("|", ",") + '</br>';

			}
		} else if (lbCount < rules.numberLP) {
			validationMessage += '</br>' + "there is should be " + rules.numberLP + " Licenses" + '</br>';

		}

	}
	// this to  check if there is required contacts related to the record.
	if (rules.requiredContact != "" && rules.requiredContact != null) {
		contactsArray = getContacts();
		var requiredContactArray = rules.requiredContact.split("|");
		var isExists = false;
		if (!contactsArray)
			isExists = false;
		for ( var con in requiredContactArray) {
			for (ca in contactsArray) {
				if (contactsArray[ca]["contactType"] == requiredContactArray[con]) {
					isExists = true;
					contactrequiredCount += 1;

				}

			}
		}

		if (!isExists) {
			validationMessage += '</br>' + "these contacts are requird " + rules.requiredContact + '</br>';

		}

	}
	// this to  check if the count of Contacts is valid or not.
	if (rules.numberContacts != "" && rules.numberContacts != null) {

		var countactsCount = 0;
		var isValid = true;
		if (contactsArray.length == 0)
			contactsArray = getContacts();
		countactsCount = contactsArray.length;

		if (contactrequiredCount > 0) {
			if (parseInt(rules.numberContacts) > parseInt(contactrequiredCount)) {
				validationMessage += '</br>' + " there is should be " + rules.numberContacts + " from these Contacts " + rules.requiredContact.replace("|", ",") + '</br>';

			}
		} else if (countactsCount < parseInt(rules.numberContacts)) {
			validationMessage += '</br>' + "there is should be " + rules.numberContacts + " Contacts" + '</br>';

		}

	}
	// this to  check if the record has balance or not.
	if (!rules.allowBalance) {

		var capDetails = aa.cap.getCapDetail(capId).getOutput();

		if (capDetails.getBalance() > 0) {
			validationMessage += '</br>' + " this record has balance " + capDetails.getBalance() + '</br>';
		}

	}
	// this to check the parent records for the current record
	if (rules.parentRequired != "" && rules.parentRequired != null) {
		var parentRequiredArray = rules.parentRequired.split("|");
		var parentRecordStatusArray = rules.parentRecordStatus.split("|");
		var isMatched = true;
		var isStatusMatched = false;
		for ( var par in parentRequiredArray) {
			var parentCapID = getParentByCapId(capId);

			if (parentCapID != false) {
				var parnetCap = aa.cap.getCap(parentCapID).getOutput();
				var parentAppTypeResult = parnetCap.getCapType();
				var parentAppTypeString = parentAppTypeResult.toString();
				var parentCapStatus = parnetCap.getCapStatus();
				if (parentRequiredArray[par] != parentAppTypeString) {
					isMatched = false;

				}
				// this to check the parent record status if the record is exists
				if (rules.parentRecordStatus != null && rules.parentRecordStatus != "") {
					if (isMatched) {
						for ( var st in parentRecordStatusArray) {
							if (parentCapStatus == parentRecordStatusArray[st]) {
								isStatusMatched = true;
								break;

							}
						}
					}
				}

			} else {
				isMatched = false;

			}
		}

		if (!isMatched) {
			validationMessage += '</br>' + " this record should have parent </br> " + rules.parentRequired + '</br>';
		}

		if (!isStatusMatched) {
			validationMessage += '</br>' + " the parent records status should be in </br> " + rules.parentRecordStatus.replace("|", ",") + '</br>';
		}
	}
	// this to check the child records for the current record
	if (rules.childRequired != "" && rules.childRequired != null) {
		var childRequiredArray = rules.childRequired.split("|");
		var childCapList = aa.cap.getChildByMasterID(capId).getOutput();
		var childRecordStatusArray = rules.childRecordStatus.split("|");
		var isStatusMatched = false;
		var isMatched = true;
		if (childCapList != null) {
			for (var i = 0; i < childCapList.length; i++) {
				for ( var obj in childRequiredArray) {
					var childCapID = childCapList[i].getCapID()
					var childCap = aa.cap.getCap(childCapID).getOutput();
					var childAppTypeResult = childCapList[i].getCapType();
					var childAppTypeString = childAppTypeResult.toString();
					var childCapStatus = childCap.getCapStatus();

					if (childRequiredArray[obj] == childAppTypeString) {
						isMatched = true;
						// this to check the child record status if exists
						if (rules.childRecordStatus != null && rules.childRecordStatus != "") {
							if (isMatched) {
								for ( var st in childRecordStatusArray) {
									if (childCapStatus == childRecordStatusArray[st]) {
										isStatusMatched = true;
										break;
									}
								}
							}
						}

					} else {
						isMatched = false;
					}

				}

			}
		} else {
			isMatched = false;

		}

		if (!isMatched) {
			validationMessage += '</br>' + " this record should have child  " + rules.childRequired + '</br>';
		}
		if (!isStatusMatched) {
			validationMessage += '</br>' + " the child records status should be in </br> " + rules.childRecordStatus.replace("|", ",") + '</br>';
		}

	}

	if (rules.requiredField != "" && rules.requiredField != null) {
		var requiredFieldsArray = rules.requiredField.split("|");
		for ( var f in requiredFieldsArray) {
			if (GetASIValue(requiredFieldsArray[f]) == "" || GetASIValue(requiredFieldsArray[f]) == null) {
				validationMessage += '</br>' + "these fields are required " + rules.requiredField.replace('|', ",") + '</br>';
				break;
			}

		}
	}

	if (rules.taskRequired != "" && rules.taskRequired != null) {
		var taskRequiredArray = rules.taskRequired.split("|");
		for ( var t in taskRequiredArray) {
			if (!isTaskComplete(taskRequiredArray[t])) {
				validationMessage += '</br>' + "these tasks must be completed " + rules.taskRequired.toString().replace("|", ",") + '</br>';
				break;
			}
		}

	}

	if (rules.inspectionRequired != "" && rules.inspectionRequired != null) {

		var inspections = aa.inspection.getInspections(capId);
		var inspectionRequiredArray = rules.inspectionRequired.split("|");
		inspections = inspections.getOutput();
		if (inspections == null || inspections.length == 0) {

			validationMessage += '</br>' + "these inspections are required and should  be completed " + rules.inspectionRequired.toString().replace("|", ",") + '</br>';

		}
		for ( var obj in inspectionRequiredArray) {

			for ( var i in inspections) {
				if ((inspectionRequiredArray[obj] == inspections[i].getInspectionType() && (inspections[i].getInspectionStatus() == "Rescheduled"
						|| inspections[i].getInspectionStatus() == "Canceled" || inspections[i].getInspectionStatus() == "Scheduled"))
						|| (inspectionRequiredArray[obj] != inspections[i].getInspectionType())) {
					validationMessage += '</br>' + "these inspections are required and should  be completed " + rules.inspectionRequired.toString().replace("|", ",") + '</br>';

				}
			}

		}
	}

	// this to check if the record assign to the user for all before event except ASB 
	if (controlString != "ApplicationSubmitBefore") {
		if (rules.assignedUserRequired != null && rules.assignedUserRequired != "") {
			if (!getAssignedUser() && rules.assignedUserRequired) {
				validationMessage += '</br>' + "Record should be assigned to a user  " + '</br>';
			}
		}
	}

	// this to check the work flow assigned user 
	if (rules.assignedWorkflowTaskUser != "" && rules.assignedWorkflowTaskUser != null) {
		if (rules.assignedWorkflowTaskUser && (wfStaffUserID == null || wfStaffUserID == "")) {
			validationMessage += '</br>' + "Work flow task should be assigned to a user  " + '</br>';
		}

	}

	/// this to check if the ASIT has rows 
	if (rules.RowRequiredInASIT != "" && rules.RowRequiredInASIT != null) {
		var rowRequiredASITArray = rules.RowRequiredInASIT.split("|");
		var tmpASITAry = null;
		for ( var r in rowRequiredASITArray) {
			if (controlString == "ApplicationSpecificInfoUpdateBefore") {
				loadASITablesBefore();
				var currentASITRows = rowRequiredASITArray[r].replace(/[^a-zA-Z0-9]+/g, '');
				if (!isNaN(currentASITRows.substring(0, 1)))
					currentASITRows = "TBL" + currentASITRows // prepend with TBL if it starts with a number

				var rowExists = false;
				if (currentASITRows != undefined) {
					eval("tmpASITAry=" + currentASITRows);
					for (j in tmpASITAry) {
						if (tmpASITAry[j] != null || tmpASITAry[j] != "undefined") {
							rowExists = true;
							break;
						}
					}
				}
				if (!rowExists) {
					validationMessage += '</br>' + "This ASIT should have at least one row " + rowRequiredASITArray[r] + '</br>';
				}
			} else if (controlString == "ApplicationSubmitBefore") {
				currentASITRows = getASITBefore(rowRequiredASITArray[r]);
				if (currentASITRows == null) {
					validationMessage += '</br>' + "This ASIT should have at least one row " + rowRequiredASITArray[r] + '</br>';
				}
			} else {
				currentASITRows = getASITable(rowRequiredASITArray[r]);

				if (currentASITRows == "undefined" || currentASITRows == null || !currentASITRows) {
					validationMessage += '</br>' + "This ASIT should have at least one row " + rowRequiredASITArray[r] + '</br>';
				}

			}

		}
	}
	if (validationMessage != "") {
		var validationMessageText = (rules.validationMessage == null || rules.validationMessage == "") ? validationMessage : rules.validationMessage;
		showMessage = true;
		cancel = true;

		if (isPublicUser) {
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validationMessageText);
		} else {
			comment(validationMessageText);
		}

	}
}
/**
 * this user will return the assigned user
 * @returns user id if the record already assigned else will return false
 */
function getAssignedUser() {
	if (capId != null) {
		capDetail = aa.cap.getCapDetail(capId).getOutput();

		userObj = aa.person.getUser(capDetail.getAsgnStaff());
		if (userObj.getSuccess()) {
			staff = userObj.getOutput();
			userID = staff.getUserID();
			return userID;
		} else {
			return false;
		}
	} else
		return false;
}
