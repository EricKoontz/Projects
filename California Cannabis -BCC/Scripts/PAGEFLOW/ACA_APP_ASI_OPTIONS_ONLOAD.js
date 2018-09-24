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

	//showDebug = true;
	//showMessage = true;
	//cancel = true;

	var isPriorityRequest = isASITrue(AInfo["Are you requesting priority processing?"]); // see user story 340
	var isTemporaryRequest = isASITrue(AInfo["Are you requesting a temporary license?"]); // see user story 340

	logDebug("Is Temp?: " + isTemporaryRequest);

	if (isTemporaryRequest) {
		hideAppSpecific4ACA("5006(b)(23) In compliance with all local ordinances and regulations.");
		hideAppSpecific4ACA("19322(b) No failure to comply with operating procedures");
		hideAppSpecific4ACA("Attest in operation prior to 9-1-16 for Priority Processing");
		hideAppSpecific4ACA("Attest no prohibited location Within specified requirement");
		hideAppSpecific4ACA("Status for Seller's Permit");
		hideAppSpecific4ACA("Seller's Permit Number");
		hideAppSpecific4ACA("Seller's Permit in process");
		hideAppSpecific4ACA("20 or more employees?");
		hideAppSpecific4ACA("Attest they will abide to the Labor Peace Agreement");
		hideAppSpecific4ACA("Are they Sovereign Entity");
		hideAppSpecific4ACA("5006(b)(33) Waiving Sovereign Immunity");
		hideAppSpecific4ACA("CEQA");
		hideAppSpecific4ACA("Cultivator License");
		hideAppSpecific4ACA("Max dollar value as determined by CDTFA in access of excise tax");
		hideAppSpecific4ACA("Accreditation/Provisional Testing Laboratory License");
		hideAppSpecific4ACA("Attest canopy size does not exceed 1 acre");
		hideAppSpecific4ACA("Attest local fire department has been notified");
		hideAppSpecific4ACA("Agricultural Employer");
		hideAppSpecific4ACA("Attest information shared with CDPH");
		hideAppSpecific4ACA("Attest information shared with CDFA");
	} else {
		resetAppSpecific4ACA("5006(b)(23) In compliance with all local ordinances and regulations.");
		resetAppSpecific4ACA("19322(b) No failure to comply with operating procedures");
		resetAppSpecific4ACA("Attest in operation prior to 9-1-16 for Priority Processing");
		resetAppSpecific4ACA("Attest no prohibited location Within specified requirement");
		resetAppSpecific4ACA("Status for Seller's Permit");
		resetAppSpecific4ACA("Seller's Permit Number");
		resetAppSpecific4ACA("Seller's Permit in process");
		resetAppSpecific4ACA("20 or more employees?");
		resetAppSpecific4ACA("Attest they will abide to the Labor Peace Agreement");
		resetAppSpecific4ACA("Are they Sovereign Entity");
		resetAppSpecific4ACA("5006(b)(33) Waiving Sovereign Immunity");
		resetAppSpecific4ACA("CEQA");
		resetAppSpecific4ACA("Cultivator License");
		resetAppSpecific4ACA("Max dollar value as determined by CDTFA in access of excise tax");
		resetAppSpecific4ACA("Accreditation/Provisional Testing Laboratory License");
		resetAppSpecific4ACA("Attest canopy size does not exceed 1 acre");
		resetAppSpecific4ACA("Attest local fire department has been notified");
		resetAppSpecific4ACA("Agricultural Employer");
		resetAppSpecific4ACA("Attest information shared with CDPH");
		resetAppSpecific4ACA("Attest information shared with CDFA");
	}
} catch (err) {
	logDebug(err);
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
