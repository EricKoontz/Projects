var vIsApplication = false;
var vIsAttestation = false;
var vIsRenewal = false;

vIsApplication = appMatch("*/*/*/Application");
vIsAttestation = appMatch("*/*/*/Incomplete Attestation");
vIsRenewal = appMatch("*/*/*/Renewal");

// Assess Application Fees
if (vIsApplication == true || vIsAttestation == true) {
	if (vEventName == "ApplicationSubmitAfter") {
		if (vIsApplication) {
			var vTmp = getAppSpecific("Are you requesting a temporary license?");
			// Only assess application fee for non-temp applications
			if (vTmp != "Yes") {
				updateFee("ADU_RET_010", "ADU_RET_FEE", "FINAL", 1, "Y");
			}
		} else if (vIsAttestation) {
			var vParentCapId = getParent();
			// Check to see if a temporary license has already been issued
			var vTempIssued = false;
			var vWFTaskHistory = aa.workflow.getWorkflowHistory(vParentCapId, 'Issuance', null).getOutput();
			var vTaskModel;
			var vTaskStatus;
			var x = 0;
			for (x in vWFTaskHistory) {
				vTaskModel = vWFTaskHistory[x];
				vTaskStatus = vTaskModel.getDisposition();
				if (vTaskStatus == 'Temporarily Issued') {
					vTempIssued = true;
					break;
				}
			}

			// Check to see if a temporary licenses has already been denied
			var vTempDenied = false;
			vWFTaskHistory = aa.workflow.getWorkflowHistory(vParentCapId, 'Supervisory Review', null).getOutput();
			x = 0;
			for (x in vWFTaskHistory) {
				vTaskModel = vWFTaskHistory[x];
				vTaskStatus = vTaskModel.getDisposition();
				if (vTaskStatus == 'Temporary Denied') {
					vTempDenied = true;
					break;
				}
			}

			// Check parent and siblings to see if application fee already has been assessed
			var vFamilyArray = [];
			vFamilyArray = getChildren("*/*/*/*", vParentCapId); // add siblings
			vFamilyArray.push(vParentCapId); // add parent
			var vAppFeeExists = false;
			var vTmpCapId;
			var y = 0;
			var vAltId;
			for (y in vFamilyArray) {
				vAltId = "";
				vTmpCapId = capId;
				capId = vFamilyArray[y];
				vAltId = capId.getCustomID();
				if (vAltId.substr(2, 3) != "TMP" && vAltId.substr(2, 3) != "EST") {
					vAppFeeExists = feeExists("ADU_RET_010", "NEW", "INVOICED");
					if (vAppFeeExists == true) {
						break;
					}
				}
				capId = vTmpCapId;
			}

			// Assess application fee on amendment
			if (vAppFeeExists == false && (vTempIssued == true || vTempDenied == true)) {
				updateFee("ADU_RET_010", "ADU_RET_FEE", "FINAL", 1, "Y");
			}
		}
	}
}

// Assess License Fees (on Application)
if (vIsApplication == true) {
	// Set workflow to Issuance --> Waiting for Payment
	// Run the WTUA event for Waiting for Payment
	if (vEventName == "WorkflowTaskUpdateAfter") {
		if (wfTask == "Supervisory Review" && wfStatus == "Approved") {
			var vFeeCode;
			var vDollar = getAppSpecific("Max dollar value as determined by CDTFA in assessing excise tax");
			if (vDollar != null && vDollar != "") {
				if (vDollar == "Up to 0.5 million") {
					vFeeCode = "ADU_RET_050";
				}
				if (vDollar == "Greater than 0.5 million to 1.5 million") {
					vFeeCode = "ADU_RET_051";
				}
				if (vDollar == "Greater than 1.5 million to 4.5 million") {
					vFeeCode = "ADU_RET_052";
				}
				if (vDollar == "Greater than 4.5 million") {
					vFeeCode = "ADU_RET_053";
				}
				updateFee(vFeeCode, "ADU_RET_FEE", "FINAL", 1, "Y");
				var vProcessID = getProcessID("Issuance", capId);
				var vProcessCode = getProcessCode("Issuance", capId);
				var vTaskStepNum;
				vTaskStepNum = getTaskStepNumber(vProcessCode, "Issuance", capId);
				resultWorkflowTask("Issuance", "Waiting for Payment", "Update by ASSESS_ADU_RET_FEES", "Update by ASSESS_ADU_RET_FEES");
				runWTUAForWFTaskWFStatus("Issuance", vProcessID, vTaskStepNum, "Waiting for Payment", capId);
			}
		}
		if (wfTask == "Supervisory Review" && wfStatus == "Temporarily Approved") {
			var vProcessID = getProcessID("Issuance", capId);
			var vProcessCode = getProcessCode("Issuance", capId);
			var vTaskStepNum;
			vTaskStepNum = getTaskStepNumber(vProcessCode, "Issuance", capId);
			resultWorkflowTask("Issuance", "Temporarily Issued", "Update by ASSESS_ADU_RET_FEES", "Update by ASSESS_ADU_RET_FEES");
			runWTUAForWFTaskWFStatus("Issuance", vProcessID, vTaskStepNum, "Temporarily Issued", capId);
		}
	}
}

