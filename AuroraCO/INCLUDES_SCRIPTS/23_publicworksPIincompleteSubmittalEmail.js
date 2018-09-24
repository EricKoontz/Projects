//written by JMAIN

//get the current wfTask
var currentwftask = wfTask;

//get the current wfStatus
var currentstatus = wfStatus;

//send email if everything is correct
if (currentwftask == "Application Acceptance" && currentstatus == "Incomplete")
{
	//send email and include link to record and comments
	var taskinfo = getTaskStatusForEmail("Application Acceptance");
	var debugstring = printObject(taskinfo);
	logDebug(debugstring);
	
}