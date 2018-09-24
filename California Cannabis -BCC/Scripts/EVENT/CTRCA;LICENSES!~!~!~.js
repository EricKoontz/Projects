// Begin functionality to set initial workflow status. This is needed for the initial status to actually exists in the WF History
// Runs the WTUA event for the initial status.
if (publicUser && !appMatch("*/*/*/Application")) {
	setInitialWorkflowTaskStatus("Y");
}
// End functionality to set inital workflow status.

// Begin Story 5135, 6083 create document conditions of approval
include("CREATE_DOCUMENT_CONDITIONS");
// End Story 5135, 6083

// Begin script to set the file date to today when an application is actually submitted.
include("UPDATE_FILE_DATE");
// End script to set the file date to today when an application is actually submitted.

//Begin user story 180, send renewal submission notification
if (appMatch("*/*/*/Renewal")) {
	setInitialWorkflowTaskStatus("Y");
}
//End user story 180