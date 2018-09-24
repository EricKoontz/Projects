// Begin script to copy the address from the application to the owner submittal
var vAppIDString;
var vAppID;
var vAppAddress;

vAppIDString = getAppSpecific("Application ID");
if (vAppIDString != null && vAppIDString != "") {
	vAppID = aa.cap.getCapID(vAppIDString).getOutput();	
	copyAddress(vAppID, capId);
}
// End script to copy the address from the application to the owner submittal