//Assess Renewal Fees
if (vIsRenewal == true) {
	// Assess renewal fee
	if (vEventName == "WorkflowTaskUpdateAfter" && wfTask == "Supervisory Review" && wfStatus == "Approved") {
		var vFeeCode;
		var vDollar = getAppSpecific("Max dollar value as determined by CDTFA in assessing excise tax");
		if (vDollar != null && vDollar != "") {
			if (vDollar == "Up to 0.5 million") {
				vFeeCode = "ADU_RET_080";
			}
			if (vDollar == "Greater than 0.5 million to 1.5 million") {
				vFeeCode = "ADU_RET_081";
			}
			if (vDollar == "Greater than 1.5 million to 4.5 million") {
				vFeeCode = "ADU_RET_082";
			}
			if (vDollar == "Greater than 4.5 million") {
				vFeeCode = "ADU_RET_083";
			}
			updateFee(vFeeCode, "ADU_RET_FEE", "FINAL", 1, "Y");
		}
		var vLicenseId = getParentLicenseCapID(capId);
		if (vLicenseId != null && vLicenseId != false) {
			// Assess the Delinquent Fee
			var vLicenseObj;
			var vExpDate;
			var vToday;
			var vExpDateString;
			var vLicExp_mm;
			var vLicExp_dd;
			var vLicExp_yyyy
			var vToday_mm;
			var vToday_dd;
			var vToday_yyyy;
			var vTodayString;
			// Get expiration date as MM/DD/YYYY
			vLicenseObj = new licenseObject(null, vLicenseId);
			vExpDate = vLicenseObj.b1ExpDate;
			vExpDate = new Date(vExpDate);
			vLicExp_mm = vExpDate.getMonth() + 1;
			vLicExp_mm = (vLicExp_mm < 10) ? '0' + vLicExp_mm : vLicExp_mm;
			vLicExp_dd = vExpDate.getDate();
			vLicExp_dd = (vLicExp_dd < 10) ? '0' + vLicExp_dd : vLicExp_dd;
			vLicExp_yyyy = vExpDate.getFullYear();
			vExpDateString = vLicExp_mm + "/" + vLicExp_dd + "/" + vLicExp_yyyy;
			vExpDate = new Date(vExpDateString);
			// Get today as MM/DD/YYYY
			vToday = new Date();
			vToday_mm = vToday.getMonth() + 1;
			vToday_mm = (vToday_mm < 10) ? '0' + vToday_mm : vToday_mm;
			vToday_dd = vToday.getDate();
			vToday_dd = (vToday_dd < 10) ? '0' + vToday_dd : vToday_dd;
			vToday_yyyy = vToday.getFullYear();
			vTodayString = vToday_mm + "/" + vToday_dd + "/" + vToday_yyyy;
			vToday = new Date(vTodayString);
			if (vExpDate < vToday) {
				updateFee("ADU_RET_070", "ADU_RET_FEE", "FINAL", 1, "Y");
			}
			// Copy any unpaid license fees to renewal
			moveUnPaidFees(vLicenseId, capId);
			movePartialPaidFees(vLicenseId, capId);
			invoiceFeeAllNew(capId);
		}
		// Update workflow
		var vProcessID = getProcessID("Issuance", capId);
		var vProcessCode = getProcessCode("Issuance", capId);
		var vTaskStepNum;
		vTaskStepNum = getTaskStepNumber(vProcessCode, "Issuance", capId);
		resultWorkflowTask("Issuance", "Waiting for Payment", "Update by ASSESS_ADU_RET_FEES", "Update by ASSESS_ADU_RET_FEES");
		runWTUAForWFTaskWFStatus("Issuance", vProcessID, vTaskStepNum, "Waiting for Payment", capId);
	}
}