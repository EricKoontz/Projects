// Begin script to do application submittal actions
//if ((publicUser && wfTask == "Application Acceptance" && wfStatus == "Submitted") || (!publicUser && wfTask == "Application Acceptance" && wfStatus == "Submitted" && balanceDue == 0)) {
if (!appMatch("Licenses/Cannabis/Temporary Event/Application")) {
	if (wfTask == "Application Acceptance" && wfStatus == "Submitted" && balanceDue == 0 && businessOwnersMatchASIT(capId) == false) {
		// ACA submittal, set to Awaiting Owner Submittals
		var vProcessID = getProcessID("Application Acceptance", capId);
		var vProcessCode = getProcessCode("Application Acceptance", capId);
		var vTaskStepNum;
		vTaskStepNum = getTaskStepNumber(vProcessCode, "Application Acceptance", capId);
		resultWorkflowTask("Application Acceptance", "Awaiting Owner Submittals", "Update by DO_APPLICATION_SUBMITTED_ACTIONS", "Update by DO_APPLICATION_SUBMITTED_ACTIONS");
		runWTUAForWFTaskWFStatus("Application Acceptance", vProcessID, vTaskStepNum, "Awaiting Owner Submittals", capId);
	}
	// End script to do application submittal actions

	// Begin script to set 'Awaiting Data Entry' for back office submittals.
	if (wfTask == "Application Acceptance" && wfStatus == "Submitted" && balanceDue == 0 && businessOwnersMatchASIT(capId) == true) {
		var vProcessID = getProcessID("Application Acceptance", capId);
		var vProcessCode = getProcessCode("Application Acceptance", capId);
		var vTaskStepNum;
		vTaskStepNum = getTaskStepNumber(vProcessCode, "Application Acceptance", capId);
		resultWorkflowTask("Application Acceptance", "Awaiting Data Entry", "Update by DO_APPLICATION_SUBMITTED_ACTIONS", "Update by DO_APPLICATION_SUBMITTED_ACTIONS");
		runWTUAForWFTaskWFStatus("Application Acceptance", vProcessID, vTaskStepNum, "Awaiting Data Entry", capId);
	}
	// End script to set 'Awaiting Data Entry' for back office submittals
}
