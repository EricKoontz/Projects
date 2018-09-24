function getAssignedStaff() {
	try {
		var assignedStaff = "";
		var cdScriptObjResult = aa.cap.getCapDetail(capId);
		if (!cdScriptObjResult.getSuccess()) {
			aa.debug("**ERROR: No cap detail script object : ",
					cdScriptObjResult.getErrorMessage());
			return "";
		}

		var cdScriptObj = cdScriptObjResult.getOutput();
		if (!cdScriptObj) {
			aa.debug("**ERROR: No cap detail script object", "");
			return "";
		}
		cd = cdScriptObj.getCapDetailModel();
		assignedStaff = cd.getAsgnStaff();

		return assignedStaff

	} catch (e) {
		aa.debug("getAssignedStaff ", e);
		return null;
	}
}