logDebug("COMMERCIAL_CHECK_FOR_CONTACT_WITH_LAB_FIN");

if (!appHasCondition("License Conditions", null, "Potential Conflict of Interest", null)) {
		var msg;
		for (var o in LISTOFOWNERS) {
			var orow = LISTOFOWNERS[o];
			var recs = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Cannabis/Testing/*");
			logDebug("Checking for Owner " + orow["First Name"], orow["Last Name"]);
			if (recs && recs.length > 0) {
				msg = "Potential Conflicts for Owner: " + orow["First Name"] + " " + orow["Last Name"] + ":" + String.fromCharCode(13);
				for (var i in recs) {
					logDebug("Conflict found : " + recs[i].getCustomID());
					msg += recs[i].getCustomID() + String.fromCharCode(13);
				}
			}
		}

		for (var o in NONCONTROLLINGINTEREST) {
			var orow = NONCONTROLLINGINTEREST[o];
			var recs = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Cannabis/Testing/*");
			logDebug("Checking for Non-Controlling Interest " + orow["First Name"], orow["Last Name"]);
			if (recs && recs.length > 0) {
				msg = "Potential Conflicts for Non-Controlling Interest:  " + orow["First Name"] + " " + orow["Last Name"] + ":" + String.fromCharCode(13);
				for (var i in recs) {
					logDebug("Conflict found : " + recs[i].getCustomID());
					msg += recs[i].getCustomID() + String.fromCharCode(13);
				}
			}
		}

		if (msg) {

			addStdConditionWithComment("License Conditions", "Potential Conflict of Interest", String(msg));
		}
}
