
/**
 * this function to update work flow task due date
 * @param workFlowTasktobeChecked status to be checked 
 * @param numberOfdayes number of days 
 */
function UpdateworkFlowTaskDueDate(workFlowTasktobeChecked, numberOfdayes) {
	if (wfStatus == workFlowTasktobeChecked) {
		var FormateddueDate = wfDue.getDayOfMonth() + "/" + wfDue.getMonth() + "/" + wfDue.getYear();
		editTaskDueDate(wfTask, getCalculatedDate(FormateddueDate, numberOfdayes));
	}

}