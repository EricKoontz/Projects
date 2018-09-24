// Begin script to copy Business Owner to application record
include("COPY_BUSINESS_OWNER_TO_APP");
// End script to copy Business Owner to application record

// Begin script to update application workflow if all owners submitted
include("SET_APP_RECIEVED_OWNER_SUBMITTALS_MATCH_ASIT");
// End script to update application workflow if all owners submitted

// Begin script to set 'Awaiting Review'. Runs the WTUA event for Initial Review - Awaiting Review
include('AWAITING_REVIEW');
// End script to set 'Awaiting Review'.

if (wfStatus.equals("Additional Info Requested")){
	// Begin Story 293, 1370
	include("SEND_INCOMPLETE_APPLICATION_NOTICE");
	// End Story 293, 1370
}
