/**
 * Update workflow, create new inspection
 * @param (String) iType: inspection type to check for 
 * @param (String) iResult: inspection result to check for
 * @param (String) newInsp: new Inspection to create. if null it will not create a new inspection
 * @param (String or number) newInspDateOrDays: A custom field used to create the inspection on the given date or number of days ahead
 * @param (boolean) carryOverFailedCheckList: Carry over the failed Checklist items to the new inspection
 * @param (String) wfTsk: workflow task to update
 * @param (String) wfSts: workflow task status to update wfTsk to
 * @returns {void}
 */
function enfProcessInspResult(iType, iResult, newInsp, newInspDateOrDays, carryOverFailedCheckList, wfTsk, wfSts){
    logDebug("enfProcessInspResult() started");
    try{
        var $iTrc = ifTracer;
        if($iTrc(inspType == iType && iResult == inspResult, 'inspType/inspResult matches')){
            //If newInsp is valid, then try to create inspection
            if($iTrc(newInsp, 'create new inspection')){
                //Get the custom field value
                var custField = null;
                var currDate = aa.util.parseDate(dateAdd(null, 0));
                var numOfDays4Insp = 1; //If unable to parse the custom field, then default inspection to one day ahead.
                if($iTrc(!isNaN(newInspDateOrDays), 'newInspDateOrDays is a number, use this as inspection days'))
                    numOfDays4Insp = parseInt(newInspDateOrDays);
                else if($iTrc(newInspDateOrDays.equalsIgnoreCase("nextWorkDay"), 'nextWorkDay == ' + newInspDateOrDays)){
                    var nextWorkDayDate = dateAddHC2(null, 1, true);
                    numOfDays4Insp = days_between(currDate, aa.util.parseDate(nextWorkDayDate));
                }
                else custField = AInfo[newInspDateOrDays];
                //If the custom field value is valid, then try to parse it to get the number of days
                if($iTrc(custField, custField)){
                    //If custom field is not a number, then it's date, use it to calculat the number of days between today and the date
                    if($iTrc(isNaN(custField), 'custom field ' + newInspDateOrDays + ' is not a number'))
                        numOfDays4Insp = days_between(currDate, aa.util.parseDate(custField));
                    else //the custom field is a number
                        numOfDays4Insp = parseInt(custField);
                }
                
                var nextWD = nextWorkDay(dateAdd(null, numOfDays4Insp - 1));
                numOfDays4Insp = days_between(currDate, aa.util.parseDate(nextWD));
                
                var newInspId = scheduleInspectionCustom(newInsp, numOfDays4Insp);
                autoAssignInspection(newInspId)
                if($iTrc(carryOverFailedCheckList && newInspId, 'copy failed checklist items to inspId: ' + newInspId)) {
                    if($iTrc(inspType == "Snow Initial Inspection" && inspResult == "Skip to Summons"))
                        copyCheckListByItemStatus(inspId, newInspId, ["Summons"]);
                    else if($iTrc(inspType == "Snow Initial Inspection" && inspResult == "Skip to City Abatement"))
                        copyCheckListByItemStatus(inspId, newInspId, ["Abate"]);
                    else
                        copyFailedGSItems(inspId, newInspId);
                }
            }
            
            //If workflow task and task status are passed on the parameter, do the update here
            if($iTrc(wfTsk && wfSts, wfTsk + ' && ' + wfSts)){
                if(!isTaskActive(wfTsk)) activateTask(wfTsk);
                
                resultWorkflowTask(wfTsk, wfSts, "Updated via enfProcessInspResult()", "Updated via enfProcessInspResult()");
            }
            
            var irComment = "";
			if(vEventName == "InspectionResultModifyAfter") irComment = inspResultComment;
			else irComment = inspComment
			
            //Add a cap comment to the record
            //Get inspector from inspection
            var inspector = getInspectorByInspID(inspId) == false ? "" : getInspectorByInspID(inspId);
            //Prepare comment text
            var vComment = inspector + " - " + inspResult + " - " + (irComment == null ? "" : irComment);
            var comDate = aa.date.parseDate(inspResultDate);
            var capCommentScriptModel = aa.cap.createCapCommentScriptModel();
            capCommentScriptModel.setCapIDModel(capId);
            capCommentScriptModel.setCommentType("APP LEVEL COMMENT");
            capCommentScriptModel.setSynopsis("");
            capCommentScriptModel.setText(vComment);
            capCommentScriptModel.setAuditUser(currentUserID);
            capCommentScriptModel.setAuditStatus("A");
            capCommentScriptModel.setAuditDate(comDate);
            var capCommentModel = capCommentScriptModel.getCapCommentModel();
            capCommentModel.setDisplayOnInsp("Y"); //Set Apply to Inspection to yes
            aa.cap.createCapComment(capCommentModel);
            logDebug("Comment Added");
        }
    }
    catch(err){
        showMessage = true;
        comment("Error on custom function enfProcessInspResult(). Please contact administrator. Err: " + err + ". Line: " + err.lineNumber);
        logDebug("Error on custom function enfProcessInspResult(). Please contact administrator. Err: " + err + ". Line: " + err.lineNumber + ". Stack: " + err.stack);
    }
    logDebug("enfProcessInspResult() ended");
}//END enfProcessInspResult()