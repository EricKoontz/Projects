/*------------------------------------------------------------------------------------------------------/
| Program : ACA_APP_LIST_OF_OWNERS_ONLOAD.js
| Event   : ACA Page Flow ASIT onload
|
| Usage   : Copy's the public users information to the List of Owners table.
|
| Client  : BCC
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
	
	// Start removed per Connie 10/18/17
	// Get Business contact object
	//var vBusiness;
	//if (appMatch("Licenses/*/Event Organizer/*")) {
	//	vBusiness = getContactObj(cap, 'Event Business');
	//}
	//else {
	//	vBusiness = getContactObj(cap, 'Business');
	//}

	//var vBusinessType = vBusiness.asi["What is your business's organizational structure?"];
	// End removed per Connie 10/18/17
	
	var vTableName = "LIST OF OWNERS";
	var tmpTable = loadASITable4ACA(vTableName, cap);
	
	if (!tmpTable || tmpTable.length == 0) {
		// populate the Owner Table with the public users contact (Owner Applicant)
		var getUserResult;
		var vOwnerApplicant;
		var vOwnerSeqNbr;
		var vUserModel;
		var vUserSeqNbr;
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
		var vASITable = [];
		var vASITRow = [];
		var vCapASITGroup;
		var vUpdatedASIT;

		// Get the public user account
		getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);

		if (getUserResult.getSuccess() && getUserResult.getOutput()) {
			vUserModel = getUserResult.getOutput();
			vUserSeqNbr = vUserModel.getUserSeqNum();
			// get public users reference contact
			vOwnerApplicant = getRefContactForPublicUser(vUserSeqNbr);
			if (vOwnerApplicant != null && vOwnerApplicant != false) {
				vOwnerSeqNbr = vOwnerApplicant.getContactSeqNumber();
				if (vOwnerSeqNbr != null && vOwnerSeqNbr != false) {
					vOwnerApplicant = aa.people.getPeople(vOwnerSeqNbr);
					if (vOwnerApplicant.getSuccess() && vOwnerApplicant.getOutput()) {
						vOwnerApplicant = vOwnerApplicant.getOutput();
						vFName = vOwnerApplicant.getFirstName();
						vLName = vOwnerApplicant.getLastName();
						vPhone = vOwnerApplicant.getPhone1();
						vEmail = vOwnerApplicant.getEmail();
						// Get contact addresses
						vOwnerAddresses = getRefAddContactList(vOwnerSeqNbr);
						vOwnerAddresses = vOwnerAddresses.toArray();
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
						// Save values in uppercase to match manual entry
						if (vAddrLine1 != null && vAddrLine1 != "") {
							vAddrLine1 = vAddrLine1 + "";
							vAddrLine1 = vAddrLine1.toUpperCase();
						}
						if (vAddrLine2 != null && vAddrLine2 != "") {
							vAddrLine2 = vAddrLine2 + "";
							vAddrLine2 = vAddrLine2.toUpperCase();
						} else {
							vAddrLine2 = ""
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
						vASITRow["Contact Sequence Number"] = new asiTableValObj("Contact Sequence Number", "" + vOwnerSeqNbr, "Y");

						/* removed per Connie 10/18/17
						// Populate Title and Percentage if "Sole Proprietorship"
						if (vBusinessType == "Sole Proprietorship") {
							vASITRow["Title"] = new asiTableValObj("Title", "Controlling Manager", "Y");
							vASITRow["Ownership Percentage"] = new asiTableValObj("Ownership Percentage", "100", "Y");
						}
						*/

						vASITable.push(vASITRow);

						vCapASITGroup = cap.getAppSpecificTableGroupModel();
						vUpdatedASIT = replaceASITable4ACAPageFlow(vCapASITGroup, vTableName, vASITable);
						cap.setAppSpecificTableGroupModel(vUpdatedASIT);

						aa.env.setValue("CapModel", cap);
					}
				}
			}
		}
	}
/*
	//Hide page if sole Proprietorship
	if (vBusinessType == "Sole Proprietorship") {
		aa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
	}
*/
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
