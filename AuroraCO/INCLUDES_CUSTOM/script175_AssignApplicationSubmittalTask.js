//Script 175
//Record Types:	PublicWorks\Traffic\Traffic Engineering Request\NA 
//Event: 		ASA
//Desc:			Criteria/Action on submittal do:
// 					1) if submitted via ACA assign WF Task Application Submittal to Anna Bunce
//                  2) if NOT submitted via ACA assign WF Task Application Submittal to 
//                     the creator of the record
//
//Created By: Silver Lining Solutions

function script175_AssignApplicationSubmittalTask(){
	logDebug("script175_AssignApplicationSubmittalTask() started.");
	try
	{
		if (publicUser)
			{
			assignTask("Application Submittal","ABUNCE");
			logDebug("script175_AssignApplicationSubmittalTask: assigning Application Submittal to ABUNCE");
			}
		else 
			{
			assignTask("Application Submittal",currentUserID);	
			logDebug("script175_AssignApplicationSubmittalTask: assigning Application Submittal to current User:" + currentUserID);
			}
	}
	catch(err){
		logDebug("Error on custom function script175_AssignApplicationSubmittalTask(). Please contact administrator. Err: " + err);
	}
	logDebug("script175_AssignApplicationSubmittalTask() ended.");
}; //END script175_AssignApplicationSubmittalTask()
