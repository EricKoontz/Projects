// story 2238, 2281.  Begin script to prevent issuance if all requirements have not been met
if ((wfTask == "Initial Review" || wfTask == "Supervisory Review") && wfStatus.indexOf("Approv") >= 0 && (!recordHasNoAppliedConditionInType("License Required Documents") || !recordHasNoAppliedConditionInType("Miscellaneous")) ) {
	cancel = true;
	showMessage = true;
	comment("'" + wfStatus + "' cannot be selected because all requirements have not been signed off.");	
}
//  End 

// Check owner submittal/amendment
if (wfTask == "Review" && (wfStatus == "Review Completed" || wfStatus == "Changes Accepted") && (!recordHasNoAppliedConditionInType("License Required Documents") || !recordHasNoAppliedConditionInType("Miscellaneous")) ) {
	cancel = true;
	showMessage = true;
	comment("'" + wfStatus + "' cannot be selected because all requirements have not been signed off.");	
}
//  End 
