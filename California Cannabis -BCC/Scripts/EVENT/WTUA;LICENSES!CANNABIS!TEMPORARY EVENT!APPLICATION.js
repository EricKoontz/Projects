// Start script to update Issuance task with Issued status for Temp Event Applications
include("SET_TEMP_EVENT_ISSUED");
// End script to update Issuance task with Issued status for Temp Event Applications

// Start script to update Application Acceptance task
include("CLOSE_APPLICATION_ACCEPTANCE_WHEN_PAYMENT_MADE");
// End script to update Application Acceptance task