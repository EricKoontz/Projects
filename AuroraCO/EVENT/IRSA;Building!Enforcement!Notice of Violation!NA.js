var $iTrc = ifTracer;

if(inspType == "Notice of Violation Inspection"){
    //Script 332
    //processNotOfViolInsp(inspectionType to check for, Inspection result to check for, createNewInspection, updateworflow, task2update, status2updateto);
    processNotOfViolInsp("Notice of Violation Inspection", "First Notice", true, "Notice of Violation Inspection", true, "Notice of Violation", "First Notice");
    processNotOfViolInsp("Notice of Violation Inspection", "Second Notice", true, "Notice of Violation Inspection", true, "Notice of Violation", "Second Notice");
    processNotOfViolInsp("Notice of Violation Inspection", "Third Notice", true, "Notice of Violation Inspection", true, "Notice of Violation", "Third Notice");
    
    if(inspResult == "Compliance"){
        var wfTsk2Update = "Notice of Violation", wfSt2Update = "Compliance";
        if(!isTaskActive(wfTsk2Update))
            activateTask(wfTsk2Update);
		
		resultWorkflowTask(wfTsk2Update, wfSt2Update);
		
        updateAppStatus("Closed", "Updated via IRSA");
        var wfProcess = getWfProcessCodeByCapId(capId);
        logDebug("Record is Closed.  Closing all active tasks for process code: " + wfProcess);
        if(wfProcess) deactivateActiveTasks(wfProcess);
    }
    
    if(inspResult == "Issue Summons"){
        closeTask("Notice of Violation", "Issue Summons", "via Script 332", "via Script 332");
        activateTask("Pre Hearing Inspection");
    }
    //Script 332 end
}


if(inspType == "Investigation"){
    //Script 331 Begin
      //331a
    if(inspResult == "Reassign to another Division"){
        closeTask("Investigation", "Reassign to another Division", "Closed via 331", "Closed via 331");
        updateAppStatus("Closed", "Updated via IRSA 331");
        closeAllTasks(capId, "");
    }
      //331b
    if(inspResult == "No Violation Observed"){
        closeTask("Investigation", "No Violation Observed", "Closed vis 331", "Closed via 331");
        updateAppStatus("Closed", "Updated via IRSA 331");
        closeAllTasks(capId, "");
    }
      //331c
    processNotOfViolInsp("Investigation", "In Progress", true, "Investigation", true, "Investigation", "In Progress");
      //331d
    processNotOfViolInsp("Investigation", "Notice of Violation", true, "Notice of Violation Inspection", true, "Investigation", "Notice of Violation");
    //Script 331 End
}