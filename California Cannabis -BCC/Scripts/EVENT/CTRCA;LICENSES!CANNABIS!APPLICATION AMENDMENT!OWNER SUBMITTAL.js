// check to see if this is from an amendment link.   If so, the product will set the relationship for us.
if (AInfo["Application ID"].indexOf("AMENDMENT") >= 0) {
	editAppSpecific("Application ID",AInfo["Application ID"].replace("AMENDMENT",""));
}
else {
	if (AInfo["Application ID"] && AInfo["Application ID"] != "" ) {
		var parentIdResult = aa.cap.getCapID(AInfo["Application ID"]);
		if (parentIdResult.getSuccess()) {
			var parentId = parentIdResult.getOutput();
			if (parentId) {
				addParent(parentId);
			}
		}
	}
}

// Begin script to update Application to Owner Submittals Received when all have been submitted.
include("UPDATE_OWNER_SUBMITTALS_RECIEVED");
// End script to update Application to Owner Submittals Received when all have been submitted.

// Begin script to assign the owner submittal to the application reviewer
include("ASSIGN_OWNER_SUBMITTAL");
// End script to assign the owner submittal to the application reviewer

aa.sendMail("noreply@accela.com", "ewylam@etechconsultingllc.com", "", "ETW Debug", debug);