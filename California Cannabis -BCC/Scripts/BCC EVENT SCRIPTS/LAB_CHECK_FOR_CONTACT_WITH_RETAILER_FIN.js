if (!appHasCondition("License Conditions", null, "Potential Conflict of Interest", null)) {
	var msg;
	for (var o in LISTOFOWNERS) {
		var orow = LISTOFOWNERS[o];
		var recs1 = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Adult Use Cannabis/*/*");
		var recs2 = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Medical Cannabis/*/*");
		var recs3 = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Cannabis/Event Organizer/*");
		var recs = recs1.concat(recs2, recs3);
		if (recs && recs.length > 0) {
			msg = "Potential Conflicts for Owner: " + orow["First Name"] + " " + orow["Last Name"] + ":" + String.fromCharCode(13);
			for (var i in recs) {
				msg += recs[i].getCustomID() + String.fromCharCode(13);
			}
		}
	}

	for (var o in NONCONTROLLINGINTEREST) {
		var orow = NONCONTROLLINGINTEREST[o];
		var recs1 = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Adult Use Cannabis/*/*");
		var recs2 = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Medical Cannabis/*/*");
		var recs3 = getRecordsWithASIContacts(orow["First Name"], orow["Last Name"], "Licenses/Cannabis/Event Organizer/*");
		var recs = recs1.concat(recs2, recs3);
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
