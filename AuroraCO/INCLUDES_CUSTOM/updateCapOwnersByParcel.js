function updateCapOwnersByParcel() {
	//loads the parcels on the record, looks up the parcels' owners, and adds them
	try {
		var ownerNumberList = new Array();
		var ownerRefNumber = "";
		var firstLoop = true;
		var duplicateOwner = false;

		// remove current owners on record
		var recOwners = aa.owner.getOwnerByCapId(capId).getOutput()
		for (pntOwner in recOwners) {
			aa.owner.removeCapOwnerModel(recOwners[pntOwner]);
		}

		//get record's parcel(s)
		var parcels = aa.parcel.getParcelDailyByCapID(capId, null);

		if (parcels.getSuccess()) {
			parcels = parcels.getOutput();
			if (parcels == null || parcels.length == 0) {
				logDebug("No parcels available for this record");
			} else {
				//get owner(s) by parcel(s) and add to record
				for (var i = 0; i < parcels.length; i++) {
					var parcelOwnersResult = aa.owner.getOwnersByParcel(parcels[i]);
					var parcelNbr = parcels[i].getParcelNumber();
					var parcelUID = parcels[i].getParcelModel().getUID();
					if (parcelOwnersResult.getSuccess()) {
						var actuallyParcelNumber = parcelNbr != null ? parcelNbr : parcelUID;
						//aa.print("");
						//aa.print("Successfully get owner(s) by Parcel "+actuallyParcelNumber+". Detail as follow:");
						var ownerArr = parcelOwnersResult.getOutput();
						//aa.print("Size :" + ownerArr.length);
						for (j = 0; j < ownerArr.length; j++) {
							ownerRefNumber = ownerArr[j].getL1OwnerNumber();
							//aa.print("Looking at ref owner: " + ownerRefNumber);
							duplicateOwner = false;

							if (firstLoop) {
								ownerArr[j].setCapID(capId);
								ownerArr[j].setPrimaryOwner("N");
								aa.owner.createCapOwnerWithAPOAttribute(ownerArr[j]);
								//aa.print("Added first owner: " + ownerArr[j].getOwnerFullName() + ", #" + ownerArr[j].getL1OwnerNumber());
								ownerNumberList.push(ownerArr[j].getL1OwnerNumber());
								firstLoop = false;
							} else {
								// Look for duplicates
								for (k = 0; k < ownerNumberList.length; k++) {
									if (ownerNumberList[k] == ownerRefNumber) {
										duplicateOwner = true;
										//aa.print("Found duplicate");
										break;
									}
								}
								if (!duplicateOwner) {
									ownerArr[j].setCapID(capId);
									ownerArr[j].setPrimaryOwner("N");
									aa.owner.createCapOwnerWithAPOAttribute(ownerArr[j]);
									//aa.print("Added owner: " + ownerArr[j].getOwnerFullName() + ", #" + ownerArr[j].getL1OwnerNumber());
									ownerNumberList.push(ownerArr[j].getL1OwnerNumber());
								}
							}
						}
					} else {
						logDebug("ERROR: Failed to get owner(s) by Parcel(s): " + parcelOwnersResult.getErrorMessage());
					}
				}
			}
		}
	} catch (err) {
		comment("A JavaScript Error occurred:  Custom Function: updateCapOwnersByParcel(): " + err.message);
	}
}
