
/**
 * check wfTask and wfStatus match, and check if no invoiced fees, block submit
 * @param workFlowTask
 * @param workflowStatusArray
 * @returns {Boolean}
 */
function checkApplicatoinSubmittalRequiredFees(workFlowTask, workflowStatusArray) {

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

		if (!hasInvoicedFees(capId, "")) {
			cancel = true;
			showMessage = true;
			comment("Fees must be added and Invoiced to Accept the Application Submittal");
			return true;
		}
		return false;
	} else {
		return false;
	}
}
