var stdChoice = aa.env.getValue("StdChoice");
var stdValue = aa.env.getValue("StdValue");
var stdDesc = aa.env.getValue("StdDesc");

//var stdChoice = "FACET_RC_SEQUENCE";
//var stdValue = "2017";
//var stdDesc = "0";

try {

	//check if stdChoice and stdValue already exist; if they do, update;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);
	if (!bizDomScriptResult.getSuccess()) {
		aa.print("Std Choice(" + stdChoice + "," + stdValue + ") does not exist to edit, adding...");
		if (addLookup(stdChoice, stdValue, stdDesc)) {
			aa.env.setValue("returnCode", "0"); // success
			aa.env.setValue("returnValue", "success");

		} else {
			aa.env.setValue("returnCode", "-1"); // error
			aa.env.setValue("returnValue", "error creating new std choice(" + stdChoice + "," + stdValue + ")");
		}

	} else {
		var bds = bizDomScriptResult.getOutput();
		var bd = bds.getBizDomain();

		bd.setDescription(stdDesc);
		var editResult = aa.bizDomain.editBizDomain(bd);

		if (editResult.getSuccess()) {
			aa.env.setValue("returnCode", "0"); // success
			aa.env.setValue("returnValue", "success");
			aa.print("Successfully edited Std Choice(" + stdChoice + "," + stdValue + ") = " + stdDesc);
		} else {
			aa.env.setValue("returnCode", "-1"); // error
			aa.env.setValue("returnValue", editResult.getErrorMessage());
			aa.print("**ERROR editing Std Choice " + editResult.getErrorMessage());
		}
	}
} catch (err) {
	aa.env.setValue("returnCode", "-1"); // error
	aa.env.setValue("returnValue", err.message);
	aa.print(err.message);
}

function addLookup(stdChoice, stdValue, stdDesc) {
	//check if stdChoice and stdValue already exist; if they do, don't add
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);
	if (bizDomScriptResult.getSuccess()) {
		aa.print("Standard Choices Item " + stdChoice + " and Value " + stdValue + " already exist.  Lookup is not added or updated.");
		return false;
	}

	//Proceed to add
	var strControl;

	if (stdChoice != null && stdChoice.length && stdValue != null && stdValue.length && stdDesc != null && stdDesc.length) {
		var bizDomScriptResult = aa.bizDomain.createBizDomain(stdChoice, stdValue, "A", stdDesc)

			if (bizDomScriptResult.getSuccess()) {
				//check if new Std Choice actually created
				aa.print("Successfully created Std Choice(" + stdChoice + "," + stdValue + ") = " + stdDesc);
				return true;
			} else {
				aa.print("**ERROR creating Std Choice " + bizDomScriptResult.getErrorMessage());
				return false;
			}
	} else {
		aa.print("Could not create std choice, one or more null values");
		return false;
	}
}
