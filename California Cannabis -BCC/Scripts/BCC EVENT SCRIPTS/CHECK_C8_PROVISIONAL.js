// Begin script to stop the "Provisionally Issued" from being selected for all but C8 types
if (appMatch("Licenses/Cannabis/Testing/Application") == false && wfTask == "Supervisory Review" && wfStatus == "Provisionally Approved") {
	showMessage = true;
	cancel = true;
	comment("'" + wfStatus + "' cannot be selected for a non-C8 application.");
}
// End script to stop the "Provisionally Issued" from being selected for all but C8 types