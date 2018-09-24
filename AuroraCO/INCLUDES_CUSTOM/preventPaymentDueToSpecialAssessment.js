
/**
 * if cap has specific status, reject the payment
 * @param rejectCapStatus capStatus to reject payment if matched
*/
function preventPaymentDueToSpecialAssessment(rejectCapStatus) {
	if (cap.getCapModel().getCapStatus() != null && cap.getCapModel().getCapStatus().equalsIgnoreCase(rejectCapStatus)) {
		cancel = true;
		showMessage = true;
		comment("This lien has been transferred to the County under Special Assessment.");
		return true;
	}
	return false;
}