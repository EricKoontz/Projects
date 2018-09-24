//Script 16
//Record Types:	Building/*/*/* and Fire/*/*/*
//Event: 		CTRCA(ACA) or ASA(Civic Platform)
//Desc:			If the Application Name field is empty
//				Action:	Take any address fields that have data in them and concatenate those 
//						fields and update the application name field with the result.
//Created By: Silver Lining Solutions

function script16_FillApplicationNameWhenEmpty() {
	aa.print("script16_FillApplicationNameWhenEmpty() started.");
	try{
		var thisCap = aa.cap.getCap(capId).getOutput();
		var thisCapSpclText = thisCap.getSpecialText();
		if ( thisCapSpclText == null ) {
			//Get address(es) on current CAP
			var myAddr = aa.address.getAddressByCapId(capId);
			if (!myAddr.getSuccess()) {
				logDebug("**ERROR: getting CAP addresses: " + myAddr.getErrorMessage());
				return false;
			}
			var addrArray = new Array();
			var addrArray = myAddr.getOutput();
			if (addrArray.length == 0 || addrArray == undefined) {
				logDebug("The current CAP has no address.  Unable to get CAPs with the same address.")
				return false;
			}
			//use 1st address
			var thisHouseNumberStart		= addrArray[0].getHouseNumberStart()== null ? "" : addrArray[0].getHouseNumberStart() + " ";
			var thisStreetDirection			= addrArray[0].getStreetDirection()== null ? "" : addrArray[0].getStreetDirection() + " ";
			var thisStreetName				= addrArray[0].getStreetName()== null ? "" : addrArray[0].getStreetName() + " ";
			var thisStreetSuffix			= addrArray[0].getStreetSuffix()== null ? "" : addrArray[0].getStreetSuffix() + " ";
			var thisStreetSuffixdirection	= addrArray[0].getStreetSuffixdirection()== null ? "" : addrArray[0].getStreetSuffixdirection() + " ";
			var thisUnitType				= addrArray[0].getUnitType()== null ? "" : addrArray[0].getUnitType() + " ";
			var thisUnitStart				= addrArray[0].getUnitStart()== null ? "" : addrArray[0].getUnitStart() + " ";
			var thisCity					= addrArray[0].getCity()== null ? "" : addrArray[0].getCity() + " ";
			var thisState					= addrArray[0].getState()== null ? "" : addrArray[0].getState() + " ";
			var thisZip						= addrArray[0].getZip()== null ? "" : addrArray[0].getZip();

			var newAppNameText = thisHouseNumberStart + thisStreetDirection + thisStreetName + thisStreetSuffix + thisStreetSuffixdirection + thisUnitType + thisUnitStart + thisCity + thisState + thisZip;
			thisCapModel = thisCap.getCapModel();
			thisCap.setSpecialText(newAppNameText);
			aa.cap.editCapByPK(thisCapModel);
		}
	}
	catch(err){
		showMessage = true;
		comment("Error on custom function script16_FillApplicationNameWhenEmpty(). Please contact administrator. Err: " + err);
		logDebug("Error on custom function script16_FillApplicationNameWhenEmpty(). Please contact administrator. Err: " + err);
	}
	logDebug("script16_FillApplicationNameWhenEmpty() ended.");
};//END script16_FillApplicationNameWhenEmpty();
