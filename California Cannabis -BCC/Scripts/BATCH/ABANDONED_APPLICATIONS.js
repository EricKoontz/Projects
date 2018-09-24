/*------------------------------------------------------------------------------------------------------/
| Program: ABANDONED_APPLICATIONS
| Client:  State of CA DCA - BCC
|
| Version 1.0 - Base Version. 
|
| 
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = true;	
var showMessage = false;
var message = "";
var maxSeconds = 4.5 * 60;
var br = "<br>";
var currentUserID = "ADMIN";
var debug = "";
var reviewTask = "Initial Review";
var supervisorReviewTask = "Supervisory Review";
var deficiencyStatus = "Additional Info Requested";
var abandonStatus = "Abandoned";


SCRIPT_VERSION = 3.0
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();

batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_CUSTOM_GLOBALS"));


function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
	return emseScript.getScriptText() + "";
}

batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var useAppSpecificGroupName = false;
var showDebug = true;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var today = new Date();
var startTime = today.getTime();
today.setHours(0); today.setMinutes(0); today.setSeconds(0); today.setMilliseconds(0);
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess(reviewTask);
mainProcess(supervisorReviewTask);

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (showDebug) {
	aa.print(debug);
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess(t) {
	var capCount = 0;
	var appList = new Array();

	logDebug("Retrieving applications with active task = " + t);
	logDebug("********************************");

	//Setup the workflow task criteria
	var taskItemScriptModel = aa.workflow.getTaskItemScriptModel().getOutput();
	taskItemScriptModel.setActiveFlag("Y");
	taskItemScriptModel.setCompleteFlag("N");
	taskItemScriptModel.setTaskDescription(t);

	//Setup the cap type criteria
	var capTypeScriptModel = aa.workflow.getCapTypeScriptModel().getOutput();
	capTypeScriptModel.setCategory("Application");
	capTypeScriptModel.setGroup("Licenses");

	var appListResult = aa.workflow.getCapIdsByCriteria(taskItemScriptModel, null,null, capTypeScriptModel, null);
	if (appListResult.getSuccess()) {
		appList = appListResult.getOutput();
	}
	else {
		logDebug("ERROR: Getting Applications, reason is: " + appListResult.getErrorType() + ":" + appListResult.getErrorMessage());
		return false;
	}
		
	if (appList.length > 0) {
		logDebug("Processing " + appList.length + " application records");
	} else {
		logDebug("No applications returned"); 
		return false;
	}

	logDebug("********************************");

	/*------------------------------------------------------------------------------------------------------/
	|  Loop through the list of applications
	/------------------------------------------------------------------------------------------------------*/
	
	for (al in appList) {

		capId = aa.cap.getCapID(appList[al].getCapID().getID1(),appList[al].getCapID().getID2(),appList[al].getCapID().getID3()).getOutput();
		capIDString = capId.getCustomID();
		logDebug(capIDString);
		firstDef = getDateOfFirstDeficiency(capId);
		if (firstDef) {
			logDebug("Found a First Deficiency Date of " + firstDef);
			// add one year for comparison.  comment out for testing.
			firstDef.setFullYear(firstDef.getFullYear()+1);
			logDebug("comparing " + firstDef + " to " + today);
			if (firstDef.getTime() < today.getTime()) {
				logDebug("Abandoning the application");
				taskCloseAllExcept(abandonStatus,"Batch Job " + batchJobName + " Job ID " + batchJobID);
				updateAppStatus(abandonStatus,"Batch Job " + batchJobName + " Job ID " + batchJobID);
				capCount++;
			}
		}
	} 
	
	logDebug("********************************");
 	logDebug("Total CAPS qualified criteria: " + appList.length);
 	logDebug("Total CAPS processed: " + capCount);
 	
 }
 
 function getDateOfFirstDeficiency(c) {
	var theDate;
	var r = aa.workflow.getHistory(c);
	if (r.getSuccess()) {
		var wh = r.getOutput();
		for (var i in wh) {

		fTask = wh[i];
			var t = fTask.getTaskDescription();
			var s = fTask.getDisposition();
			var d = fTask.getStatusDate();
			if ((t.equals(reviewTask) || t.equals(supervisorReviewTask)) && s.equals(deficiencyStatus)) {
				logDebug(new Date(d.getTime()));
				var theDate = new Date(d.getTime());
				}
			}
	}
	return theDate;
}
 