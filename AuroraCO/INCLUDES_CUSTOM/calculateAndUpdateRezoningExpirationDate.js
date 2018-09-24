
/**
 * check wfTask and status, if matched asiField value is updated (now + expireAfterYears)
 * @param workFlowTask
 * @param workflowStatusArray
 * @param asiFieldName
 * @param expireAfterYears number of years to add to NOW date
 * @returns {Boolean}
 */
function calculateAndUpdateRezoningExpirationDate(workFlowTask, workflowStatusArray, asiFieldName, expireAfterYears) {

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

		var newExpDate = new Date();
		newExpDate = dateAddMonths(newExpDate, (expireAfterYears * 12));

		var olduseAppSpecificGroupName = useAppSpecificGroupName;
		useAppSpecificGroupName = false;
		editAppSpecific(asiFieldName, newExpDate);
		useAppSpecificGroupName = olduseAppSpecificGroupName;
	} else {
		return false;
	}
	return true;
}