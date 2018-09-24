// Begin script to assign the renewal to the application reviewer
//if ((publicUser && vEventName == "ConvertToRealCAPAfter") || (!publicUser && vEventName == "ApplicationSubmitAfter")) {
	var vAppAssigned;
	var vParentId;
	var vTmpCapId;

	var vLicenseId = getParentLicenseCapID(capId);

	if (vLicenseId != null && vLicenseId != false) {
		var appArray = getChildren("Licenses/*/*/Application", vLicenseId);
		if (appArray && appArray.length > 0) {
			vTmpCapId = capId;
			capId = appArray[0]; // use first.
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

