//Script 256
//Record Types:	Planning/*/*/*
//Event: 		WTUB
//Desc:			Event WorkflowUpdateBefore 
//
//              Event WorkflowTaskUpdateBefore
//
//              Criteria wfTask = Application Acceptance status = Accepted 
//                                and If Assigned Staff on Record Detail is null 
//
//              Action Raise Message “Case Manager not Assigned. Please enter on the Record tab”
//
//Created By: Silver Lining Solutions

function script256_MessageIfNoCaseManagerAssign (){
	logDebug("script256_MessageIfNoCaseManagerAssign() started.");
	try
	{
		if ( wfTask == "Application Acceptance" && wfStatus == "Accepted")
		{
			// determine if the record has an assigned Case Manager. if not throw error
			if (getAssignedStaff() == null)
				throw "Case Manager not Assigned. Please enter on the Record tab";			
		}
	}
	catch(err)
	{
		cancel = true;
		showMessage = true;
		comment(err);
	}
	logDebug("script256_MessageIfNoCaseManagerAssign() ended.");
};//END script256_MessageIfNoCaseManagerAssign
