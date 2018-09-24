// Begin script to prevent issuance if fees have not been paid
if (wfTask == "Issuance" && wfStatus.indexOf("Issued") != -1 && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("'" + wfStatus + "' cannot be selected because fees have not been paid.");	
}
// End script to prevent issuance if fees have not been paid