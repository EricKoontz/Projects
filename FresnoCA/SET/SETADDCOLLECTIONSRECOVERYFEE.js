/*------------------------------------------------------------------------------------------------------/
 |
 | Program : SETADDCOLLECTIONSRECOVERYFEE.js
 | Event   : Cap Set Script
 |
 | Usage   : For use with the cap set script functionality available in 6.5.0 and later.
 |
 | Client  : N/A
 | Action# : N/A
 |
 | Notes   :
 | Description: When the Set with the Set Type of 'COLLECTIONS' is updated to a status of 'Assign Fee'
 |              add the Collections Recovery Fee (ENF_GEN_24) to all Set Members (records in the set).
 |              For each record the fee is calculated at 27% of the remaining balance for that record.
 |              Fee should be automatically invoiced.
 |
 |
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
 | BEGIN Initialize Variables
/------------------------------------------------------------------------------------------------------*/
var debug = "";
var br = "<BR>";
var message = "";
var x = 01;

/*------------------------------------------------------------------------------------------------------/
 | END Initialize Variables
 /------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0;
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
/*------------------------------------------------------------------------------------------------------/
| END Includes
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
 | <===========Main=Loop================>
 |
 /-----------------------------------------------------------------------------------------------------*/
var SetId = aa.env.getValue("SetID");
ScriptName =  aa.env.getValue("ScriptName");
logDebug("Start of Job");
logDebug("Processing Set: " + SetId);
var startTime = startDate.getTime();
var emailText = "";

var success=false;
showDebug=true;
success = mainProcess();

if(success)
{
    logDebug("Job completed successfully.");
}
else
{
    logDebug("Job failed, see log.");
}

logDebug("End of Job: Elapsed Time : " + elapsed(startTime) + " Seconds");

emailText = "Set Script Executed: " + ScriptName + "<br>" + emailText;

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess(){
    var capCount = 0;
    var set = aa.set.getSetByPK(SetId).getOutput();
    var setStatus = set.getSetStatus();
    var SetMemberArray = aa.env.getValue("SetMemberArray");

    if(setStatus == "Assign Fee"){
        var setDetailScriptModel = aa.set.getSetDetailsScriptModel().getOutput();
        setDetailScriptModel.setSetID(SetId);
        var memberList = aa.set.getSetMembers(setDetailScriptModel).getOutput();
        logDebug("INFO: Number of records in Set: " + memberList.size() + ".");
        emailText += "INFO: Number of records in Set: " + memberList.size() + ".";

        // for each individual record add the appropriate document
        for(var index = 0; index < memberList.size(); index ++)
        {
            var setMember = memberList.get(index);
            var capId = null;
            var altID = " ";
            var cap = null;
            var capIdObj = aa.cap.getCapID(setMember.getID1(), setMember.getID2(), setMember.getID3());

            if(capIdObj.getSuccess())
            {
                capId = capIdObj.getOutput();
                capId = aa.cap.getCapID(capId.getID1(), capId.getID2(), capId.getID3()).getOutput();
                altID = capId.getCustomID();
                cap = aa.cap.getCap(capId).getOutput();
                appTypeString = cap.getCapType().toString();
                appTypeArray = appTypeString.split("/");

                if(appTypeArray[0] == "Enforcement" && matches(appTypeArray[1], "General Enforcement", "Weed Abatement", "Demolition")){
                    var balance = feeBalanceCustom("", capId);
                    //if balance is a number
                    if(!isNaN(balance)){
                        //calcualte fee and add it.
                        feeAmt = parseFloat(balance) * 0.27;
                        if(feeAmt > 0){
							message+= altID + ": adding fee" + br;
                            addFee("ENF_GEN_24", "ENF_GENERAL", "FINAL", feeAmt, "Y", capId);
						}
                    }
                }
                else{
                    message+= altID + " is not General Enforcement, Weed Abatement or Demolion. Fee was not added."
                }
            }
        }
    }
    else{
        logDebug("Set must be in the 'Assign Fee' status");
		message += "Set must be in the 'Assign Fee' status" + br;
        return true;
    }

    aa.env.setValue("ScriptReturnCode","0");
    aa.env.setValue("ScriptReturnMessage", message);

    return true;
}

function elapsed(stTime) {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - stTime) / 1000)
}


function feeBalanceCustom(feestr, capId) {
    // Searches payment fee items and returns the unpaid balance of a fee item
    // Sums fee items if more than one exists.  Optional second parameter fee schedule
    var amtFee = 0;
    var amtPaid = 0;
    var feeSch;

    if (arguments.length == 3)
        feeSch = arguments[2];

    var feeResult = aa.fee.getFeeItems(capId, feestr, null);
    if (feeResult.getSuccess()) {
        var feeObjArr = feeResult.getOutput();
    } else {
        logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
        return false
    }

    for (ff in feeObjArr)
        if (feeObjArr[ff].getFeeitemStatus() == "INVOICED" && (!feestr || feestr.equals(feeObjArr[ff].getFeeCod())) && (!feeSch || feeSch.equals(feeObjArr[ff].getF4FeeItemModel().getFeeSchudle()))) {
            amtFee += feeObjArr[ff].getFee();
            var pfResult = aa.finance.getPaymentFeeItems(capId, null);
            if (pfResult.getSuccess()) {
                var pfObj = pfResult.getOutput();
                for (ij in pfObj)
                    if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
                        amtPaid += pfObj[ij].getFeeAllocation()
            }
        }
    return amtFee - amtPaid;
}