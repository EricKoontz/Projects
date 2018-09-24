// Begin script to check that a dollar value has been provided
if (wfTask == "Supervisory Review" && wfStatus == "Approved" && !appMatch("Licenses/Cannabis/Temporary Event/Application")) {
	var vDollar;
	if (appMatch("Licenses/*/Event Organizer/*")) {
		vDollar = getAppSpecific("How many events do you plan to hold annually?");
	} else {
		vDollar = getAppSpecific("Max dollar value as determined by CDTFA in assessing excise tax");
	}
	if (vDollar == null || vDollar == "") {
		showMessage = true;
		comment("Please populate the 'Max dollar value as determined by CDTFA in assessing excise tax' data field before continuing.");
		cancel = true;
	}
}
// Begin script to check that a dollar value has been provided
