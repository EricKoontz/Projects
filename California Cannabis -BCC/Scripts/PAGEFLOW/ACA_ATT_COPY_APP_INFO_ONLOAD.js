/*------------------------------------------------------------------------------------------------------/
| Program : ACA_APP_ASI_OPTIONS_ONLOAD.js
| Event   : ACA Page Flow onload
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var useCustomScriptFile = true; // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));

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

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode() // Service Provider Code
	var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
	currentUserID = "ADMIN";
	publicUser = true
} // ignore public users
var capIDString = capId.getCustomID(); // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
	if (currentUserGroupObj)
		currentUserGroup = currentUserGroupObj.getGroupName();
	var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var parcelArea = 0;

var estValue = 0;
var calcValue = 0;
var feeFactor // Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput(); // Calculated valuation
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
}

var balanceDue = 0;
var houseCount = 0;
feesInvoicedTotal = 0; // Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId); // Detail
if (capDetailObjResult.getSuccess()) {
	capDetail = capDetailObjResult.getOutput();
	var houseCount = capDetail.getHouseCount();
	var feesInvoicedTotal = capDetail.getTotalFee();
	var balanceDue = capDetail.getBalance();
}

var AInfo = new Array(); // Create array for tokenized variables
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);

// page flow custom code begin

try {

	parentCapIdString = "" + cap.getParentCapID();
	if (parentCapIdString) {
		pca = parentCapIdString.split("-");
		parentCapId = aa.cap.getCapID(pca[0], pca[1], pca[2]).getOutput();
	}

	if (parentCapId) {
		//Check to see if existing ATT amendment exists and is in a status other than "Abandoned", "Completed", "Void", "Withdrawn". If so cancel new ATT Amendment.
		var vChildAmd = getChildren("Licenses/*/*/Incomplete Attestation", parentCapId, capId);
		if (vChildAmd.length > 0) {
			var z = 0;
			for (z in vChildAmd) {
				var vChildId = vChildAmd[z];
				var vChildIdString = vChildId + "";
				if (vChildIdString.indexOf("TMP") == -1 && vChildIdString.indexOf("EST") == -1) {
					var vChildCap = aa.cap.getCap(vChildId).getOutput();
					var vChildStatus = vChildCap.getCapStatus();
					if (vChildStatus != "Abandoned" && vChildStatus != "Completed" && vChildStatus != "Void" && vChildStatus != "Withdrawn") {
						showMessage = true;
						comment("An open attestation amendment (" + vChildId.getCustomID() + ") already exists. You may not submit another attestation amendment until the existing one is processed by BCC");
						cancel = true;
						break;
					}
				}
			}
		}

		parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);

		//Copy ASI
		copyAppSpecific4ACA(parentCap);

		//Copy ASIT
		//set list of possible tables
		var vASITNameArray = [];
		vASITNameArray.push('LIST OF OWNERS');
		vASITNameArray.push('NON CONTROLLING INTEREST');
		vASITNameArray.push('FICTITIOUS BUSINESS NAME');
		vASITNameArray.push('EVENT LICENSEES');
		vASITNameArray.push('ENTITY OWNERSHIP');

		var vASITName;
		var x = 0;
		var vASIT;
		var vRowCount = 0;
		var y = 0;
		var vASITData;

		for (x in vASITNameArray) {
			vASITName = vASITNameArray[x];
			vASIT = loadASITable(vASITName);
			vRowCount = 0;

			if (typeof(vASIT) == "object") {
				for (y in vASIT) {
					vRowCount = vRowCount + 1;
				}
			}

			if (vRowCount == 0) {
				vASITData = loadASITable(vASITName, parentCapId);
				addASITable(vASITName, vASITData);

				var tmpCap = aa.cap.getCapViewBySingle(capId);
				cap.setAppSpecificTableGroupModel(tmpCap.getAppSpecificTableGroupModel());
				aa.env.setValue("CapModel", cap);
			}
		}

		//Hide ASI fields that have been answered.
		hideAnsweredAppSpecific4ACA();

		//Save application ID to ASI.
		editAppSpecific4ACA("Application ID", parentCapId.getCustomID());

		// Hide attestation page if parent is a full license:
		var vTempASI = getAppSpecific("Are you requesting a temporary license?", parentCapId);
		var isTemp = isASITrue(vTempASI);

		if (!isTemp && vTempASI != null) {
			aa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
		}

		// Save all back to ACA capModel
		aa.env.setValue("CapModel", cap);
	}

} catch (err) {

	slackDebug(err);

}

// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}

/////////////////////////////////////
function hideAnsweredAppSpecific4ACA() {
	// uses capModel in this event
	var capASI = cap.getAppSpecificInfoGroups();
	if (!capASI) {
		logDebug("No ASI for the CapModel");
	} else {
		var i = cap.getAppSpecificInfoGroups().iterator();
		while (i.hasNext()) {
			var group = i.next();
			var fields = group.getFields();
			if (fields != null) {
				var iteFields = fields.iterator();
				while (iteFields.hasNext()) {
					var field = iteFields.next();
					logDebug(field.getCheckboxDesc() + " : " + field.getChecklistComment());
					//logDebug(field.getCheckboxDesc() + " : " + field.getVchDispFlag());
					if (field.getChecklistComment() != null && field.getChecklistComment() != "null" && field.getChecklistComment() != "UNCHECKED") {
						field.setAttributeValueReqFlag('N');
						field.setVchDispFlag('H');
						logDebug("Updated ASI: " + field.getCheckboxDesc() + " to be ACA not displayable.");
					}
				}
			}
		}
	}
}
