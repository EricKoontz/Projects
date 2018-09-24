
if (publicUser) {
		
		try {
			// get the public user account
			var FacAndPinOK = false;
			var contactAddedFac = false;
			var contactAddedChild = false;
			var getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);
			
		   	if (getUserResult.getSuccess() && getUserResult.getOutput()) {
		       	userModel = getUserResult.getOutput();	
				userSeqNum = userModel.getUserSeqNum();
				refContact = getRefContactForPublicUser(userSeqNum) 
				if (refContact != null) {
					refContactNum = refContact.getContactSeqNumber();
					addRefContactToRecord(refContactNum, "Business Owner", capId);
					
					
				} //if (refContact != null)
		   	
			} //if (getUserResult.getSuccess() && getUserResult.getOutput())
		
		} //try
		catch (err) {
			aa.print("A JavaScript Error occurred: " + err.message);
		}
	}


function getRefAddContactList(peoId){
	var conAdd = aa.proxyInvoker.newInstance("com.accela.orm.model.address.ContactAddressModel").getOutput();
	conAdd.setEntityID(parseInt(peoId));
	conAdd.setEntityType("CONTACT");
	var addList =  aa.address.getContactAddressList(conAdd).getOutput();
	var tmpList = aa.util.newArrayList();
	var pri = true;
	for(x in addList){
		if(pri){
			pri=false;
			addList[x].getContactAddressModel().setPrimary("Y"); 
		}
		tmpList.add(addList[x].getContactAddressModel());
	}
		
	return tmpList;
}