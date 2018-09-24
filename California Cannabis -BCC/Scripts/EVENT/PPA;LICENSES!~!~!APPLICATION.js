// Begin script to move workflow task Issuance to Issued, Temporarily Issued, or Provisionally Issued once payment has been recieved. Runs thr WTUA event for the given type of issuance.
include("UPDATE_APPLICATION_ISSUANCE");
// End script to move workflow task Issuance to Issued, Temporarily Issued, or Provisionally Issued once payment has been recieved. Runs thr WTUA event for the given type of issuance.

// Begin script to move workflow task Application Acceptance to Submitted once payment has been recieved. Runs thr WTUA event.
include("UPDATE_APPLICATION_ACCEPTANCE");
// End script to move workflow task Application Acceptance to Submitted once payment has been recieved. Runs thr WTUA event.