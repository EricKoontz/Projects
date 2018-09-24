// Begin script to update temp license with new expiration date
include("UPDATE_TEMP_LIC_FROM_EXTENSION")
// END script to update temp license with new expiration date

// Begin script to send 90 Day Extension Email
if (wfStatus.equals("90-Day Extension Issued")){
	// Begin Story 1536
	include("SEND_TEMP_90DAY_EXTENSION");
}
	// End Story 1536