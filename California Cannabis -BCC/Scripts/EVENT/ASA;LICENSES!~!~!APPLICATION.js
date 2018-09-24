// Begin associated forms for owner data
//
// EWYLAM -- turned off associated forms on the record, so I disabled this script (JHS)
//include("DO_ASSOCIATED_FORM_OWNER_SUB");
// End associated forms for owner data

// Begin script to copy Business contact information (Business Name and Address) to record
include("SAVE_BUSINESS_INFO_TO_RECORD");
// End script to copy Business contact information (Business Name and Address) to record

//Begin script to invoice all fees and set workflow task Application Acceptance to Waiting for Payment when user Defers Payment in ACA
include("WAITING_FOR_PAYMENT");
//End script to invoice all fees and set workflow task Application Acceptance to Waiting for Payment when user Defers Payment in ACA

// Begin functionality to set initial workflow status. This is needed for the initial status to actually exists in the WF History
// Runs the WTUA event for the initial status.
setInitialWorkflowTaskStatus("Y");
// End functionality to set initial workflow status.


/*

envParams = aa.util.newHashMap();
envParams.put("CapId", capId);

aa.runAsyncScript("GISADDRESSVERIFICATIONASYNC", envParams);

*/