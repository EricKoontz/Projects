function removeParcelFromTable(pParcelTable, pParcelNo) {
	//remove all occurrences of a single parcel from ASI Table
	try {
		//aa.print("- Inside removeParcelFromTable()");
		//aa.print("- removing parcel #" + pParcelNo);

		var psn = 0;
		while (psn < pParcelTable.length) {
			var currentRow = pParcelTable[psn];
			//aa.print("-- currentRow[Parcel] = " + currentRow["Parcel"]);
			if (String(currentRow["Parcel"]) == String(pParcelNo)) {
				//aa.print("--- found match, splicing " + currentRow["Parcel"]);
				pParcelTable.splice(psn, 1);
				//aa.print("new parcelTable Table length = " + pParcelTable.length);
				psn -= 1;

			}
			psn += 1;
			//aa.print("new psn = " + psn);
		}

	} catch (err) {
		logDebug("A JavaScript Error occurred in custom function removeParcelFromTable(): " + err.message);
		//aa.print("A JavaScript Error occurred in custom function removeParcelFromTable(): " + err.message);
	}
}