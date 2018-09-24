function getCapByParcel(ats,capId,sOfRequest){
	try{
		var ret;
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess())
			{ var Parcels = capParcelResult.getOutput().toArray(); }
		else	
			{ logDebug("**ERROR: getting parcels by cap ID: " + capParcelResult.getErrorMessage()); return false; }
		for (zz in Parcels)
		{
			var ParcelValidatedNumber = Parcels[zz].getParcelNumber();

			// get caps with same parcel
			var capAddResult = aa.cap.getCapListByParcelID(ParcelValidatedNumber,null);
			if (capAddResult.getSuccess())
				{ var capIdArray=capAddResult.getOutput(); }
			else
				{ logDebug("**ERROR: getting similar parcels: " + capAddResult.getErrorMessage());  return false; }
			// loop through related caps
			for (cappy in capIdArray)
				{
				// skip if current cap
				if (capId.getCustomID().equals(capIdArray[cappy].getCustomID()))continue;
				var relcap = aa.cap.getCap(capIdArray[cappy].getCapID()).getOutput();
				// get cap type
				var reltypeN = relcap.getCapType().toString().split("/");
				var ata = ats.split("/");
				if (ata[0]==reltypeN[0] && ata[1]==reltypeN[1]){
					//check status & ASI value
					if (relcap.getCapStatus().toString().equalsIgnoreCase("Wait List") || relcap.getCapStatus().toString().equalsIgnoreCase("Assigned") || relcap.getCapStatus().toString().equalsIgnoreCase("Submitted") || relcap.getCapStatus().toString().equalsIgnoreCase("Working")){
						useAppSpecificGroupName=false;
						var sourceOfReq=getAppSpecific("Source of Request",capIdArray[cappy].getCapID());
						if (typeof(sourceOfReq)!="undefined" && sourceOfReq!=null && sourceOfReq!="" && sourceOfReq.equals(sOfRequest)){
							ret=capIdArray[cappy];
							break;
						}
					}
				
				}
				
				}
			
		}	
		
		return ret;
	}catch(e){
		logDebug("****ERROR IN getCapByParcel " + e);
		return false
		}
}

