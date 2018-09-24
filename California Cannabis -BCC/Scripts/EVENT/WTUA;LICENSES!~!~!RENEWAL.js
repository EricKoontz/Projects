// Begin script to send renewal denial email
if (wfStatus.equals("Denied")){
	// Begin Story 179
	include("SEND_RENEWAL_DENIED_NOTICE");
	// End Story 179
}

//Begin script to send renewal submission notification
if (wfStatus.equals("Submitted")){
	// Begin Story 180
	include("SEND_RENEWAL_SUBMIT_NOTICE");
	// End Story 180
}

// Begin script to send fees due notice
include("SEND_FEES_DUE_NOTICE");
// End script to send fees due notice


// Begin script to update the Supervisor Review to In Process when initial review is approved
include("SET_IN_PROCESS");
// End script to update the Supervisor Review to In Process when initial review is approved

// Begin script to complete the renewal and send notifications
include("COMPLETE_RENEWAL");
// End script to complete the renewal and send notifications
