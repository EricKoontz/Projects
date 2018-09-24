//Begin script to copy Application contacts to ATT record
	vParentId = getParent();
	if (vParentId != null && vParentId != false && vParentId != "undefined") {
		copyContacts3_0(vParentId,capId);
	}
//End script to copy Application contacts to ATT record