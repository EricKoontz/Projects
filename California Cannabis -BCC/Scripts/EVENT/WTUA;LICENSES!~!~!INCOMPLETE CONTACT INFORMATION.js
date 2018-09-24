if (wfTask.equals("Review") && wfStatus.equals("Changes Accepted")) {
	var vCheckPrimary = false;
	var vPrimaryContact = getContactObj(capId, 'Primary Contact Person');
	if (vPrimaryContact.length > 0) {
		vCheckPrimary = true;
	}
	if (parentCapId) {
		//  remove all contacts from parent
		capContactResult = aa.people.getCapContactByCapID(parentCapId);
		if (capContactResult.getSuccess()) {
			var contacts = capContactResult.getOutput();
			for (var i in contacts) {
				if (contacts[i].getPeople().getContactType() == 'Business' || (vCheckPrimary = true && contacts[i].getPeople().getContactType() == 'Primary Contact Person')) {
					var capContactNumber = aa.util.parseInt(contacts[i].getCapContactModel().getPeople().getContactSeqNumber());
					aa.people.removeCapContact(parentCapId, capContactNumber);
					logDebug(contacts[i].getPeople().getContactType() + " - Contact Seq Number " + capContactNumber + " removed from parent " + parentCapId);
				}
			}
		}
	}

	//  copy from amendment to parent
	copyContacts(capId, parentCapId);
	
	//copy from amendment to parent
	//copyContactsByType(capId, parentCapId,"Business");
	//copyContactsByType(capId, parentCapId,"Primary Contact Person");
	
	// always copy over the new tables.
	copyASITablesWithRemove(capId,parentCapId);
}
