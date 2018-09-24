function addAddressByParcel(){
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
	if (capParcelResult.getSuccess()){
		var fcapParcelObj = capParcelResult.getOutput().toArray();
	}
		
	else
		{ logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()); return false; }

	var serviceProviderCode = aa.getServiceProviderCode();
	var currentUserID = aa.getAuditID();
	
	for (i in fcapParcelObj)
	{
		parcelNum = fcapParcelObj[i].getParcelNumber();
		var addResult=aa.address.getAddressListForAdmin(parcelNum,"","","","","","","","","","","","","");
		if (addResult.getSuccess()){
			addressList=addResult.getOutput();
			
			for (add in addressList){
				refAddressModel=addressList[add].getRefAddressModel();
				primFlag=refAddressModel.getPrimaryFlag();		
				var newAddressModel = refAddressModel.toAddressModel();
				newAddressModel.setCapID(capId);
				newAddressModel.setServiceProviderCode(serviceProviderCode);
				newAddressModel.setAuditID(currentUserID);
				newAddressModel.setPrimaryFlag(primFlag);
		        
				//Create new address for cap.
				var result=aa.address.createAddress(newAddressModel);
				
		}
			
		}
	}
	
}
