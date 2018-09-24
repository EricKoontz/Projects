// Insert the public user reference contact as the owner applicant
include("COPY_PUBLIC_USER_TO_OWNER_APPLICANT");

// Begin script to set the Owner Applicant information in the Owners ASIT to Read Only.
include("SET_OWNER_APPLICANT_OWNER_TABLE_READ_ONLY");
// End script to set the Owner Applicant information in the Owners ASIT to Read Only.

// Begin script to copy Business contact information (Business Name and Address) to record
include("SAVE_BUSINESS_INFO_TO_RECORD");
// End script to copy Business contact information (Business Name and Address) to record

//Begin script to invoice all fees and set workflow task Application Acceptance to Waiting for Payment when user Defers Payment in ACA
include("WAITING_FOR_PAYMENT");
//End script to invoice all fees and set workflow task Application Acceptance to Waiting for Payment when user Defers Payment in ACA

// Begin functionality to set initial workflow status. This is needed for the initial status to actually exists in the WF History
// Runs the WTUA event for the initial status.
if (publicUser) {
	setInitialWorkflowTaskStatus("Y");
}
// End functionality to set inital workflow status.