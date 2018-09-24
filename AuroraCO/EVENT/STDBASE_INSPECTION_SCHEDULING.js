/*==========================================================================================
Title : inspectionScheduling

Purpose : Schedules an inspection using the rules included in the JSON object. 
			Please see instructions in document InspectionScheduling Configurable Script Instructions.xlsx for important configuration information. 

Author: Nickie Albert

Functional Area : inspections

Description : JSON must contain :
				"Licenses/Business/Retail/Application": {						//record type to run
					"ApplicationSubmitAfter":[{									//event to run (supports workflow task and status and inspection type and status); structured as an array, another set of rules can be added
						"preScript": null,										//custom script to run prior to scheduling script
						"isCreatedByACA": true,									//true or false
						"inspectionType": "Initial Inspection",					//Inspection type to create
						"contactFields": {										//contact information (more fields can be added, as needed)
							"contactType": "Applicant",							//If other contact fields (ie. address, email, etc) are entered, they need to follow field name format for match to be made (see instructions) 
							"Custom Field": "Value"								// they need to follow field name format for match to be made (see instructions for available fields) 
						},													
						"customFields": {										//custom fields to be used in script (more fields can be added, as needed)
							"Custom Field 1": "Value 1",
							"Custom Field 2": "Value 2"
						},
						"customLists": {										//custom lists to be entered as tableName/columnName: columnValue named pairs
							"tableName1/columnName1": "tn1/col1",
							"tableName1/columnName2": "tn1/col2",
							"tableName2/columnName1": "tn2/col1",
						}
						"addressFields": {										//If other address fields (ie. house number, street name, etc) are entered
							"zip": "12345",										// they need to follow field name format for match to be made (see instructions for available fields) 
							"Custom Field": "Value"
						},
						"lpFields": {											//If other LP fields (ie. address1, lastRenewalDate, etc) are entered
							"licType": "Engineer",								// they need to follow field name format for match to be made (see instructions for available fields)
							"Custom Field": "Value"
						},
						"feeFields": {											//add fees
							"feeSchedule":"LIC_INSP",							// fee schedule name
							"feePeriod": "FINAL",								// fee period
							"feeItems": {
								"INSP_001":"1|Y",								// fee code + quantity|autoInvoice action (pipe delimited)
								"INSP_002":"2|Y",								// can add as many fees from the same schedule as needed
							},													// if fees from another schedule are needed, can be added in another ruleset for the same event type
						},
						"rangeType":"Days",										//valid values are "Days" or "Months"
						"range": 14,											//number in rangeType (i.e., 30 Days, 2 Months, etc)
						"assignment":"Auto",									//how to assign an inspector, if "Auto", will use function autoAssign, if "Record", assign to person assigned to the record, if blank, will look for value in inspector field. If no value, will schedule w/o assignment.
						"inspector":"",											//specific inspector userid to assign inspection to, assignment field should be left blank
						"department":"",										//seven level structure of department (i.e., Agency/Licenses/Inspections/NA/NA/NA/NA)
						"comments": "Inspection Scheduled via EMSE",			//any comments to include on the inspection
						"postScript": "CUSTOM_SCRIPT"							//custom script to run after the scheduling script
					},
				}],

Reviewed By: 

Script Type : (EMSE, EB, Pageflow, Batch): EMSE

General Purpose/Client Specific : General

Client developed for : Aurora

Parameters: capId, rules				
================================================================================================================*/
try {
	var scriptSuffix = "INSPECTION_SCHEDULING";
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var settingsArray = [];
	if (isConfigurableScript(settingsArray, scriptSuffix)) {

		for (s in settingsArray) {
			var rules = settingsArray[s];

			var preScript = rules.preScript;
			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}

			inspectionScheduling(capId, rules);

			var postScript = rules.postScript;
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}
	}

} catch (ex) {
	logDebug("**ERROR: Exception with JSON rules for script " + scriptSuffix + ". Error: " + ex);
}
// functions

