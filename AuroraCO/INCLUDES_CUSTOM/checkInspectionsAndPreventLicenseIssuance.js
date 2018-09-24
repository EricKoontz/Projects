function checkInspectionsAndPreventLicenseIssuance(workFlowTask, workflowStatusArray) {

	if (wfTask == workFlowTask) {

		var statusMatch = false;

		for (s in workflowStatusArray) {
			if (wfStatus == workflowStatusArray[s]) {
				statusMatch = true;
				break;
			}
		}//for all status options

		if (!statusMatch) {
			return false;
		}

		if (!allInspectionsCompleted(capId)) {
			cancel = true;
			showMessage = true;
			comment("All Inspections not done so can not Issue License");
			return true;
		}
		return false;
	} else {
		return false;
	}
}
