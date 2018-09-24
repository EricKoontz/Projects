function createParcelesAndOwners(){
	// add Parcel and Owner data	
	var primaryAddress=aa.address.getPrimaryAddressByCapID(capId,"Y");
		if (primaryAddress.getSuccess()){
			var refAddress=primaryAddress.getOutput();
			var refID=refAddress.getRefAddressId();
			addParcelAndOwnerFromRefAddress(refID,capId);
			
		}
}