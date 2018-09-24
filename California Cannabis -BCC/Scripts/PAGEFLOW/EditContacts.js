var showMessage = false; // Set to true to see results in popup window
var showDebug = false;
var useAppSpecificGroupName = false;
var message = " "; // Message String
var debug = ""; // Debug String
var br = "<BR>";
var useProductScripts = true;
var cancel = false;

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

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var capIDString = capId.getCustomID();
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();
var appTypeArray = appTypeString.split("/");
var AInfo = new Array(); // Create array for tokenized variables
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info

parentCapIdString = "" + cap.getParentCapID();
if (parentCapIdString) {
	pca = parentCapIdString.split("-");
	parentCapId = aa.cap.getCapID(pca[0], pca[1], pca[2]).getOutput();
}

try {

	//cancel = true;
	//showMessage = true;
	//showDebug = 3;

	var vParentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);
	var vParentCapType = vParentCap.getCapType();
	var vParentCapTypeString = vParentCapType.toString();

	logDebug("Parent Cap Class: " + vParentCap.getClass());
	logDebug("Parent CapId Class: " + parentCapId.getClass());
	logDebug("Parent Cap Type: " + vParentCapTypeString);

	//Copy Contacts
	var contactList = vParentCap.getContactsGroup();
	for (i = 0; i < contactList.size(); i++) {
		contactList.get(i).getPeople().setContactSeqNumber(null);
		contactList.get(i).setComponentName(contactList.get(i).getContactType());
	}
	cap.setContactsGroup(contactList);
	
	//Copy the applicant
	applicantModel = vParentCap.getApplicantModel();
	applicantModel.getPeople().setContactSeqNumber(null);
	applicantModel.setComponentName(null);
	cap.setApplicantModel(applicantModel);
	
	
} catch (error) {
	logDebug(error.message);
	showDebug = true;
	cancel = true;
	showMessage = true;
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
		aa.env.setValue("ScriptReturnCode", "0");
		message += "<img src='/citizenaccess/Admin/images/empty.gif' onload=\"$('.ACA_Message_Error').addClass('ACA_Message_Notice').removeClass('ACA_Message_Error');\">";
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
	}
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function copyASITInfo4ACA(vFromTable, vFromCap, vToTable, vToCap) {
	var vReq;
	var vReqArry;
	if (arguments.length == 5) {
		vReq = arguments[4]; // use requirement pair specified in args
		vReqArry = vReq.split('|');
	}

	var vFromASITGroup;
	var vFromASITMap;
	if (vFromCap.getClass() == "class com.accela.aa.aamain.cap.CapModel") {
		vFromASITGroup = vFromCap.getAppSpecificTableGroupModel();
		vFromASITMap = vFromASITGroup.getTablesMap();
	}

	var vToASITGroup;
	var vToASITMap;
	if (vToCap.getClass() == "class com.accela.aa.aamain.cap.CapModel") {
		vToASITGroup = vToCap.getAppSpecificTableGroupModel();
		vToASITMap = vToASITGroup.getTablesMap();
	}

	//Get To ASIT Column Names
	var vToASITColumnArry = new Array();
	var vToASITList = vToASITMap.values().iterator();
	while (vToASITList.hasNext()) {
		var vToASIT = vToASITList.next();
		var tempObject = new Array();
		var tempArray = new Array();
		var vToASITName = vToASIT.getTableName();
		if (vToASITName == vToTable) {
			//logDebug("To Table Name: " + vToASITName);

			vToASITName = String(vToASITName).replace(/[^a-zA-Z0-9]+/g, '');

			if (!isNaN(vToASITName.substring(0, 1)))
				vToASITName = "TBL" + vToASITName // prepend with TBL if it starts with a number

			var tsmcoli = vToASIT.getColumns().iterator();
			
			// cycle through columns
			while (tsmcoli.hasNext()) {
				var tcol = tsmcoli.next();
				//logDebug("To Field Column: " + tcol.getColumnName());
				vToASITColumnArry.push(tcol.getColumnName());
			}
		} 
	}	
	
	var vFromRows = new Array();

	//Get From ASIT Informaion for issued permits
	var vFromCapId = "" + vFromCap.getCapID();
if (vFromCapId) {
	vFromCapId = vFromCapId.split("-");
	vFromCapId = aa.cap.getCapID(vFromCapId[0], vFromCapId[1], vFromCapId[2]).getOutput();
}
	var vFromASIT = loadASITable(vFromTable, vFromCapId);
	var vFromTable = String(vFromTable).replace(/[^a-zA-Z0-9]+/g, '');
	if (typeof(vFromASIT) == "object" ) {
		var x = 0;
		if (vReqArry != null) {
			for (x in vFromASIT) {
				var vFromRow = vFromASIT[x]
				var y = 0;
				for (y in vFromRow) {
					var vFromColumn = y;
					var vFromFieldValue = vFromRow[y];
					if (vFromColumn == vReqArry[0] && vFromFieldValue == vReqArry[1]) {
						vFromRows.push(vFromRow);
						continue;
					}
				}
			}
		}
		else {
			vFromRows = vFromASIT;
		}
	}
	
	var z = 0;
	var tempArray = new Array();	
	for (z in vFromRows) {
		var tempObject = new Array();
		var vFromRow = vFromRows[z];
		var zz = 0;
		for (zz in vFromRow) {
			var vFromColumn = zz;
			var vFromFieldValue = vFromRow[zz];
			tempObject[vFromColumn] = vFromFieldValue;
		}
		tempArray.push(tempObject);
	}
	
	logDebug("Rows to copy: " + vFromRows.length);

	//Copy to destination ASITGroup
	tableValueArray = tempArray;
	vToASITGroup = vToCap.getAppSpecificTableGroupModel();
	return addASITable4ACAPageFlow(vToASITGroup, vToTable, tableValueArray);
}