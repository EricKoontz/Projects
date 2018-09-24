/*------------------------------------------------------------------------------------------------------/
| $Id:  CAN_OWN_APP_Set_App_ID.js   2017-06-27   emmett.wylam $
|
| Usage   : Expression Builder Script that will populate parent ID
|
| Client  : BMCR
| Action# : 
|
| Notes   : Expression builder script to be used on ASI portlet.  Execute onload
|
/------------------------------------------------------------------------------------------------------*/

var msg = "";
var aa = expression.getScriptRoot();

var vParentCap;
var vParentAltID;
var vAppID = expression.getValue("ASI::PARENT APPLICATION ID::Application ID");
var vPID1 = expression.getValue("$$parentCapID1$$");
var vPID2 = expression.getValue("$$parentCapID2$$");
var vPID3 = expression.getValue("$$parentCapID3$$");
var thisForm = expression.getValue("ASI::FORM");

if (vPID1.value) {
	vParentCap = aa.cap.getCapID(vPID1.value,vPID2.value,vPID3.value).getOutput();
	if (vParentCap != null) {
		vParentAltID = vParentCap.getCustomID();
	}
}

if ((vAppID.value == "" || vAppID.value == null) && vParentAltID != null && vParentAltID != "") {
	vAppID.value = vParentAltID;
	expression.setReturn(vAppID);
	expression.setReturn(thisForm);
}