function inspectionScheduling(capId, rules) {

	var inspType = rules.inspectionType;
	var contactInfo = rules.contactFields;
	var customFields = rules.customFields;
	var customLists = rules.customLists;
	var addressInfo = rules.addressFields;
	var lpInfo = rules.lpFields;
	var feeInfo = rules.feeFields;
	var createdByACA = rules.isCreatedByACA;

	var rangeType = rules.rangeType;
	var range = rules.range;
	var assignment = rules.assignment;
	var inspector = rules.inspector;
	var dept = rules.department;
	var comments = rules.comments;

	// rules loop 

	var okToSched = new Array();

	// contact type rules - 

	if (contactInfo) {
		for ( var ct in contactInfo) {
			var jsonFieldValue = contactInfo[ct];
			if (ct == "contactType") {
				var contactType = contactInfo[ct];
				var contactModel = getContactByType(contactType, capId);
				if (contactModel) {
					var type = contactModel.getContactType();
				}

				// get record contact info from Common Script
				var contactArr = getContacts();
				for (ca in contactArr) {
					thisContact = contactArr[ca];
					var recordFieldValue = thisContact[ct];
					if (recordFieldValue != null) {
						recordFieldValue = recordFieldValue.toUpperCase();
					}

					//logDebug("jsonFieldValue: " + jsonFieldValue);
					//logDebug("recordFieldValue: " + recordFieldValue);

					if (jsonFieldValue == recordFieldValue) {
						okToSched[0] = true;
					} else {
						okToSched[0] = false;
					}
				}
			}
		}
	}

	// custom field rules 

	if (customFields) {
		for ( var cf in customFields) {
			if (getAppSpecific(cf) == customFields[cf]) {
				okToSched[1] = true;
			} else {
				okToSched[1] = false;
			}
		}
	}

	// custom list rules

	if (customLists) {
		for ( var tc in customLists) {
			var tableColumn = tc.split('/');
			var tableName = tableColumn[0];
			var columnName = tableColumn[1];
			var columnValue = customLists[tc];
			//logDebug("Table Name is " + tableName + " and column name is " + columnName + " and column value is " + columnValue);

			var tbl = loadASITable(tableName);
			if (tbl != "undefined") {
				for (row in tbl) {
					var asiColumnValue = tbl[row][columnName];
					//logDebug("columnValue: " + columnValue);
					//logDebug("asiColumnValue: " + asiColumnValue);

					if (columnValue == asiColumnValue) {
						okToSched[2] = true;
						break;
					} else {
						okToSched[2] = false;
					}
				}
			}
		}
	}

	if (addressInfo) {
		for ( var a in addressInfo) {
			var jsonFieldValue = addressInfo[a];

			// get record info
			var addrArray = [];
			//getAddress(addrArray);
			loadAddressAttributesLocal(addrArray);
			var recordFieldValue = addrArray[a];
			//logDebug("recordFieldValue: " + recordFieldValue);
			if (recordFieldValue != null) {
				if (recordFieldValue == jsonFieldValue) {
					okToSched[3] = true;
				} else {
					okToSched[3] = false;
				}
			}
		}
	}

	// lp rules

	if (lpInfo) {
		for (l in lpInfo) {
			var jsonFieldValue = lpInfo[l];

			//get record info
			var lpArray = new Array();
			getLPFieldsLocal(lpArray);
			var recordFieldValue = lpArray[l];
			// logDebug("recordFieldValue: " + recordFieldValue);
			// logDebug("jsonFieldValue: " + jsonFieldValue);
			if (recordFieldValue != null) {
				if (recordFieldValue == jsonFieldValue) {
					okToSched[4] = true;
				} else {
					okToSched[4] = false;
				}
			}
		}
	}

	logDebug("createdByACA: " + createdByACA);
	logDebug("isCreatedByACA: " + cap.isCreatedByACA());

	if (createdByACA != "") {
		if (createdByACA && cap.isCreatedByACA()) {
			okToSched[5] = true;
		}
		if (createdByACA && !cap.isCreatedByACA()) {
			okToSched[5] = false;
		}
		if (!createdByACA && !cap.isCreatedByACA()) {
			okToSched[5] = true;
		}
		if (!createdByACA && cap.isCreatedByACA()) {
			okToSched[5] = false;
		}

	} else { // field is blank, so not a factor
		okToSched[5] = true;
	}

	var schedule = true;
	for (o in okToSched) {
		//logDebug("okToSched: " + o + ": " + okToSched[o]);
		if (okToSched[o] == false) {
			schedule = false;
			break;
		}
	}
	logDebug("schedule: " + schedule);

	/*==========================================================================================
	|  all tests complete - schedule and assign inspection
	======================================================================================= */

	if (schedule) {
		//recId = getApplication(capId);

		//logDebug("should be in here: " + schedule);
		// get # of days out to schedule
		var daysToSched = 0
		if (!matches(range, null, "", 0)) {
			if (rangeType != "Days") {
				if (rangeType = "Months") {
					var today = new Date();
					var outDate = addMonths(today, range);
					daysToSched = dateDiff(today, outDate).toFixed();
				} else {
					logDebug("Unsupported rangeType");
				}
			} else {
				daysToSched = range;
			}
		}
		// logDebug("daysToSched: " + daysToSched);
		// logDebug("inspType: " + inspType);
		// logDebug("assignment: " + assignment);

		switch (assignment) {
		case "Auto":
			scheduleInspectionLocal(capId, inspType, daysToSched, "", "", comments);
			// get inspectionID for inspection just created and assign
			var inspectionIdArray = new Array();
			var inspResultObj = aa.inspection.getInspections(capId);
			if (inspResultObj.getSuccess()) {
				inspList = inspResultObj.getOutput();
				for (xx in inspList) {
					var inspectionIdNumber = inspList[xx].getIdNumber();
					var idInspType = inspList[xx].getInspectionType();
					if (idInspType = inspType) {
						// inspectionIdArray.push(inspectionIdNumber);
						//logDebug("inspectionIdNumber : " + inspectionIdNumber); 
						autoAssignInspection(inspectionIdNumber);
					}
				}
			}
			break;
		case "":
			// if assignment is blank, look for a value in the inspector field and assign to them 
			// if no value, schedule w/o assignment
			if (!matches(inspector, null, "")) {
				//scheduleInspection(inspType, daysToSched, inspector, "", comments);
				scheduleInspectionLocal(capId, inspType, daysToSched, inspector, "", comments);
				//logDebug("inspector: " + inspector);
			} else {
				// logDebug("inspector: " + inspector);
				// logDebug("inspType: " + inspType);
				scheduleInspectionLocal(capId, inspType, daysToSched, "", "", comments);
			}
			break;
		case "Record":
			// if assignment = Record, schedule and assign to the record holder
			capDetail = aa.cap.getCapDetail(capId).getOutput();
			userObj = aa.person.getUser(capDetail.getAsgnStaff());
			if (userObj.getSuccess()) {
				staff = userObj.getOutput();
				userID = staff.getUserID();
				logDebug("userID: " + userID);
				scheduleInspectionLocal(capId, inspType, daysToSched, userID, "", comments);
			} else {
				scheduleInspectionLocal(capId, inspType, daysToSched, "", "", comments);
			}
			break;
		default:
			break;
		} // switch

	} // okToSched	

	// add fees 
	if (feeInfo) {
		if (!matches(feeInfo, "", null)) {
			var sched = feeInfo.feeSchedule;
			var period = feeInfo.feePeriod;
			var items = feeInfo.feeItems;

			for (i in items) {
				var code = i;
				var itemsArr = items[i].split('|');
				for (a in itemsArr) {
					var qty = itemsArr[0];
					var invoice = itemsArr[1];
				}
				//logDebug("add fee: " + code + ", " + sched + ", " + period + ", " + qty + ", " + invoice);
				updateFee(code, sched, period, qty, invoice);
			}
		}
	}
}

