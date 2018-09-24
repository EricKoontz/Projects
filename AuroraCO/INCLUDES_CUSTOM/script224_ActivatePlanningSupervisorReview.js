//Script 224
//Record Types:	ODA/Pre App/NA/NA
//Event: 		WTUA
//Desc:			Event WorkflowUpdateAfter 
//
//              Criteria: wfTask = Planning Review and status = Ready for Supervisor 
//
//              Action: activate Planning Supervisor Review task (note this lets the 
//                      Supervisor know they need to look at the record again)
//
//Created By: Silver Lining Solutions

function script224_ActivatePlanningSupervisorReview(){
	logDebug("script224_ActivatePlanningSupervisorReview() started.");
	try
	{
		if ( wfTask == "Planning Review" && wfStatus == "Ready for Supervisor Review")
		{
			activateTask("Planning Supervisor Review");
		}
	}
	catch(err)
	{
		logDebug("Error on custom function script224_ActivatePlanningSupervisorReview(). Please contact administrator. Err: " + err);
	}
	logDebug("script224_ActivatePlanningSupervisorReview() ended.");
};//END script224_ActivatePlanningSupervisorReview
