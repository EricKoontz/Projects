if (wfTask ==  "Case Management" && wfStatus == "Petition Overturned") {
	updateTask("Petition Decision", "Petition Overturned", "Updated by script 'UPDATE_LICENSE_PETITION_RECORD'", "Updated by script 'UPDATE_LICENSE_PETITION_RECORD'", "", parentCapId);
}

if (wfTask ==  "Case Management" && wfStatus == "Petition Upheld") {
	updateTask("Petition Decision", "Petition Upheld", "Updated by script 'UPDATE_LICENSE_PETITION_RECORD'", "Updated by script 'UPDATE_LICENSE_PETITION_RECORD'", "", parentCapId);
	var vProcessID = getProcessID("Petition Decision", parentCapId);
	var vProcessCode = getProcessCode("Petition Decision", parentCapId);
	var vTaskStepNum;
	vTaskStepNum = getTaskStepNumber(vProcessCode, "Petition Decision", parentCapId);
	var vTmpCapId = capId;
	capId = parentCapId;
	closeTask("Petition Decision", "Upheld - Final Denial", "Updated by script 'UPDATE_LICENSE_PETITION_RECORD'", "Updated by script 'UPDATE_LICENSE_PETITION_RECORD'", "");
	capId = vTmpCapId;
	runWTUAForWFTaskWFStatus("Petition Decision", vProcessID, vTaskStepNum, "Upheld - Final Denial", parentCapId);
}
