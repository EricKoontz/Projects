// Begin script to update the Supervisor Review to In Process when initial review is approved
if (wfTask == "Initial Review" && wfStatus == "Recommend Approval") {
	updateTask("Supervisory Review","In Process","Updated by SET_IN_PROCESS", "Updated by SET_IN_PROCESS");
}
// End script to update the Supervisor Review to In Process when initial review is approved
