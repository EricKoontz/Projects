function removeDuplicateParcelsFromTable(pParcelTable) {
	//go through ASIT array and remove duplicates
	try {
		//aa.print("- Inside removeDuplicateParcelsFromTable()");
		var parcelFound = false

		//copy table for comparision
		compareTable = pParcelTable;
		for (indxCT in compareTable) {
			var compareTableRow = compareTable[indxCT]
			//aa.print("-- checking >" + compareTableRow["Parcel"] + "<");
			parcelFound = false;

			for (var indexPT = 0; indexPT < pParcelTable.length; indexPT++) {
				var pParcelTableRow = pParcelTable[indexPT]
				//aa.print("--- comparing >" + compareTableRow["Parcel"] + "< to >" + pParcelTableRow["Parcel"] + "<");

				if (String(compareTableRow["Parcel"]) == String(pParcelTableRow["Parcel"])) {
					//aa.print("---- found match");
					if (parcelFound) {
						//aa.print("**** splicing " + pParcelTableRow["Parcel"]);
						pParcelTable.splice(indexPT, 1);
						indexPT = indexPT - 1;
					} else {
						parcelFound = true;
						//aa.print("---- setting parcelFound = " + parcelFound);
					}

				}
			}
		}
	} catch (err) {
		logDebug("A JavaScript Error occurred in custom function removeDuplicateParcelsFromTable(): " + err.message);
		//aa.print("A JavaScript Error occurred in custom function removeDuplicateParcelsFromTable(): " + err.message);
	}
}