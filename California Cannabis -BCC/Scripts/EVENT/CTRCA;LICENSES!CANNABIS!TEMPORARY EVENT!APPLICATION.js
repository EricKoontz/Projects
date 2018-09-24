// check to see if this is from an amendment link.   If so, the product will set the relationship for us.
if (AInfo["CEO License #"].indexOf("AMENDMENT") >= 0) {
	editAppSpecific("CEO License #",AInfo["CEO License #"].replace("AMENDMENT",""));
}
else {
	if (AInfo["CEO License #"] && AInfo["CEO License #"] != "" ) {
		var parentIdResult = aa.cap.getCapID(AInfo["CEO License #"]);
		if (parentIdResult.getSuccess()) {
			var parentId = parentIdResult.getOutput();
			if (parentId) {
				addParent(parentId);
				var eba = getContactObjsByCap_BCC(parentId,"Event Business");
				if (eba && eba.length > 0) {
					eb = eba[0];
					eb.replace(capId); // copy contact to this record
				}
			}
		}
	}
}

// Begin script to assign the owner submittal to the application reviewer
include("ASSIGN_TEMP_EVENT");
// End script to assign the owner submittal to the application reviewer
