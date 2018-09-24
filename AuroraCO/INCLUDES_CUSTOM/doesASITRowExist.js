/*===========================================

Title : doesASITRowExist

Purpose : checks to see if a row exists with a specified column having a specified value

Author: Deanna Hoops		

Functional Area : ASIT,  custom list

Description : returns true if an ASIT exists of the given name that has a row with a 
	a column of the specified name having a value equal to the specified value

Reviewed By: DMH

Script Type : (EMSE, EB, Pageflow, Batch): EMSE

General Purpose/Client Specific : General

Client developed for : 

Parameters:
	tName - string. Name of table
	cName - string. Name of column
	cValue - string. Value that column should have 

=========================================== */
function doesASITRowExist(tName, cName, cValue) {
	//return false;
	// optional : capId
	itemCap = capId;
	if (arguments.length > 3)
		itemCap = arguments[3];
	try {
		tempASIT = loadASITable(tName, itemCap);
		if (tempASIT == undefined || tempASIT == null) return false;
		var rowFound = false;
		for (var ea in tempASIT) {
	 		var row = tempASIT[ea];
	                fv = "" + row[cName].fieldValue;
	                cValue = "" + cValue;
	                r = new RegExp("^" + cValue + "(.)*"); 
	
			if ((String(fv).match(r)) || (fv == cValue)) {
	 				return true;
	                                
	                }
		}
		return rowFound;
	}
	catch (err) { logDebug(err); return false; }
}