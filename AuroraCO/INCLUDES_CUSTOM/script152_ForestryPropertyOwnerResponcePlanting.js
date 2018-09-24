//Script 152
//Record Types:	Forestry/Request/Planting/NA
//Event: 		WTUA
//Desc:			When wfTask = “Property Owner Responce” has a wfStatus = “Plant Tree”
//				Then schedule a “Forestry Site Review” Inspection 
//				for current day + 5 business days. 
//
//
//Created By: Silver Lining Solutions

function script152_ForestryPropertyOwnerResponcePlanting() {
	logDebug("script152_ForestryPropertyOwnerResponcePlanting() started.");
	try{
		logDebug("script152_ForestryPropertyOwnerResponcePlanting: wf task is: "+wfTask);
		logDebug("script152_ForestryPropertyOwnerResponcePlanting: wf status is: "+wfStatus);
	
		if  ( wfTask == 'Property Owner Responce' && wfStatus == 'Plant Tree' )
		{
				// get date that is +5 BUSINESS days ahead   need to test on a wed/thurs/fri to see how date add works
/*			var businessDays = 7, counter = 0; // set to 1 to count from next business day
			while( businessDays>0 ){
				var tmp = new Date();
				tmp.setDate( tmp.getDate() + counter++ );
				switch( tmp.getDay() ){
						case 0: case 6: break;// sunday & saturday
						default:
							businessDays--;
						}; 
			}
*/
			scheduleInspection("Planting",5,null,null,null);
		}
	}
	catch(err){
		showMessage = true;
		comment("script152_ForestryPropertyOwnerResponcePlanting: Error on custom function script152_ForestryPropertyOwnerResponcePlanting(). Please contact administrator. Err: " + err);
		logDebug("script152_ForestryPropertyOwnerResponcePlanting: Error on custom function script152_ForestryPropertyOwnerResponcePlanting(). Please contact administrator. Err: " + err);
	}
	logDebug("script152_ForestryPropertyOwnerResponcePlanting() ended.");
};//END script152_ForestryPropertyOwnerResponcePlanting();
		