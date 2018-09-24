//Script 185
//Record Types:	Building/*/*/* 
//Event: 		CTRCA(ACA) or ASA(Civic Platform)
//Desc:			When the application is submitted
//				Update the expiration date to 180 calendar days from the submission date.
//Created By: Silver Lining Solutions

function script185_UpdateAppExpDate180Days() {
	logDebug("script185_UpdateAppExpDate180Days() started.");
	try{
		editAppSpecific("Application Expiration Date",dateAdd(fileDate,180));
	}
	catch(err){
		showMessage = true;
		comment("Error on custom function script185_UpdateAppExpDate180Days(). Please contact administrator. Err: " + err);
		logDebug("Error on custom function script185_UpdateAppExpDate180Days(). Please contact administrator. Err: " + err);
	}
	logDebug("script185_UpdateAppExpDate180Days() ended.");
};//END script185_UpdateAppExpDate180Days();
