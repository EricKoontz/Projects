//Start - License Creation/Update Script
if (wfTask == "Issuance" && (wfStatus == "Issued" || wfStatus == "Provisionally Issued" || wfStatus == "Temporarily Issued")) {
	var vParentArry;
	var vLicenseID;
	var tmpCap;
	var vParentLicType;
	var vParentLicTypeString;
	var vLicenseObj;
	var vExpDate;
	var vExpDateString;
	var vLicExp_mm;
	var vLicExp_dd;
	var vLicExp_yyyy
	var vToday;
	var vToday_mm;
	var vToday_dd;
	var vToday_yyyy;
	var vTodayString;
	var vDateAddString;
	var vDateDiff;
	var vEndOfMonth;
	var vGoLive;

	if (wfStatus == "Temporarily Issued") {
		vParentLicTypeString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + "Temporary License";
		vParentLicType = "Temporary License";
	} else {
		vParentLicTypeString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + "License";
		vParentLicType = "License";
	}

	//Check if the record already has a parent of the correct type.
	//The correct type has the same top three levels of the record type
	//hierarchy as the current record but the fourth level is
	//'License' instead of 'Application'.
	//If no license exists create one.
	//
	vParentArry = getParents(vParentLicTypeString);
	if (vParentArry != null && vParentArry != "") {
		vLicenseID = vParentArry[0];
	} else if (appTypeArray[3] == "Application") {
		vLicenseID = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], vParentLicType, getAppName(capId));
	}

	//If the current record is an application record and the parent license
	//record does not exist or the current record is a renewal record and
	//the parent license does exist then update the license records info
	if (appTypeArray[3] == "Application" && (vParentArry == null || vParentArry == "")) {
		//Copy Parcels from child to license
		copyParcels(capId, vLicenseID);

		//Copy addresses from child to license
		copyAddress(capId, vLicenseID);

		//Copy ASI from child to license
		copyASIInfo(capId, vLicenseID);

		//Copy ASIT from child to license
		copyASITables(capId, vLicenseID);

		//Copy Contacts from child to license
		copyContacts3_0(capId, vLicenseID);

		//Copy Work Description from child to license
		aa.cap.copyCapWorkDesInfo(capId, vLicenseID);

		//Copy application name from child to license
		editAppName(getAppName(capId), vLicenseID);

		// Removed for story 2672 - Now copied to the application and moved with other ASI
		//Copy Business Entity type from contact to ASI
		// Get Business contact object
		//if (appMatch("Licenses/*/Event Organizer/*")) {
		//	vBusinesses = getContactObjsByCap_BCC(capId, 'Event Business');
		//} else {
		//	vBusinesses = getContactObjsByCap_BCC(capId, 'Business');
		//}
		//if (vBusinesses) {
		//Assume only one Business
		//vBusiness = vBusinesses[0];
		//vBusEntity = vBusiness.getCustomField("What is your business's organizational structure?");
		//if (vBusEntity != null && vBusEntity != "") {
		//editAppSpecific("What is your business's organizational structure?", vBusEntity, vLicenseID);
		//}
		//}

		//Update License Workflow
		tmpCap = capId;
		capId = vLicenseID;
		updateTask("Active", "Active", "Updated by WTUA:Licenses/*/*/Application", "Update by WTUA:Licenses/*/*/Application");
		capId = tmpCap;

		//Activate the license records expiration cycle
		vLicenseObj = new licenseObject(null, vLicenseID);
		vLicenseObj.setStatus("Active");

		//Add license to the CAT set;
		if (vParentLicType != "Temporary License" && !appMatch("Licenses/Cannabis/*/*")) {
			addToCat(vLicenseID);
		}

		//get license object and expiration date
		vLicenseObj = new licenseObject(null, vLicenseID);
		vExpDate = vLicenseObj.b1ExpDate;
		vExpDate = new Date(vExpDate);
		vLicExp_mm = vExpDate.getMonth() + 1;
		vLicExp_mm = (vLicExp_mm < 10) ? '0' + vLicExp_mm : vLicExp_mm;
		vLicExp_dd = vExpDate.getDate();
		vLicExp_dd = (vLicExp_dd < 10) ? '0' + vLicExp_dd : vLicExp_dd;
		vLicExp_yyyy = vExpDate.getFullYear();
		vExpDateString = vLicExp_mm + "/" + vLicExp_dd + "/" + vLicExp_yyyy;

		//get today as a string "MM/DD/YYYY"
		vToday = new Date();
		vToday_mm = vToday.getMonth() + 1;
		vToday_mm = (vToday_mm < 10) ? '0' + vToday_mm : vToday_mm;
		vToday_dd = vToday.getDate();
		vToday_dd = (vToday_dd < 10) ? '0' + vToday_dd : vToday_dd;
		vToday_yyyy = vToday.getFullYear();
		vTodayString = vToday_mm + "/" + vToday_dd + "/" + vToday_yyyy;

		if (appMatch("Licenses/Cannabis/Temporary Event/Application")) {
			vExpDate = AInfo["Event End Date"];
			vLicenseObj.setExpiration(vExpDate);
			var parentCap = aa.cap.getCap(vLicenseID).getOutput();
			var parentCapModel = parentCap.getCapModel();
			var vGoLive = new Date(AInfo["Event Start Date"]);
			parentCapModel.setFileDate(vGoLive);
			var setResult = aa.cap.editCapByPK(parentCapModel);
		} else {
			//Set expiration dates. 120 days for temp licenses, 365 days for full licenses
			vGoLive = new Date("01/01/2018");
			if (vToday < vGoLive) {
				vDateAddString = "01/01/2018";
				// defect 2318, need the file date to be 1/1/2018 if in 2017
				var parentCap = aa.cap.getCap(vLicenseID).getOutput();
				var parentCapModel = parentCap.getCapModel();
				parentCapModel.setFileDate(vGoLive);
				var setResult = aa.cap.editCapByPK(parentCapModel);
			} else {
				vDateAddString = vTodayString;
			}

			if (vParentLicType == "Temporary License") {
				vDateDiff = dateAdd(vDateAddString, 120);
				logDebug("DateDiff: " + vDateDiff);
				vDateDiff = new Date(vDateDiff);
			} else {
				vDateDiff = dateAdd(vDateAddString, 365);
				logDebug("DateDiff: " + vDateDiff);
				vDateDiff = new Date(vDateDiff);
			}
			vLicExp_mm = vDateDiff.getMonth() + 1;
			vLicExp_mm = (vLicExp_mm < 10) ? '0' + vLicExp_mm : vLicExp_mm;
			vLicExp_dd = vDateDiff.getDate();
			vLicExp_dd = (vLicExp_dd < 10) ? '0' + vLicExp_dd : vLicExp_dd;
			vLicExp_yyyy = vDateDiff.getFullYear();
			vExpDate = vLicExp_mm + "/" + vLicExp_dd + "/" + vLicExp_yyyy;
			vLicenseObj.setExpiration(vExpDate);

			//get new license status by date. if within 60 days of expiration status should be "About to Expire", else "Active"
			vLicenseObj = new licenseObject(null, vLicenseID);
			vExpDate = vLicenseObj.b1ExpDate;
			vExpDate = new Date(vExpDate);
			vLicExp_mm = vExpDate.getMonth() + 1;
			vLicExp_mm = (vLicExp_mm < 10) ? '0' + vLicExp_mm : vLicExp_mm;
			vLicExp_dd = vExpDate.getDate();
			vLicExp_dd = (vLicExp_dd < 10) ? '0' + vLicExp_dd : vLicExp_dd;
			vLicExp_yyyy = vExpDate.getFullYear();
			vExpDateString = vLicExp_mm + "/" + vLicExp_dd + "/" + vLicExp_yyyy;
			vDateDiff = dateAdd(vExpDateString, -60);
			vDateDiff = new Date(vDateDiff);
			if (dateDiff < vToday) {
				vLicenseObj.setStatus("About to Expire");
				//Update License Workflow
				tmpCap = capId;
				capId = vLicenseID;
				updateTask("Issuance", "About to Expire", "Updated by WTUA:Licenses/*/*/Application", "Updated by WTUA:Licenses/*/*/Application");
				capId = tmpCap;
			}
		}

		//Add provisional license standard condition
		if (wfStatus == "Provisionally Issued") {
			addStdCondition("License Conditions", "Provisional License", vLicenseID);
		}

		//Generate license report and email
		var vEmailTemplate;
		var vReportTemplate;

		if (!appMatch("Licenses/Cannabis/Temporary Event/License", vLicenseID)) {
			if (wfStatus == "Temporarily Issued" && !appMatch("Licenses/Cannabis/Event Organizer/Temporary License", vLicenseID)) {
				vEmailTemplate = "DCA TEMP LICENSE ISSUED NOTIFICATION";
				vReportTemplate = "Temporary Cannabis License";
			} else if (wfStatus == "Temporarily Issued" && appMatch("Licenses/Cannabis/Event Organizer/Temporary License", vLicenseID)) {
				vEmailTemplate = "DCA TEMP LICENSE ISSUED NOTIFICATION";
				vReportTemplate = "CEO Temporary License";
			} else if (wfStatus == "Provisionally Issued") {
				vEmailTemplate = "";
				vReportTemplate = "";
			} else {
				vEmailTemplate = "DCA LICENSE ISSUED NOTIFICATION";
				if (appMatch("Licenses/Cannabis/Event Organizer/License", vLicenseID)) {
					vReportTemplate = "CEO License";
				} else {
					vReportTemplate = "License - Cannabis";
				}
			}
		} else if (wfStatus == "Issued" && appMatch("Licenses/Cannabis/Temporary Event/License", vLicenseID)) {
			vEmailTemplate = "DCA TEMPORARY EVENT LICENSE ISSUED NOTIFICATION";
			vReportTemplate = "Temporary Cannabis Event License";
		}

		var vEParams = aa.util.newHashtable();
		addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
		addParameter(vEParams, "$$ExpirationDate$$", vLicenseObj.b1ExpDate);
		addParameter(vEParams, "$$ApplicationID$$", vLicenseID.getCustomID());
		var vRParams = aa.util.newHashtable();
		addParameter(vRParams, "p1Value", vLicenseID.getCustomID());

		tmpCap = capId;
		capId = vLicenseID;
		emailContacts_BCC("All", vEmailTemplate, vEParams, vReportTemplate, vRParams);
		capId = tmpCap;

		//update requirements, update the initial review task, resend amendment emails
		if (wfStatus == "Temporarily Issued") {
			syncRequirementConditions();
			//start etw US 2302
			/*
			var vProcessID;
			var vProcessCode;
			var vTaskStepNum;
			vProcessID = getProcessID("Initial Review", capId);
			vProcessCode = getProcessCode("Initial Review", capId);
			vTaskStepNum = getTaskStepNumber(vProcessCode, "Initial Review", capId);
			resultWorkflowTask("Initial Review", "Additional Info Requested", "Updated by CREATE_LICENSE_RECORD", "Updated by CREATE_LICENSE_RECORD");
			runWTUAForWFTaskWFStatus("Initial Review", vProcessID, vTaskStepNum, "Additional Info Requested", capId);
			 */
			updateTask("Initial Review", "Additional Info Requested", "Updated by CREATE_LICENSE_RECORD", "Updated by CREATE_LICENSE_RECORD");
		}
	}
	//If the current record is an application record and the parent license
	//record already exists, close the applcation record.
	if ((wfStatus == "Issued" || wfStatus == "Provisionally Issued") && (vParentArry != null || vLicenseID != null) && balanceDue <= 0) {
		closeTask("Close Out", "Issued", "Closed by WTUA:Licenses/*/*/Application", "Closed by WTUA:Licenses/*/*/Application");
	}
}
//End - License Creation/Update Script
