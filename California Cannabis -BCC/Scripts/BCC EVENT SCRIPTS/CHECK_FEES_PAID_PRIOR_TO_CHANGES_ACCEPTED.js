// Begin script to prevent acceptance if fees have not been paid
if (wfTask == "Review" && wfStatus == "Changes Accepted" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("'" + wfStatus + "' cannot be selected because fees have not been paid.");	
}
// End script to prevent acceptance if fees have not been paid