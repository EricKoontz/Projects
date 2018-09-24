/*===========================================
Title : getGISIdForLayer 
Purpose : Returns the GIS Feature ID value that is associated to a record by layer name 
Author : Paul Rose
Functional Area : GIS
Description : This function checks to see if an associated GIS Feature on current record
              exists for a specific layer and returns the GIS Feature ID or false.
Reviewed By : 
Script Type : EMSE
General Purpose/Client Specific : General
Client developed for : 
Parameters : 
	gisLayerID: Text: GIS layer name, found in GIS map layers list
Example: getGISIdForLayer(Parcels);
=========================================== */
function getGISIdForLayer(gisLayerID)
{
	try{
		//logDebug("Looking at CAP " + capId);
		var gisIdForLayer = "";
		var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
		if (gisObjResult.getSuccess()) 	
			var fGisObj = gisObjResult.getOutput();
		else
			{ logDebug("**WARNING: Getting GIS objects for CAP.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()); }
		
		for (a1 in fGisObj) { // for each GIS object on the Cap
			var gisTypeScriptModel = fGisObj[a1];
			var gisObjArray = gisTypeScriptModel.getGISObjects()
			for (b1 in gisObjArray) {
				var gisObjScriptModel = gisObjArray[b1];
				var gisObjModel = gisObjScriptModel.getGisObjectModel() ;
				//logDebug("GIS Service " + gisObjModel.getServiceID() + " GIS Layer " + gisObjModel.getLayerId() + " GIS Id " + gisObjModel.getGisId())
				if (gisLayerID == gisObjModel.getLayerId()) {
					//logDebug("gisIdForLayer " + gisIdForLayer + " GIS Layer " + gisObjModel.getLayerId() + " GIS Id " + gisObjModel.getGisId())
					gisIdForLayer = gisObjModel.getGisId();
				}
			}
		}
	
		if(typeof(gisIdForLayer) != 'undefined')
		{
			return gisIdForLayer;
		}
		else
		{
			return false;
		}
	}
	catch (err) {
		logDebug("A JavaScript Error occurred: function getGISIdForLayer: " + err.message);
		logDebug(err.stack);
	}
}
/***************************************************************************/