//Begin script to link amendment to application when user Defers Payment in ACA
var vParentId;
vParentId = "" + aa.env.getValue("ParentCapID");
if (vParentId == false || vParentId == null || vParentId == "") {
	var vAppId = getAppSpecific("Application ID");
	if (vAppId != "" && vAppId != null) {
		addParent(vAppId);
	}
}
//End script to link amendment to application when user Defers Payment in ACA