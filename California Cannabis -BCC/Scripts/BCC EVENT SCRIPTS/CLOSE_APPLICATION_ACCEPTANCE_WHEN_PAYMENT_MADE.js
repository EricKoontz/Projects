// Begin script to close Application Acceptance Task once fees are paid - WTUA Temp EVENT
if (wfTask == "Application Acceptance" && wfStatus == "Submitted" && balanceDue == 0) {
	closeTask("Application Acceptance", "Application Received", "Updated by CLOSE_APPLICATION_ACCEPTANCE_WHEN_PAYMENT_MADE", "CLOSE_APPLICATION_ACCEPTANCE_WHEN_PAYMENT_MADE");

}
// End script to close Application Acceptance Task once fees are paid - WTUA Temp EVENT
