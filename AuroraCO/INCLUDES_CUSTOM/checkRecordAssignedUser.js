/**
 * this function will check the current work flow task if the task  Assign Complaint or Assign Inspection
 * and the status is Complete will check the record assigned user if null will stop the update of the task.
 */
function checkRecordAssignedUser() {
	var checkTask = "Assign Complaint";
	var checkTask2 = "Assign Inspection";
	var checkStatus = "Complete";
	if ((wfTask == checkTask || wfTask == checkTask2) && wfStatus == checkStatus) {
		var capAssignedUser = aa.cap.getCapDetail(capId).getOutput().getCapDetailModel().getAsgnStaff();
		if (capAssignedUser == "" || capAssignedUser == null) {
			showMessage = true;
			cancel = true;
			comment("Fire Case requires Assigned user in Record detail");
		}
	}
}
