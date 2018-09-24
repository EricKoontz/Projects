/**
 * check and throw an exception if balance = 0
 */
function checkInvoiced() {
	var TASK_NAME = "Completeness Check";
	var TASK_STATUS = "Ready to Pay";

	if (wfTask == TASK_NAME && wfStatus == TASK_STATUS) {
		var myBalance = feeBalance("");// no fee sched passed, method will get all
		if (myBalance == 0) {
			cancel = true;
			showMessage = true;
			comment("Please apply fees and invoice to update status.");
		}
	}
}
