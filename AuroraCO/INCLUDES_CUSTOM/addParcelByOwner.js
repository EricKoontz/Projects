function addParcelByOwner(){
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();
		for (o in owner) {
			var oNumber=owner[o].getL1OwnerNumber();
			parcelResult=aa.parcel.getParceListForAdmin("", "","", "", "", "", "", "", "", owner[o].getOwnerFullName());
			
			if (parcelResult.getSuccess()){
				parcelList=parcelResult.getOutput();
				for (p in parcelList){	
					var ow=parcelList[p].getOwnerModel();
					var num=ow.getOwnerNumber();
					if (oNumber==num){ // double check if the parcel's owner is the same as the cap owner
						// add the parcel
						var capParModel = aa.parcel.warpCapIdParcelModel2CapParcelModel(capId, parcelList[p].getParcelModel()).getOutput()
						var createPMResult = aa.parcel.createCapParcel(capParModel);
						if (createPMResult.getSuccess())
							logDebug("created CAP Parcel");
						else {
							logDebug("**WARNING: Failed to create the cap Parcel " + createPMResult.getErrorMessage());
						}
					}		
				}
			}
		}
		
	}
}

