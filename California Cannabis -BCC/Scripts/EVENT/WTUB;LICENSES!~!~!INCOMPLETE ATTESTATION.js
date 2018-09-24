// Begin script to prevent acceptance if fees have not been paid
include("CHECK_FEES_PAID_PRIOR_TO_CHANGES_ACCEPTED");
// End script to prevent acceptance if fees have not been paid

// Begin script to check for any outstanding conditons of approval
include("CHECK_ALL_REQUIREMENTS_MET");
// End script to check for any outstanding conditons of approval