/*
Title : addParcelDistrict
Purpose : Add District value passed to function to a specific Parcel or All Parcels on a Record 
Author : Paul Rose
Functional Area : Inspections/APO/GIS
Description : This function, along with calls to GIS or other script lookups, can be used to add a
              District value to the Record's Parcel District tab. Example below shows getting the
              Inspection District from GIS and associating that District to all Parcels on a Record.
Reviewed By : 
Script Type : EMSE
General Purpose/Client Specific : General
Client developed for : 
Parameters : 
	parcelNum: Text:  Parcel Number of CAP or ""/null for All CAP Parcels
	districtValue: Text: Value of District to be added, normally comes from GIS layer attribute

Example: 
	//Parcel District for auto assign inspections
	try {
	var inspectionDistrict = getGISInfo2("SANDIEGO", "Inspection Districts", "INSPECTDST", -1, "feet");
	if (!matches(inspectionDistrict, null, "", "undefined")) {
		// logDebug("Inspection District: " + inspectionDistrict);
		addParcelDistrict("", inspectionDistrict);
	}
	} catch (err) {
		logDebug("A JavaScript Error occurred: (script name) - Parcel District for auto assign inspections" + err.message);
		logDebug(err.stack);
	};
*/

function addParcelDistrict(parcelNum, districtValue){
try{
if ("" + districtValue == "undefined") return;
//if parcelNum is null, district is is added to all parcels on CAP

if (!parcelNum) {
	var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
	if (capParcelResult.getSuccess())	{
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels) {
			apdResult = aa.parcel.addParceDistrictForDaily(capId.getID1(),capId.getID2(),capId.getID3(),Parcels[zz].getParcelNumber(),districtValue);
			
			//if (!apdResult.getSuccess())
			//	{ logDebug("**ERROR Adding District " + districtValue + " to parcel #" + Parcels[zz].getParcelNumber() + " : " + apdResult.getErrorMessage()) ; return false ; }
			//else
			//	logDebug("Successfully added district " + districtValue + " to parcel #" + Parcels[zz].getParcelNumber());

			//}
		}
	}
}
else	{
	apdResult = aa.parcel.addParceDistrictForDaily(capId.getID1(),capId.getID2(),capId.getID3(),parcelNum,districtValue);

	//if (!apdResult.getSuccess())
	//	{ logDebug("**ERROR Adding District " + districtValue + " to parcel #" + parcelNum + " : " + apdResult.getErrorMessage()) ; return false ; }
	//else
	//	logDebug("Successfully added district " + districtValue + " to parcel #" + parcelNum);
	//}
}
}
catch (err) {
	logDebug("A JavaScript Error occurred: function addParcelDistrict: " + err.message);
	logDebug(err.stack);	
}
}