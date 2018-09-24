if (!appHasCondition("License Conditions", null, "Potential Conflict of Interest", null)) {
	if (publicUser || (vEventName == "WorkflowTaskUpdateAfter" && wfTask == "Initial Review" && wfStatus.indexOf("Approv") >= 0)) {

		var msg;
		for (var o in LISTOFOWNERS) {
			var orow = LISTOFOWNERS[o];
			var recs = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Cannabis/Testing/Application");
			if (recs && recs.length > 0) {
				msg = "Potential Conflicts for Owner: " + orow["First Name"] + " " + orow["Last Name"] + ":" + String.fromCharCode(13);
				for (var i in recs) {
					msg += recs[i].getCustomID() + String.fromCharCode(13);
				}
			}
		}

		for (var o in NONCONTROLLINGINTEREST) {
			var orow = NONCONTROLLINGINTEREST[o];
			var recs = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Cannabis/Testing/Application");
			if (recs && recs.length > 0) {
				msg = "Potential Conflicts for Non-Controlling Interest:  " + orow["First Name"] + " " + orow["Last Name"] + ":" + String.fromCharCode(13);
				for (var i in recs) {
					msg += recs[i].getCustomID() + String.fromCharCode(13);
				}
			}
		}

		if (msg) {

			addStdConditionWithComment("License Conditions", "Potential Conflict of Interest", String(msg));
		}
	}
}
