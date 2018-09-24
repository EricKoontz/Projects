var paymentSeq = parseInt(aa.env.getValue("paymentSeq"));
var capId1 = aa.env.getValue("capId1");
var capId2 = aa.env.getValue("capId2");
var capId3 = aa.env.getValue("capId3");
var valueUDF1 = aa.env.getValue("valueUDF1");
var valueUDF2 = aa.env.getValue("valueUDF2");
var valueUDF3 = aa.env.getValue("valueUDF3");

/*
var paymentSeq = 4043892;
var capId1 = "DUB17";
var capId2 = "00000";
var capId3 = "0002D";
var valueUDF1 = "test1";
var valueUDF2 = "test2";
var valueUDF3 = "test3";
*/

var msg;

try {
	
	var capId = aa.cap.getCapID(capId1,capId2,capId3).getOutput();
	
	if (capId) {
		var payScriptModel = aa.finance.getPaymentByPK(capId,paymentSeq,"ADMIN").getOutput();
		if (payScriptModel) {
			var result = aa.cashier.editPaymentUDFAndReceivedType(capId, paymentSeq, valueUDF1, valueUDF2, valueUDF3, payScriptModel.getUdf4(),payScriptModel.getReceivedType());
			if (!result.getSuccess()) {
				msg+= result.getErrorMessage()
			}
		}
		else {
			msg+= "Error obtaining payScriptModel";
		}
	}
	else {
		msg +="Error obtaining capId";
	}
		
} catch (err) {

	aa.env.setValue("returnCode", "-1"); // error
	aa.env.setValue("returnValue", err.message);
	aa.print(err.message);
}

if (msg) {
	aa.env.setValue("returnCode", "-1"); // error
	aa.env.setValue("returnValue", msg);
	aa.print(msg);
}
else {	
aa.env.setValue("returnCode", "0"); // success
aa.env.setValue("returnValue", "success updated");
aa.print("success");
}
