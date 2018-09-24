
var currentUserGroupObj = aa.userright.getUserRight("Enforcement",currentUserID).getOutput()
if (currentUserGroupObj) {
	currentUserGroup = currentUserGroupObj.getGroupName();
	if (currentUserGroup != "Enforcement Evidence") {
		comment("Only Evidence Custodian can edit Evidence after it's been created");
// TODO:  using aa.print due to bug 18ACC-284870
		aa.print("Only Evidence Custodian can edit Evidence after it's been created");
		cancel = true;
		showMesage = true;
		}
}