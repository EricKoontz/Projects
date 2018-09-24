/*===========================================
Title : getObjectIdValue 
Purpose : Returns an attribute from a layer in GIS with proximity parameters 
Author : Paul Rose
Functional Area : GIS
Description : Otional parameters for buffer distance allow you to shrink or enlarge
              the GIS feature on the record when overlaying the target layer in GIS.
              Using -1 "feet" will shrink the parcel shape to help eleminate touching
              features that the parcel is not actually within.
Reviewed By : 
Script Type : EMSE
General Purpose/Client Specific : General
Client developed for : 
Parameters : 
	svc: Text:  GIS service name, usually found on the map
	layer: Text: GIS layer name, found in GIS map layers list
Example: getObjectIdValue("KGIS","Intersections");
=========================================== */
function getObjectIdValue(svc,layer) 
{
	try{	
		var retString;
	   	// aa.gis.getCapGISObjects(capId).getOutput()[0].getGISObjects()[0].getGisObjectModel().getGISLayerId();
		var gisObjResult = aa.gis.getCapGISObjects(capId); // get GIS objects on the cap
		if (gisObjResult.getSuccess()) 	
			var fGisObj = gisObjResult.getOutput();
		else
			{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }
	
		for (a1 in fGisObj) // for each GIS object on the Cap, look for specific layer name to get ID field
			{
			var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);
	
			if (bufchk.getSuccess())
				var proxArr = bufchk.getOutput();
			else
				{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
			
			for (a2 in proxArr)
				{
				var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
				for (z1 in proxObj)
					{
					var v = proxObj[z1].getAttributeValues()
					retString = v[0];
					}
				
				}
			}
		return retString;
	}
	catch (err) {
		logDebug("A JavaScript Error occurred: function getGISObjectIdValue: " + err.message);
		logDebug(err.stack);
	}
}
/***************************************************************************/