// Copy Business Owner contact to parent application
if (wfTask == "Review" && wfStatus == "Review Completed") {
	var vChanges = false;
	var parentId = getParent();
	//when triggered by CTRCA the parent is not found, try using the partial Cap to get the parent
	if (!parentId || parentId == null) {
		vPartialCapId = getPartialCapID(capId);
		if (vPartialCapId != "" && vPartialCapId != null) {
			//save original capId
			vTmpCapId = capId;
			//set capId to partial capId
			capId = vPartialCapId;
			//try to get parent
			parentId = getParent();
			//reset capId to original
			capId = vTmpCapId;
		}
	}
	if (!parentId || parentId == null) {
		logDebug("Parent not found");
	} else {
		// get contacts from the parent
		parentContactArr = getContactObjsByCap_BCC(parentId);

		contactArr = getContactObjsByCap_BCC(capId);
		for (var cIndex in contactArr) {
			thisContact = contactArr[cIndex];
			if (thisContact.type == "Business Owner") {
				refContactSeqNum = thisContact.refSeqNumber;
				if (refContactSeqNum != null) {
					if (!doesContactExistOnRecord(refContactSeqNum, parentId)) {
						// add it to the parent
						var newContact = thisContact.capContact;
						newContact.setCapID(parentId);
						createResult = aa.people.createCapContactWithAttribute(newContact);
						vChanges = true;
					}
				}
			}
		}
		if (vChanges == true) {
			//Set "Owner Applicant" as primary on the parent
			var vOwnerApplicant = getContactByType("Owner Applicant",parentId);
			if (vOwnerApplicant != false && vOwnerApplicant != "") {
				var vConNbr = vOwnerApplicant.getContactSeqNumber();
				if (vConNbr != null && vConNbr != "") {
					//save original capId
					vTmpCapId = capId;
					capId = parentId;
					contactSetPrimary(vConNbr);
					//reset capId to original
					capId = vTmpCapId;
				}
			}
			//close amendment workflow
			closeTask("Close Out", "Completed", "Closed by COPY_BUSINESS_OWNER_TO_APP", "Closed by COPY_BUSINESS_OWNER_TO_APP");
		}
	}
}
