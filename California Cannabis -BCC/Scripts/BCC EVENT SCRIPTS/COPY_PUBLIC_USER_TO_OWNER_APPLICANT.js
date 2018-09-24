if (publicUser) {
	try {
		// get the public user account
		var FacAndPinOK = false;
		var contactAddedFac = false;
		var contactAddedChild = false;
		var getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);

		if (getUserResult.getSuccess() && getUserResult.getOutput()) {
			userModel = getUserResult.getOutput();
			userSeqNum = userModel.getUserSeqNum();
			refContact = getRefContactForPublicUser(userSeqNum)
				if (refContact != null) {
					refContactNum = refContact.getContactSeqNumber();
					addRefContactToRecord(refContactNum, "Owner Applicant", capId);
				} //if (refContact != null)

		} //if (getUserResult.getSuccess() && getUserResult.getOutput())

	} //try
	catch (err) {
		aa.print("A JavaScript Error occurred: " + err.message);
	}
}
