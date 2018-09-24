var vStatusArray = ["Overturned - Issue License", "Upheld - Final Denial", "Abandoned", "Withdrawn", "Void"];

if (wfTask ==  "Petition Decision" && exists(wfStatus, vStatusArray)) {
	var vTmpCapId = capId;
	capId = parentCapId;
	activateTask("Supervisory Review");
	//deactivateTask("Close Out");
	capId = vTmpCapId;
	var vProcessID = getProcessID("Supervisory Review", parentCapId);
	var vProcessCode = getProcessCode("Supervisory Review", parentCapId);
	var vTaskStepNum;
	vTaskStepNum = getTaskStepNumber(vProcessCode, "Supervisory Review", parentCapId);
	updateTask("Supervisory Review", "Supervisory Review", "Updated by script 'UPDATE_APPLICATION_FROM_PETITION'", "Updated by script 'UPDATE_APPLICATION_FROM_PETITION'", "", parentCapId);
	runWTUAForWFTaskWFStatus("Supervisory Review", vProcessID, vTaskStepNum, "Supervisory Review", parentCapId);
}
