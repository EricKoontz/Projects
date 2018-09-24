//Script 130
//Record Types:	Water/Water/Tap/Application
//Event: 		ApplicationSubmitAfter
//Desc:			IF
//					The custom field “Size of Water Meter” has a value greater than or equal to 3”
//					(Note – This is a dropdown field which includes increments of 1” up to 12” and 
//					then includes the field of other” which will classify this rule to run). 
//				THEN:
//					Then add the fee “WAT_TA_39” and the quantity from the 
//						custom field “Average Daily Demand(In GPD)” 
//					  but do NOT invoice the fee. 
//Created By: Silver Lining Solutions

function script130_AssessWaterMeterTapFeeWithAvgDailyDemand() {
	logDebug("script130_AssessWaterMeterTapFeeWithAvgDailyDemand() started.");
	try{
		var sizeOfWaterMeter = AInfo["Size of Water Meter"],
		waterMeterTapFeeItem = "WAT_TA_39",
		waterMeterTapFeeSchedule = "WAT_TA",
		waterMeterTapFeeQty = 0;

		sizeOfWaterMeter = Number(sizeOfWaterMeter.replace('"',''));

		logDebug("script130: sizeOfWaterMeter is: "+sizeOfWaterMeter);
		
		if (sizeOfWaterMeter >= 3)
		{
			waterMeterTapFeeQty = AInfo["Average Daily Demand(In GPD)"];

			if ( isNaN(waterMeterTapFeeQty) ) {
				logDebug("script130: Unable to assess fee because Average Daily Demand(In GPD) is not a number!");
			}
			else {
				logDebug("script130: Assessing Fee: "+waterMeterTapFeeSchedule+" :: "+waterMeterTapFeeItem+" with amount: "+parseFloat(waterMeterTapFeeQty));
				//Assess the fee
				newFeeSeq = addFee(waterMeterTapFeeItem, waterMeterTapFeeSchedule, 'FINAL', parseFloat(waterMeterTapFeeQty), 'N');
			}
		}
		else {
			logDebug("script130: size of Meter is less than 3 or Other - no fee auto assessment.");
		}
	}
	catch(err){
		showMessage = true;
		comment("Error on custom function script130_AssessWaterMeterTapFeeWithAvgDailyDemand(). Please contact administrator. Err: " + err);
		logDebug("Error on custom function script130_AssessWaterMeterTapFeeWithAvgDailyDemand(). Please contact administrator. Err: " + err);
	}
	logDebug("script130_AssessWaterMeterTapFeeWithAvgDailyDemand() ended.");
};//END script130_AssessWaterMeterTapFeeWithAvgDailyDemand();
