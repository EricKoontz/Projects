// Begin script to associate parent application to owner submittal
if (!publicUser) {
	if (AInfo["Application ID"] && AInfo["Application ID"] != "") {
		var parentIdResult = aa.cap.getCapID(AInfo["Application ID"]);
		if (parentIdResult.getSuccess()) {
			var parentId = parentIdResult.getOutput();
			if (parentId) {
				addParent(parentId);
			}
		}
	}
}
// End script to associate parent application to owner submittal

// Begin script to insert the public user reference contact as the business owner
include("COPY_PUBLIC_USER_TO_BUSINESS_OWNER");
// Begin script to insert the public user reference contact as the business owner

// Begin script to copy application name and busines owner to the owner submittal record name
include("SAVE_OWNER_SUBMITTAL_APP_NAME");
// End script to copy application name and busines owner to the owner submittal record name

// Begin script to copy the address from the application to the owner submittal
include("COPY_APP_ADDRESS_TO_OWNER_SUBMITTAL");
// End script to copy the address from the application to the owner submittal

// Inform the CTRCA event that this record is actually coming from the amendment link
// And not to script adding the parent to the record.   The parent will be added
// during the payment process
if (publicUser && isAmendment()) {
	editAppSpecific("Application ID","AMENDMENT" + AInfo["Application ID"]);
}

// Begin script to update Application to Owner Submittals Received when all have been submitted.
include("UPDATE_OWNER_SUBMITTALS_RECIEVED");
// End script to update Application to Owner Submittals Received when all have been submitted.

// Begin script to assign the owner submittal to the application reviewer
include("ASSIGN_OWNER_SUBMITTAL");
// End script to assign the owner submittal to the application reviewer