/*==========================================================================================
| HELPER FUNCTIONS
========================================================================================== */

function addMonths(date, count) {
	if (date && count) {
		var m, d = (date = new Date(+date)).getDate()

		date.setMonth(date.getMonth() + count, 1)
		m = date.getMonth()
		date.setDate(d)
		if (date.getMonth() !== m)
			date.setDate(0)
	}
	return date
}

function getContactByType(conType, capId) {

	var contactArray = getPeople(capId);

	for (thisContact in contactArray) {

		if ((contactArray[thisContact].getPeople().contactType).toUpperCase() == conType.toUpperCase())

			return contactArray[thisContact].getPeople();

	}

	return false;

}
//
// may not need for supported environments, but throwing error if not present in Brooklyn
function getPeople(capId) {
	capPeopleArr = null;
	var s_result = aa.people.getCapContactByCapID(capId);
	if (s_result.getSuccess()) {
		capPeopleArr = s_result.getOutput();
		if (capPeopleArr != null || capPeopleArr.length > 0) {
			for (loopk in capPeopleArr) {
				var capContactScriptModel = capPeopleArr[loopk];
				var capContactModel = capContactScriptModel.getCapContactModel();
				var peopleModel = capContactScriptModel.getPeople();
				var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
				if (contactAddressrs.getSuccess()) {
					var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
					peopleModel.setContactAddressList(contactAddressModelArr);
				}
			}
		} else {
			aa.print("WARNING: no People on this CAP:" + capId);
			capPeopleArr = null;
		}
	} else {
		aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
		capPeopleArr = null;
	}
	return capPeopleArr;
}

