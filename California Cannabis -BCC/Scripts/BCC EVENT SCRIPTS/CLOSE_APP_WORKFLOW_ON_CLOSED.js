//Start script to close Application Acceptance task if "Closed" selected on Initial Review or Supervisory Review, story 2770

if ((wfTask == "Initial Review" || wfTask == "Supervisory Review")&& wfStatus == "Closed") {
	closeTask("Close Out","Closed", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED");
	closeTask("Application Acceptance","Closed", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED");
	deactivateTask("Initial Review");
}

//End script to close Application Acceptance task if "Closed" selected on Initial Review or Supervisory Review, story 2770

//Start script(s) to close Application Acceptance task if "Abandoned, Withdrawn or Void" selected on Initial Review or Supervisory Review, story 2772

if ((wfTask == "Initial Review" || wfTask == "Supervisory Review")&& wfStatus == "Abandoned") {
	closeTask("Close Out","Abandoned", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED");
	closeTask("Application Acceptance","Closed", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED");
	deactivateTask("Initial Review");
}

if ((wfTask == "Initial Review" || wfTask == "Supervisory Review")&& wfStatus == "Withdrawn") {
	closeTask("Close Out","Withdrawn", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED");
	closeTask("Application Acceptance","Closed", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED");
	deactivateTask("Initial Review");

}	
	if ((wfTask == "Initial Review" || wfTask == "Supervisory Review")&& wfStatus == "Void") {
	closeTask("Close Out","Void", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED");
	closeTask("Application Acceptance","Closed", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED", "Closed by CLOSE_APP_WORKFLOW_ON_CLOSED");
	deactivateTask("Initial Review");
}

//End script(s) to close Application Acceptance task if "Abandoned, Withdrawn or Void" selected on Initial Review or Supervisory Review, story 2772