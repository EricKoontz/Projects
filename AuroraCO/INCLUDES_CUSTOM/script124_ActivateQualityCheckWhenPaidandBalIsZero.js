//Script 124
//Record Types:	​PublicWorks/Pavement Design/NA/NA​
//Event: 		PRA - Payment Received After
//Desc:			if Record Status is Payment Pending and when payment received and balance = 0 
//					then
//						Activate Quality Check with Due date Today + 1 
//						and update record status to Submitted 
//				(check with client if the record status should change and perhaps add status of Paid?)
//Created By: Silver Lining Solutions

function script124_ActivateQualityCheckWhenPaidandBalIsZero() {
	logDebug("script124_ActivateQualityCheckWhenPaidandBalIsZero() started.");
	try{
		if ( capStatus == "Payment Pending") {
			if ( balanceDue == 0 ) {
				activateTask("Quality Check");
				editTaskDueDate("Quality Check", dateAdd(null,1));
				updateAppStatus("Submitted");
				logDebug("script124: Set Quality Check Activated due date tomorrow and capStatus is Submitted!");
			}
		}
	}
	catch(err){
		showMessage = true;
		comment("Error on custom function script124_ActivateQualityCheckWhenPaidandBalIsZero(). Please contact administrator. Err: " + err);
		logDebug("Error on custom function script124_ActivateQualityCheckWhenPaidandBalIsZero(). Please contact administrator. Err: " + err);
	}
	logDebug("script124_ActivateQualityCheckWhenPaidandBalIsZero() ended.");
};//END script124_ActivateQualityCheckWhenPaidandBalIsZero();
