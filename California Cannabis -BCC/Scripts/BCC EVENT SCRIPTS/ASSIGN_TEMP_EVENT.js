// Begin script to assign the owner submittal to the application reviewer
if ((publicUser && vEventName == "ConvertToRealCAPAfter") || (!publicUser && vEventName == "ApplicationSubmitAfter")) {
	var vAppAssigned;
	var vParentId;
	var vTmpCapId;

	vParentId = aa.cap.getCapID(AInfo["Application ID"]).getOutput();

	if (vParentId != null && vParentId != "") {
		vTmpCapId = capId;
		capId = vParentId;
		// Updated 2/15/17 to use the Application Acceptance task instead.
		//vAppAssigned = getTaskAssignedStaff("Initial Review");
		vAppAssigned = getTaskAssignedStaff("Application Acceptance");
		capId = vTmpCapId;

		if (vAppAssigned != false && vAppAssigned != "" && vAppAssigned != null) {
			assignTask("Application Acceptance", vAppAssigned);
			assignTask("Review", vAppAssigned);
		}
	}
}

// End script to assign the owner submittal to the application reviewer
