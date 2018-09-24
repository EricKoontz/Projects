function addNotProvidedAPOData(){
	try{
		isAddress=addressExistsOnCap();
		isParcel=parcelExistsOnCap();
		isOwner=ownerExistsOnCap();
					   	
		if (isAddress){
			if (isParcel){
				if (!isOwner) GetOwnersByParcel(); 			
			}else{ // no Parcel Provided
				if (!isOwner)createParcelesAndOwners(); //add the parcel and Owner
				if (isOwner) addParcelByOwner();//no parcel but there is owner
			}
		}else{// no Address , then get the Parcel and add the Owner and the Address
			if (isParcel){ //no Address, parcel exist
				if (!isOwner)GetOwnersByParcel();
				addAddressByParcel();
			}else{ // no Address , no Parcel ,owner exist
				if (isOwner){
					addParcelByOwner();
					addAddressByParcel();
				}
			}
		}	
	}catch(e){
		logDebug("Error In Adding Not Provided APO Data " + e);
	}
}