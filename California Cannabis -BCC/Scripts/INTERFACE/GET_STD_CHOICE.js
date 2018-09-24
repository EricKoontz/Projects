var stdChoice = aa.env.getValue("StdChoice");
var stdValue = aa.env.getValue("StdValue");
// testing
//var stdChoice = "FACET_RC_SEQUENCE";
//var stdValue = "2017";


try {

	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		aa.env.setValue("returnCode", "0"); // success
		aa.env.setValue("returnValue", strControl);
		aa.print("std choice(" + stdChoice + "," + stdValue + ") returned " + strControl);
	} else {
		aa.env.setValue("returnCode", "0"); // doesn't exist
		aa.env.setValue("returnValue", null);
		aa.print(null);
	}
} catch (err) {
	aa.env.setValue("returnCode", "-1"); // error
	aa.env.setValue("returnValue", err.message);
	aa.print(err.message);
}