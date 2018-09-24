// Begin script to set the Owner Applicant information in the Owners ASIT to Read Only.
var vTableName = "LIST OF OWNERS";
var vOwnerTable = loadASITable(vTableName);
var vASITRow;
var x = 0;
var y = 0;
var vField;
var vChanges = false;
if (vOwnerTable && vOwnerTable != null && vOwnerTable.length > 0) {
	for (x in vOwnerTable) {
		vASITRow = vOwnerTable[x];
		//Owner Applicant will have a Sequence Number. All others will not.
		if (vASITRow["Contact Sequence Number"] != null && vASITRow["Contact Sequence Number"] != "") { 
			for (y in vASITRow) {
				if (y != "Title" && y != "Ownership Percentage") {
					vField = vASITRow[y];
					vField.readOnly = 'Y';
					vChanges = true;
				}
			}
			if (vChanges) {
				logDebug("Updating ASIT row to be readOnly");
			}
		}
	}
}
if (vChanges) {
	removeASITable(vTableName, capId);
	addASITable(vTableName, vOwnerTable, capId);
}
// End script to set the Owner Applicant information in the Owners ASIT to Read Only.