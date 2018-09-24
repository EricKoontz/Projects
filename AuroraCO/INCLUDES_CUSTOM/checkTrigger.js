function checkTrigger(tasksArray,statusesArray){
	 var isTask=false;
	 var isStatus=false;
	 
	 for (t in tasksArray){
		 if (wfTask==tasksArray[t]){
			 isTask=true;
			 break;
		 }
	 }
	 
	 for (s in statusesArray){
		 if (wfStatus==statusesArray[s]){
			 isStatus=true;
			 break;
		 }
	 }
	 return isTask && isStatus;
}