// Begin script to do application submittal actions. Runs the WTUA event for Application Acceptance - Awaiting Owner Submittals
// Begin script to set 'Awaiting Data Entry' for back office submittals.
include("DO_APPLICATION_SUBMITTED_ACTIONS");
// End script to do application submittal actions. Runs the WTUA event for Application Acceptance - Awaiting Owner Submittals
// End script to set 'Awaiting Data Entry' for back office submittals.

// Begin script to actiave the Initial Review Task
include("ACTIVATE_INITIAL_REVIEW");
// End script to actiave the Initial Review Task

if (wfStatus.equals("Additional Info Requested")){
	// Begin Story 293, 1370
	include("SEND_INCOMPLETE_APPLICATION_NOTICE");
	// End Story 293, 1370
}

//if (wfStatus.equals("Temporarily Approved")){
	// Begin Story 1557, removed Story 2302
	//include("SEND_TEMP_LICENSE_INCOMPLETE_NOTICE");
	//End Story 1557, removed Story 2302

// Begin script to send denial email
if (wfStatus.equals("Denied")){
	// Begin Story 181
	include("SEND_DENIED_NOTICE");
	// End Story 181
}
// End script to send denial email

// Begin script to send temporary denial notice - Story 1804
include("SEND_TEMP_DENIED_NOTICE");
// End script to send temporary denial notice

// Begin Story 323
include("SEND_FEES_DUE_NOTICE");
// End Story 323

// Begin Story 298 - ETW Removed per Ean 12/18/17
//include("SEND_NEW_INFO_NOTICE");
// End Story 298

if (wfTask.equals("Application Acceptance") && wfStatus.equals("Application Received")) {
	// Begin Story 5135, 6083
	include("CREATE_DOCUMENT_CONDITIONS");
	// End Story 5135, 6083
}

//Begin script to send email to all owners in the Owner table
include("SEND_OWNER_EMAILS");
//End script to send email to all owners in the Owner table

// Begin script to set 'Awaiting Review'. Runs the WTUA event for Initial Review - Awaiting Review
include('AWAITING_REVIEW');
// End script to set 'Awaiting Review'.

//Start - License Creation/Update Script
include("CREATE_LICENSE_RECORD");
//End - License Creation/Update Script

//Begin email to all contacts when application is submitted in back office. Email is to let them know the application number and fee amount due, User Story 1625
include("SEND_APP_FEE_ACKNOWLEDGEMENT");
//End email to all contacts when application is submitted in back office. Email is to let them know the application number and fee amount due, User Story 1625

// Begin script to update the Supervisor Review to In Process when initial review is approved
include("SET_IN_PROCESS");
// End script to update the Supervisor Review to In Process when initial review is approved

//Begin script to close the Application Acceptance task when Initial Interview is Closed,2770
include("CLOSE_APP_WORKFLOW_ON_CLOSED");
//End script to close the Application Acceptance task when Initial Interview is Closed, 2770