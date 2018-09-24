function assignWfTask(username){
	try{
		var taskUserResult = aa.person.getUser(username);
	if (taskUserResult.getSuccess()){
		taskUserObj = taskUserResult.getOutput();
		
		//  User Object
	}
	else
		{ aa.debug("**ERROR: Failed to get user object: " , taskUserResult.getErrorMessage()); return false; }
	
	var workflowResult = aa.workflow.getTaskItems(capId, null, null, null, null, "Y");
	
	if (workflowResult.getSuccess()){
  	 	var wfObj = workflowResult.getOutput(); 
  	 	
	}
	  	else
  	  	{ aa.debug("**ERROR: Failed to get workflow object: " , workflowResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
   		var fTask = wfObj[i];
   		
   		var dept = fTask.getTaskItem().getAssignedUser().getDeptOfUser();
   		if (String(dept).equals("AURORACO/PLANNING/NA/NA/NA/NA/NA")){
   			fTask.setAssignedUser(taskUserObj);
			var taskItem = fTask.getTaskItem();
			var adjustResult = aa.workflow.assignTask(taskItem);
			if (adjustResult.getSuccess()){aa.debug("Sucssfull assign task " , fTask.getTaskDescription()) ;}
			}
		}
		
	}catch(e){
		aa.debug("getAssignedStaff " , e);
		return false;
	}	
}
