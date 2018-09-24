//Begin script to link amendment to application when user Defers Payment in ACA
include("LINK_ATT_TO_APP");
//End script to link amendment to application when user Defers Payment in ACA

// Begin script to copy Application contacts to ATT record
include("COPY_CONTACTS_TO_ATT");
// End script to copy Application contacts to ATT record

//Begin script to invoice all fees and set workflow task Review to Waiting for Payment when user Defers Payment in ACA
include("WAITING_FOR_PAYMENT_ATT");
//End script to invoice all fees and set workflow task Review to Waiting for Payment when user Defers Payment in ACA