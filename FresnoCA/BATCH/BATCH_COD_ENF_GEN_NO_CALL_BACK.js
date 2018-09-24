/* -------------------------------------------------------------------------------------------------
| Program  : BATCH_COD_ENF_GEN_NO_CALL_BACK
| Trigger  : Batch
| Client   : City of Fresno
| Script ID: 182
| Frequency: Daily
| 
| Desc: The batch script will check General Enforcement records in Notice Sent Status.
|       When the Workflow status has been on the Courtesy Notice Sent status for 18 days,
|       update the workflow to No Call Back, with Record Status of Closed. 
|
| Batch Requirements :
| - None
| Batch Options:
| - None
|
|
| ------------------------------------------------------------------------------------------------------ */
var SCRIPT_VERSION = 3.0;

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
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

var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
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
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useCustomScriptFile));
    eval(getScriptText(SAScript, SA));
} else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));

var sysDate = aa.date.getCurrentDate();
// Global variables
var batchStartDate = new Date();
// System Date
var batchStartTime = batchStartDate.getTime();
var startTime = batchStartTime;
// Start timer
var timeExpired = false;

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var runDate = new Date();
var appGroup = "Enforcement";
var appTypeType = "General Enforcement";
var appSubtype = "NA";
var appCategory = "NA";
var appStatus = "Notice Sent";

var emptyCm1 = aa.cap.getCapModel().getOutput();
var emptyCt1 = emptyCm1.getCapType();
emptyCt1.setGroup(appGroup);
emptyCt1.setType(appTypeType);
emptyCt1.setSubType(appSubtype);
emptyCt1.setCategory(appCategory);
emptyCm1.setCapType(emptyCt1);
emptyCm1.setCapStatus(appStatus);
var capModel = emptyCm1;
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/


/* ------------------------------------------------------------------------------------------------------ /
| main
/ ------------------------------------------------------------------------------------------------------ */
var capId;
var altId;
var thisCapObj;
var currentDate = aa.date.parseDate((new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear());
var enfRecsResult;
var enfRecs;
var totalUpdates = 0;
var emptyGISArray = new Array();
var taskArr = new Array();
var eighteenDaysAgo = dateAdd(null, -18);
//eighteenDaysAgo = dateAdd(null, -3); //For testing, hard code the date required.
var noticeSentLastStatus = false;
var noticeSent18ago = false;
var noticeSentDate = null;
var maxDate = null;
var taskDate = null;

try {
    aa.print("Batch started on " + new Date() + br);
    aa.print("18 Days ago: " + eighteenDaysAgo + br);
    //Get all records with status of "Notice Sent"
    enfRecsResult = aa.cap.getCapListByCollection(capModel, null, null, null, null, null, emptyGISArray);

    if (enfRecsResult.getSuccess()) {
        enfRecs = enfRecsResult.getOutput();

        if (enfRecs) {
            //Iterate through each record
            for (idx in enfRecs) {
                currRec = enfRecs[idx]
                capId = currRec.capID;
                altId = capId.getCustomID();
                noticeSent18ago = false;

                thisCapObj = aa.cap.getCap(capId).getOutput();
                capClass = thisCapObj.getCapClass();
                capType = thisCapObj.getCapType();
                
                var workflowResult = aa.workflow.getTasks(capId);
                if (workflowResult.getSuccess())
                    wfObj = workflowResult.getOutput();
                else
                    { aa.print("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); }
            
                //Get Workflow items
                for (i in wfObj)
                {
                    fTask = wfObj[i];
                    var taskName = fTask.getTaskDescription();
                    var taskStatus = fTask.getDisposition();
                    var statusDate = fTask.getStatusDate();
                    var statusDateString = "";
                    if(statusDate == null) 
                        continue;
                    
                    statusDateString = "" + (fTask.getStatusDate().getMonth() + 1) + "/" + fTask.getStatusDate().getDate() + "/" + (fTask.getStatusDate().getYear() + 1900);
                    
                    //If workflow task is Case Intake/Courtesy Notice Sent and was set to 18 days go
                    if(taskName == "Case Intake" && taskStatus == "Courtesy Notice Sent" && statusDateString == eighteenDaysAgo){
                        
                        noticeSentDate = statusDate;
                        noticeSent18ago = true;
                        break;
                        
                    }
                }
                
                //If notice was sent 18 days ago, close task with No Call Back.
                if(noticeSent18ago){
                    aa.print("Updating record " + altId + br);
                    closeTask("Case Intake", "No Call Back", "Updated via batch job EnfGenNoCallBack", "Updated via batch job EnfGenNoCallBack", "ENF_GEN");
                    totalUpdates++;
                }
            }
        }
    }
    else
        aa.print("****ERROR getting the enforcement records. " + enfRecsResult.getErrorMessage() + br);

    aa.print("_______________________________________________________________________________" + br);
    aa.print("Total enforcement records updated to No Call Back and closed: " + totalUpdates + br);
    aa.print("Run Time: " + elapsed() + br);
    aa.print("_______________________________________________________________________________" + br);
}
catch (err) {
    aa.print("ERROR on batch BATCH_COD_ENF_DAILY_FEE_CALC: " + err);
}
/* ------------------------------------------------------------------------------------------------------ /
| Internal Functions and Classes (Used by this script)
/ ------------------------------------------------------------------------------------------------------ */

function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - batchStartTime) / 1000)
}

function updateTask(wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
    var useProcess = false;
    var processName = "";
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }
    var itemCap = capId;
    if (arguments.length == 6)
        itemCap = arguments[5]; // use cap ID specified in args

    var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }

    if (!wfstat)
        wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
            var dispositionDate = aa.date.getCurrentDate();
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            if (useProcess)
                aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
            else
                aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
            logMessage("Updating Workflow Task " + wfstr + " with status " + wfstat);
            logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
        }
    }
}