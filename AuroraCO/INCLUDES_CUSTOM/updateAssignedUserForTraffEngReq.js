function updateAssignedUserForTraffEngReq(){
if ( (wfTask=="Initial Review" || wfTask=="Initial Supervisor Review") && wfStatus=="Assigned"){
	// update wftask Traffic Investigation assigned department & user , get  from TSI
	useTaskSpecificGroupName=false;
	var tsiArray = new Array(); 
        loadTaskSpecific(tsiArray);
        for (i in tsiArray){
    if (i=="Assigned To"){
    	var assignedTo=tsiArray[i];
    	if (assignedTo!=null && assignedTo!=""){
    			var userName=assignedTo.split(" ");
    			var userObj = aa.person.getUser(userName[0],null,userName[1]).getOutput();
    			assignTask("Traffic Investigation",userObj.getUserID());
    			updateTaskDepartment("Traffic Investigation",userObj.getDeptOfUser());		
    	}	
     }
    	
    }
	
}
}
