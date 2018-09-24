/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AMD_COPY_CONTACTS_ONLOAD.js
| Event   : ACA ONLOAD (CONTACT PORTLET)
|
| Usage   : Used to pre-populate contacts on amendment records from the amendment parent.
|
| Client  : BCC
| Action# : N/A
|
| Notes   : 02/23/2015 ETW - added setComponentName(null), fix for contacts not displaying in ACA
|			12/7/2017 ETW - added the List of Owners ASIT
|			12/8/2017 ETW - updated to not copy the primary contact person 
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
//cancel = true;
//showDebug = true;
//showMessage = true;

	var cap = aa.env.getValue("CapModel");
	parentCapIdString = "" + cap.getParentCapID();
	if (parentCapIdString) {
		pca = parentCapIdString.split("-");
		parentCapId = aa.cap.getCapID(pca[0], pca[1], pca[2]).getOutput();
	}

	if (parentCapId) {
		//Get the non-Applicant contacts
		parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);
		contactList = parentCap.getContactsGroup();

		var vContact;
		var vContactType;
		//var vContactTypes = ["Business", "Primary Contact Person"];
		var vContactTypes = ["Business", "Event Business"];

		// remove unneeded contacts
		var i = contactList.iterator();
		while (i.hasNext()) {
			vContact = i.next();
			vContactType = vContact.getContactType();
			if (!exists(vContactType, vContactTypes)) {
				i.remove();
			}
		}

		// get the contacts this way for ASI
		var Contacts = aa.people.getCapContactByCapID(parentCapId).getOutput();

		for (i = 0; i < contactList.size(); i++) {
			// need to get getPeopleTemplate here since getCapViewBySingle4ACA doesn't get it.
			for (var yy in Contacts) {
				if (contactList.get(i).getPeople().getContactSeqNumber().equals(Contacts[yy].getCapContactModel().getContactSeqNumber())) {
					contactList.get(i).getPeople().setTemplate(Contacts[yy].getCapContactModel().getPeople().getTemplate());
				}
			}
			// clear ACA components so that they display in the correct component per the ACA pageflow.
			contactList.get(i).getPeople().setContactSeqNumber(null);
			contactList.get(i).setComponentName(null);
		}
		cap.setContactsGroup(contactList);

		//Get the applicant
		/*
		// removing applicant (Owner Applicant) see Story 2168
		applicantModel = parentCap.getApplicantModel();
		applicantModel.getPeople().setContactSeqNumber(null);
		applicantModel.setComponentName(null);
		cap.setApplicantModel(applicantModel);
		 */

		// Copy List of Owners ASIT
		//set list of possible tables
		var vASITNameArray = [];
		vASITNameArray.push('LIST OF OWNERS');

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

		// Save the updated cap back to the system.
		aa.env.setValue("CapModel", cap);
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
