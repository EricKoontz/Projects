function validateReceptionNumber(){
	try{
		if (wfTask=="Recordation" && wfStatus=="Recorded"){
			useAppSpecificGroupName=false;
			var receptionNumber=getAppSpecific("Reception Number");
			if (receptionNumber==null)throw "Reception Number is not set and see Info Fields to fill in the reception number";
		}
			
	}catch(e){
		cancel = true;
		showMessage = true;
		comment(e);
	}
}
