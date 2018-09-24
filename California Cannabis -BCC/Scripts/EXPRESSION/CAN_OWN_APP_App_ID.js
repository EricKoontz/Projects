/*------------------------------------------------------------------------------------------------------/
| $Id:  CAN OWN APP App ID.js   2017-05-11   john.schomp $
|
| Usage   : Expression Builder Script that will validate a Cap ID
|
| Client  : BMCR
| Action# : Task 6114
|
| Notes   : Expression builder script to be used on ASI portlet.  Execute on the CAP ID field
|
/------------------------------------------------------------------------------------------------------*/

var msg = "";
var aa = expression.getScriptRoot();

var licCapID = null;
var licCap;

var licObj = expression.getValue("ASI::PARENT APPLICATION ID::Application ID");
var thisForm = expression.getValue("ASI::FORM");
var licNum = trim(licObj.value);

// only blocked if there is data.   associated forms will not have data - removed defect 1596
// if (licNum && licNum != "") {
licCapID = aa.cap.getCapID(licNum).getOutput();
licCap = aa.cap.getCap(licCapID).getOutput();

if (!licCapID) {
	msg = "Invalid License Application, please try again";
	thisForm.blockSubmit = true;
} else {
	if (!appMatch("Licenses/*/*/Application", licCapID)) {
		msg = "Invalid License Application, please try again";
		thisForm.blockSubmit = true;
	} else {
		if (licNum.substr(2, 3).equals("TMP") || licNum.substr(2, 3).equals("EST")) {
			msg = "The License Application has not yet been submitted";
			thisForm.blockSubmit = true;
		} else if (!("Awaiting Owner Submittals".equals(taskStatus("Application Acceptance",licCapID)))) {
			msg = "The License Application is not awaiting owner submittals";
			thisForm.blockSubmit = true;			
		}
		else {
			msg = "Application ID Verified, Type: " + aa.cap.getCap(licCapID).getOutput().getCapType().getAlias();
			thisForm.blockSubmit = false;
		}
	}

}
//}

licObj.message = msg;
expression.setReturn(licObj);
expression.setReturn(thisForm);

function appMatch(ats, matchCapId) // optional capId or CapID string
{
	if (!matchCapId) {
		return false;
	}

	matchCap = aa.cap.getCap(matchCapId).getOutput();

	if (!matchCap) {
		return false;
	}

	matchArray = matchCap.getCapType().toString().split("/");

	var isMatch = true;
	var ata = ats.split("/");
	for (xx in ata)
		if (!ata[xx].equals(matchArray[xx]) && !ata[xx].equals("*"))
			isMatch = false;

	return isMatch;
}

function trim(strText) {
	return (String(strText).replace(/^\s+|\s+$/g, ''));
}


function taskStatus(wfstr) // optional process name and capID
{
	var useProcess = false;
	var processName = "";
	var itemCap = capId;
	if (arguments.length >= 2) {
		processName = arguments[1]; // subprocess
		if (processName)
			useProcess = true;
	}

	if (arguments.length == 3)
		itemCap = arguments[2]; // use cap ID specified in args


	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
			return fTask.getDisposition()
	}
}