// must use local function to correctly match json parameter to field name
function loadAddressAttributesLocal(thisArr) {
	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args

	//var fcapAddressObj = null;
	var capAddressResult = aa.address.getAddressWithAttributeByCapId(itemCap);
	if (capAddressResult.getSuccess())
		var fcapAddressObj = capAddressResult.getOutput();
	else
		logDebug("**ERROR: Failed to get Address object: " + capAddressResult.getErrorType() + ":" + capAddressResult.getErrorMessage())

	for (i in fcapAddressObj) {
		addressAttrObj = fcapAddressObj[i].getAttributes().toArray();
		for (z in addressAttrObj)
			thisArr[addressAttrObj[z].getB1AttributeName()] = addressAttrObj[z].getB1AttributeValue();

		// Explicitly load some standard values
		thisArr["primaryFlag"] = fcapAddressObj[i].getPrimaryFlag();
		thisArr["houseNumberStart"] = fcapAddressObj[i].getHouseNumberStart();
		thisArr["streetDirection"] = fcapAddressObj[i].getStreetDirection();
		thisArr["streetName"] = fcapAddressObj[i].getStreetName();
		thisArr["streetSuffix"] = fcapAddressObj[i].getStreetSuffix();
		thisArr["city"] = fcapAddressObj[i].getCity();
		thisArr["state"] = fcapAddressObj[i].getState();
		thisArr["zip"] = fcapAddressObj[i].getZip();
		thisArr["addressStatus"] = fcapAddressObj[i].getAddressStatus();
		thisArr["county"] = fcapAddressObj[i].getCounty();
		thisArr["country"] = fcapAddressObj[i].getCountry();
		thisArr["addressDescription"] = fcapAddressObj[i].getAddressDescription();
		thisArr["xCoordinate"] = fcapAddressObj[i].getXCoordinator();
		thisArr["yCoordinate"] = fcapAddressObj[i].getYCoordinator();
	}
}

function getLPFieldsLocal(returnArray) {
	var rArray = new Array();
	licArr = getLicenseProfessional(capId);
	for (i in licArr) {

		returnArray["licType"] = licArr[i].getLicenseType();
		returnArray["lastName"] = licArr[i].getContactLastName();
		returnArray["firstName"] = licArr[i].getContactFirstName();
		returnArray["businessName"] = licArr[i].getBusinessName();
		returnArray["address1"] = licArr[i].getAddress1();
		returnArray["city"] = licArr[i].getCity();
		returnArray["state"] = licArr[i].getState();
		returnArray["zip"] = licArr[i].getZip();
		returnArray["country"] = licArr[i].getCountry();
		returnArray["email"] = licArr[i].getEmail();
		returnArray["phone1"] = licArr[i].getPhone1();
		returnArray["phone2"] = licArr[i].getPhone2();
		returnArray["lastRenewalDate"] = licArr[i].getLastRenewalDate();
		returnArray["licExpirationDate"] = licArr[i].getLicenseExpirDate();
		returnArray["FEIN"] = licArr[i].getFein();
		returnArray["gender"] = licArr[i].getGender();
		returnArray["birthDate"] = licArr[i].getBirthDate();

		var tmpAttrList = licArr[i].getAttributes();
		for (xx1 in tmpAttrList) {
			returnArray[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
		}

	}
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)
		servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

function scheduleInspectionLocal(itemCap, iType, DaysAhead) // optional inspector ID.  This function requires dateAdd function
{
	// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
	// DQ - Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment");
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3)
		if (arguments[3] != null) {
			var inspRes = aa.person.getUser(arguments[3])
			if (inspRes.getSuccess())
				var inspectorObj = inspRes.getOutput();
		}

	if (arguments.length >= 4)
		if (arguments[4] != null)
			inspTime = arguments[4];

	if (arguments.length == 5)
		if (arguments[5] != null)
			inspComm = arguments[5];

	var schedRes = aa.inspection.scheduleInspection(itemCap, inspectorObj, aa.date.parseDate(dateAdd(null, DaysAhead)), inspTime, iType, inspComm)

	if (schedRes.getSuccess())
		logDebug("Successfully scheduled inspection : " + iType + " for " + dateAdd(null, DaysAhead));
	else
		logDebug("**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
}

function getApplication(appNum)
//
// returns the capId object of an application
//
{
	var getCapResult = aa.cap.getCapID(appNum);
	if (getCapResult.getSuccess())
		return getCapResult.getOutput();
	else {
		logDebug("**ERROR: getting cap id (" + appNum + "): " + getCapResult.getErrorMessage())
	}
}
