// Begin script to copy application name and busines owner to the owner submittal record name
var vAppIDString;
var vAppID;
var vAppName;
var vBusinessOwner;
var vFName;
var vLName;

vAppIDString = getAppSpecific("Application ID");
if (vAppIDString != null && vAppIDString != "") {
	vAppID = aa.cap.getCapID(vAppIDString).getOutput();
	vAppName = getAppName(vAppID);
	vBusinessOwner = getContactObj(capId, "Business Owner");
	vFName = vBusinessOwner.people.firstName;
	vLName = vBusinessOwner.people.lastName;
	editAppName(vAppName + "-" + vFName + " " + vLName);	
}
// End script to copy application name and busines owner to the owner submittal record name