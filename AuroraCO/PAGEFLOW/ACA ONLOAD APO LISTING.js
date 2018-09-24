/*------------------------------------------------------------------------------------------------------/
| Program : ACA_Onload_APO_Listing_V3.0.js
| Event   : ACA_OnLoad
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : Aurora
| Action# : N/A
|
| Notes   : Lists parcels and jurisdictions (ghess, 3/25/2016)
| Update  : 06/27/2016,  ghess 
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
var preExecute = "PreExecuteForBeforeEvents"
var controlString = "ACA_Onload"; // Standard choice for control
var documentOnly = false; // Document Only -- displays hierarchy of std choice steps
var disableTokens = false; // turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var enableVariableBranching = false; // Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99; // Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/

var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var feeSeqList = new Array(); // invoicing fee list
var paymentPeriodList = new Array(); // invoicing pay periods

if (documentOnly) {
	doStandardChoiceActions(controlString, false, 0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_CUSTOM"));

if (documentOnly) {
	doStandardChoiceActions(controlString, false, 0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

function getScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1)
		servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
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
//loadASITables();
myloadASITables4ACA();

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

/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length)
	doStandardChoiceActions(preExecute, true, 0); // run Pre-execution code

logGlobals(AInfo);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
function myloadASITables4ACA() {

	//
	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	//
	// Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
	//

	var itemCap = capId;
	if (arguments.length == 1) {
		itemCap = arguments[0]; // use cap ID specified in args
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	} else {
		var gm = cap.getAppSpecificTableGroupModel()
	}

	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();

	while (tai.hasNext()) {
		var tsm = tai.next();

		if (tsm.rowIndex.isEmpty())
			continue; // empty table

		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName();

		tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

		if (!isNaN(tn.substring(0, 1)))
			tn = "TBL" + tn // prepend with TBL if it starts with a number

		var tsmfldi = tsm.getTableField().iterator();
		var tsmcoli = tsm.getColumns().iterator();
		var numrows = 1;

		while (tsmfldi.hasNext()) // cycle through fields
		{
			if (!tsmcoli.hasNext()) // cycle through columns
			{

				var tsmcoli = tsm.getColumns().iterator();
				tempArray.push(tempObject); // end of record
				var tempObject = new Array(); // clear the temp obj
				numrows++;
			}
			var tcol = tsmcoli.next();
			var tval = tsmfldi.next(); //fixed this line
			tempObject[tcol.getColumnName()] = tval;
		}
		tempArray.push(tempObject); // end of record
		var copyStr = "" + tn + " = tempArray";
		logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
		eval(copyStr); // move to table name
	}

}
function getGISInfoByParcel(pParcelNo, svc, layer, attributename) {
	try {
		var distanceType = "feet";
		var retString;

		//get layer
		var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
		if (bufferTargetResult.getSuccess()) {
			var buf = bufferTargetResult.getOutput();
			buf.addAttributeName(attributename);
		} else {
			logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage());
			return false
		}

		//get parcel GIS object
		//aa.print("Looking at parcel " + pParcelNo);
		var gisObjResult = aa.gis.getParcelGISObjects(pParcelNo); // get gis objects on the parcel number
		if (gisObjResult.getSuccess()) {
			var fGisObj = gisObjResult.getOutput();
		} else {
			logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage());
			return false
		}

		for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
			var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

			if (bufchk.getSuccess())
				var proxArr = bufchk.getOutput();
			else {
				logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());
				return false
			}

			for (a2 in proxArr) {
				var proxObj = proxArr[a2].getGISObjects(); // if there are GIS Objects here, we're done
				for (z1 in proxObj) {
					var v = proxObj[z1].getAttributeValues()
					retString = v[0];
				}
			}
		}
		return retString;
	} catch (err) {
		logDebug("A JavaScript Error occurred in custom function getGISInfoByParcel(): " + err.message);
		//aa.print("A JavaScript Error occurred in custom function getGISInfoByParcel(): " + err.message);
	}
}
function getPrimaryCapParcel() {
	try {
		var capParcelModel = cap.getParcelModel();
		if (capParcelModel == null)
			return;

		var parcelModel = capParcelModel.getParcelModel();
		if (parcelModel == null)
			return;

		return parcelModel.getParcelNumber();
	} catch (err) {
		logDebug("A JavaScript Error occurred in custom function getPrimaryCapParcel(): " + err.message);
		//aa.print("A JavaScript Error occurred in custom function getPrimaryCapParcel(): " + err.message);
	}
}
function getRefParcelByParcel(pParcel) {
	try {
		//this is incomplete
		//Get Address based on Parcel
		var addrObj = aa.address.getAddressListForAdmin(pParcel, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
		if (addrObj.getSuccess()) {
			var addrArr = addrObj.getOutput();
			//grab first address (changing from addrArr.length==1)
			if (addrArr != null && addrArr.length > 0) {
				var addr = addrArr[0].getRefAddressModel();

				//Set to not primary
				//addr.setPrimaryFlag("N");

			} else //if no Address, just add Parcel
			{
				//logDebug("Not found address for parcel Id: " + pParcel);
				//aa.print("Not found address for parcel Id: " + pParcel);
			}
		}
	} catch (err) {
		logDebug("A JavaScript Error occurred in custom function getRefParcelByParcel(): " + err.message);
		//aa.print("A JavaScript Error occurred in custom function getRefParcelByParcel(): " + err.message);
	}
}
function getRefOwnerNameByParcel(pParcelNo) {
	try {

		//Get parcel script model
		var vParcelModelList = aa.parcel.getParceListForAdmin(pParcelNo, null, null, null, null, null, null, null, null, null).getOutput();
		if (vParcelModelList.length > 0) {
			var vParcelModel = vParcelModelList[0];
			aa.print("Test : " + vParcelModel["ownerFullName"]);
			return vParcelModel["ownerFullName"];
		}

	} catch (err) {
		logDebug("A JavaScript Error occurred in custom function getRefOwnerNameByParcel(): " + err.message);
		//aa.print("A JavaScript Error occurred in custom function getRefOwnerNameByParcel(): " + err.message);
	}
}

function getRefAddressByParcel(pParcelNo) {
	try {
		var strAddress = "NA";

		//Get Address based on Parcel
		var addrObj = aa.address.getAddressListForAdmin(pParcelNo, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
		if (addrObj.getSuccess()) {
			var addrArr = addrObj.getOutput();
			//grab first address (changing from addrArr.length==1)
			if (addrArr != null && addrArr.length > 0) {
				var addr = addrArr[0].getRefAddressModel();

				//get address string
				//addr.setPrimaryFlag("N");
				if (addr != null) {
					var strAddress = addr.getAddressLine1();
					if (strAddress == null) {
						strAddress = addr.getHouseNumberStart();
						strAddress += (addr.getStreetDirection() != null ? " " + addr.getStreetDirection() : "");
						strAddress += (addr.getStreetName() != null ? " " + addr.getStreetName() : "");
						strAddress += (addr.getStreetSuffix() != null ? " " + addr.getStreetSuffix() : "");
						strAddress += (addr.getUnitStart() != null ? ", " + addr.getCity() : "");
						strAddress += (addr.getUnitStart() != null ? ", " + addr.getState() : "");
						//strAddress += (addr.getUnitStart() != null? ", " + addr.getZip(): "");
					}
				}

			}
		}
		return strAddress;
	} catch (err) {
		logDebug("A JavaScript Error occurred in custom function getRefAddressByParcel(): " + err.message);
		//aa.print("A JavaScript Error occurred in custom function getRefAddressByParcel(): " + err.message);
	}
}

try {

	//establish working
	cancel = false;
	showMessage = true; //set to true to see comment()
	showDebug = false; //set to true to see all ugly details      
	logDebug("working");
	//comment("Here is my message that I want to pop up Onload.");
	//comment("This is a momentary test. Please try again in a few minutes");

	var pageHeader = "You have chosen the following locations:<br>";
	var apoListHeader = "<u>Parcel, Address, and Owner Listing</u><br>";
	var pageFooter = "<br>Duplicate parcels will be removed upon submittal.";
	var apoListDisplay = "";
	var strParcel = "";

	//Check parcel entered in Parcel component
	strParcel = getPrimaryCapParcel();
	apoListDisplay = apoListDisplay + strParcel + " | " + getRefAddressByParcel(strParcel) + " | " + getRefOwnerNameByParcel(strParcel) + "<br>";
	
	//Get parcels from Multiple Parcels custom table
	if (typeof (MULTIPLEPARCELS) == "object") {
		//comment("Checking Multiple Parcels");
		for (xxx in MULTIPLEPARCELS) {
			var myParcelId = MULTIPLEPARCELS[xxx]["Parcel"];
			myParcelId = myParcelId.trim();
			//comment("Checking Parcel #" +myParcelId);

			var prclObj = aa.parcel.getParceListForAdmin(myParcelId, null, null, null, null, null, null, null, null, null);
			if (prclObj.getSuccess()) {
				//comment("Got past prclObj...");

				var prclArr = prclObj.getOutput();
				if (prclArr.length > 0) {
					//comment("Got past prclArr...");

					var prcl = prclArr[0].getParcelModel();
					strParcel = prcl.getParcelNumber();
					//comment("Found parcel Id: " + strParcel);

					apoListDisplay = apoListDisplay + strParcel + " | " + getRefAddressByParcel(strParcel) + " | " + getRefOwnerNameByParcel(strParcel) + "<br>";
				}
			} else {
				//comment("Problem accessing Parcel information (prclObj)");
			}
		}
		if (apoListDisplay != "") {
			showMessage = true; //set to true to see comment()
			comment(pageHeader);
			comment(apoListHeader + apoListDisplay + pageFooter);
		}
	}
	//comment("Reached the end");
} catch (err) {
	comment("Error:" + err);
}

//
// Check for invoicing of fees
//
if (feeSeqList.length) {
	invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
	if (invoiceResult.getSuccess())
		logMessage("Invoicing assessed fee items is successful.");
	else
		logMessage("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

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

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/