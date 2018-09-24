/*==========================================================================================
Title : STDBASE_LICENSE_ISSUANCE

Purpose : Creates license record, LPs, expiration dates and relationships

Author: David Bischof

Functional Area : 

Description : JSON must contain :
				"Licenses/Taxi/Business/Application" : {  							//record type to run
						"WorkflowTaskUpdateAfter/Issuance/Issued":{					//event to run (supports workflow task and status and inspection type and status)
							"parentLicense" : "Licenses/Taxi/Business/License",		//OPTIONAL parent license to create
							"issuedStatus" : "Active",								//Record Status and Expiration Status of the license
							"copyCF" : true,										//copy custom fields
							"copyCT" : true,										//copy custom tables
							"expirationType" : "Expiration Code",					//expiration type.  Supports "Expiration Code" configuration, "Days" or Function
							 "customExpirationFunction": "calcExpirationDateByZip"   // custom function to calculate the license expirey date .
							"expirationPeriod" : "", 								//OPTIONAL Required only if using Days
							"refLPType"  : "Business",                              //Which LP type to create
							"contactType"  : "Agent",                               //Which contact to use for LP data
							"createLP" : true,                                      //create LP or not
							"licenseTable" : "VEHICLE INFORMATION",                 //OPTIONAL create license from a table.  Will turn ASIT to ASI on license
							"childLicense" : "Licenses/Taxi/Vehicle/License",		//What type of child recprd type if above is entered
							"recordIdField" : "Child App Number Link"               //OPTIONAL Which field to enter in the license number for tracking
						}
					}


Reviewed By: 

Script Type : (EMSE, EB, Pageflow, Batch): EMSE

General Purpose/Client Specific : General

Client developed for : Louisville

Parameters:
				itemCap - capIdObject
				recordSettings - JSON rule
				
				
update by :  Haetham Eleisah handle custom expiration function to calculate the license expiration date.
================================================================================================================*/
var scriptSuffix = "LICENSE_ISSUANCE";
// CONF_{SOLUTION}_LICENSE_ISSUANCE
// {SOLUTION} = AS DEFINED IN THE "SOLUTION MAPPING" STANDARD CHOICE

try {
	// This should be included in all Configurable Scripts
	var settingsArray = [];
	if (isConfigurableScript(settingsArray, scriptSuffix)) {

		for (s in settingsArray) {

			var rules = settingsArray[s];
			logDebug("rules: " + rules);

			//Execute PreScript
			var preScript = handleUndefined(rules.preScript);
			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}

			//Execute licenseIssuance
			licenseIssuance(capId, rules);

			//Execute Post Script
			var postScript = handleUndefined(rules.postScript);
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}
	}

} catch (ex) {
	logDebug("**ERROR:Exception while verifying the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * Standard base script for License Issuance
 * 
 * @param {CapIdObject} itemCapId 
 * @param {Array} recordSettings
 */
function licenseIssuance(itemCapId, recordSettings) {
	var functionTitle = "licenseIssuance()";
	var debugMode = true;
	// validate JSON parameters using handleUndefined function blah
	// handleUndefine(JSON Parameter, isRequired);
	var rParentLicense = handleUndefined(recordSettings.parentLicense, false);
	var rIssuedStatus = handleUndefined(recordSettings.issuedStatus, false);
	var rLicTable = handleUndefined(recordSettings.licenseTable, false);
	var rCustomExpirationFunction = handleUndefined(recordSettings.customExpirationFunction, false);
	var rHasParent, rLicAppArray, rNewLicId, rNewLicIdString, rVehData, rChildVehId, rC1ExpResult, rB1Model;

	if (rParentLicense != "") {
		rHasParent = true;
		rLicAppArray = rParentLicense.split("/");

		//create license
		rNewLicId = createParent(rLicAppArray[0], rLicAppArray[1], rLicAppArray[2], rLicAppArray[3], null);

		if (!rNewLicId) {
			logDebug("**WARN Failed to createParent() of type:" + rParentLicense);
			return false;
		}

		//call ASA of new record
		var newCap = aa.cap.getCap(rNewLicId).getOutput();
		aa.cap.runEMSEScriptAfterApplicationSubmit(newCap.getCapModel(), rNewLicId);

		rNewLicIdString = rNewLicId.getCustomID();

		if (rIssuedStatus != null && rIssuedStatus != "") {
			updateAppStatus(rIssuedStatus, "", rNewLicId);
		}
		if (recordSettings.copyCF) {
			copyASIFields(itemCapId, rNewLicId);
		}
		if (recordSettings.copyCT) {
			copyASITables(itemCapId, rNewLicId);
		}

		//handle Expiration	
		rB1ExpResult = aa.expiration.getLicensesByCapID(rNewLicId).getOutput();

		//Get Next Expiration Date if using Expiration Code
		if (recordSettings.expirationType == "Expiration Code") {
			var rExpBiz = aa.proxyInvoker.newInstance("com.accela.aa.license.expiration.ExpirationBusiness").getOutput();
			rB1Model = rB1ExpResult.getB1Expiration();
			rNextDate = rExpBiz.getNextExpDate(rB1Model);
			rB1ExpResult.setExpDate(aa.date.parseDate(dateAdd(rNextDate, 0)));
		}

		if (recordSettings.expirationType == "Days") {
			rB1ExpResult.setExpDate(aa.date.parseDate(dateAdd(aa.util.now(), recordSettings.expirationPeriod)));
		}
		if (recordSettings.expirationType == "Function" && rCustomExpirationFunction != null && rCustomExpirationFunction != "") {
			var dateCalculationFuntion = rCustomExpirationFunction + "( rB1ExpResult )";
			var dateResult = eval("(" + dateCalculationFuntion + ")");
			if (dateResult instanceof Date) {
				rB1ExpResult.setExpDate(aa.date.parseDate(dateAdd(dateResult, 0)));
			} else {
				logDebug("WARNING: Custom Function returned values does not accepted as date");
			}

		}
		rB1ExpResult.setExpStatus(rIssuedStatus);
		aa.expiration.editB1Expiration(rB1ExpResult.getB1Expiration());
	}

	if (recordSettings.createLP) {
		//create LP
		createRefLP4Lookup(rNewLicIdString, recordSettings.refLPType, recordSettings.contactType, null);
		//Set Business Name and Exp Date
		rNewLP = aa.licenseScript.getRefLicensesProfByLicNbr(aa.serviceProvider, rNewLicIdString).getOutput();
		if (rNewLP) {
			rThisLP = rNewLP[0];
			rThisLP.setLicenseIssueDate(aa.date.parseDate(dateAdd(aa.util.now(), 0)));

			if (rHasParent && recordSettings.expirationType == "Expiration Code") {
				rThisLP.setLicenseExpirationDate(aa.date.parseDate(dateAdd(rNextDate, 0)));
			}

			if (!rHasParent && recordSettings.expirationType == "Expiration Code") {
				rB1ExpResult = aa.expiration.getLicensesByCapID(itemCapId).getOutput();
				var rExpBiz = aa.proxyInvoker.newInstance("com.accela.aa.license.expiration.ExpirationBusiness").getOutput();
				rB1Model = rB1ExpResult.getB1Expiration();

				rNextDate = rExpBiz.getNextExpDate(rB1Model);
				rB1ExpResult.setExpDate(aa.date.parseDate(dateAdd(rNextDate, 0)));
				aa.expiration.editB1Expiration(rB1ExpResult.getB1Expiration());
				rThisLP.setLicenseExpirationDate(aa.date.parseDate(dateAdd(rNextDate, 0)));
			}

			if (recordSettings.expirationType == "Days") {
				rThisLP.setLicenseExpirationDate(aa.date.parseDate(dateAdd(aa.util.now(), recordSettings.expirationPeriod)));
			}
			if (recordSettings.expirationType == "Function" && rCustomExpirationFunction != null && rCustomExpirationFunction != "") {
				var dateCalculationFuntion = rCustomExpirationFunction + "( rNewLP )";
				var dateResult = eval("(" + dateCalculationFuntion + ")");

				if (dateResult instanceof Date) {
					rThisLP.setLicenseExpirationDate(aa.date.parseDate(dateAdd(dateResult, 0)));
				}
			}
			var editRefResult = aa.licenseScript.editRefLicenseProf(rThisLP);
			if (rHasParent) {
				aa.licenseScript.associateLpWithCap(rNewLicId, rThisLP);
			}
		}
	}

	//Handle Tabular Licensing

	if (recordSettings.licenseTable != "") {
		var ASITRowsArray = [];
		rLicChildArray = recordSettings.childLicense.split("/");
		rLicTable = loadASITable(recordSettings.licenseTable);
		for (x in rLicTable) {
			rVehData = rLicTable[x];
			if (rHasParent) {
				rChildVehId = createChild(rLicChildArray[0], rLicChildArray[1], rLicChildArray[2], rLicChildArray[3], null, itemCapId);
			} else {
				rChildVehId = createChild(rLicChildArray[0], rLicChildArray[1], rLicChildArray[2], rLicChildArray[3], null, rNewLicId);
			}
			if (rIssuedStatus != null && rIssuedStatus != "")
				updateAppStatus(rIssuedStatus, "", rChildVehId);

			rC1ExpResult = aa.expiration.getLicensesByCapID(rChildVehId).getOutput();

			//Get Next Expiration Date if using Expiration Code
			if (recordSettings.expirationType == "Expiration Code") {
				var rExpBiz = aa.proxyInvoker.newInstance("com.accela.aa.license.expiration.ExpirationBusiness").getOutput();
				rB1Model = rC1ExpResult.getB1Expiration();

				rNextDate = rExpBiz.getNextExpDate(rB1Model);
				rC1ExpResult.setExpDate(aa.date.parseDate(dateAdd(rNextDate, 0)));
			}

			if (recordSettings.expirationType == "Days") {
				rC1ExpResult.setExpDate(aa.date.parseDate(dateAdd(aa.util.now(), recordSettings.expirationPeriod)));
			}
			if (recordSettings.expirationType == "Function" && rCustomExpirationFunction != null && rCustomExpirationFunction != "") {
				var dateCalculationFuntion = rCustomExpirationFunction + "( rC1ExpResult )";
				var dateResult = eval("(" + dateCalculationFuntion + ")");
				if (dateResult instanceof Date) {
					rC1ExpResult.setExpDate(aa.date.parseDate(dateAdd(dateResult, 0)));
				}
			}

			rC1ExpResult.setExpStatus(rIssuedStatus);
			aa.expiration.editB1Expiration(rC1ExpResult.getB1Expiration());
			var ASITRow = UpdateASITRow(x, recordSettings.recordIdField, rChildVehId.getCustomID());
			ASITRowsArray.push(ASITRow);
			if (recordSettings.createLP && rNewLP != null && rNewLP.length > 0) {
				aa.licenseScript.associateLpWithCap(rChildVehId, rThisLP);
			}
		}

		////
		if (ASITRowsArray.length > 0) {
			updateASITColumns(ASITRowsArray, recordSettings.licenseTable);
		}

	}
}
// this function update ASIT row with the new value
function UpdateASITRow(row, name, value) {
	var field = {};
	field.row = row;
	field.name = name;
	if (value == null) {
		value = "";
	}
	field.value = value;
	return field;

}
//this function check if the field is exists in the ASIT row
function hasField(fields, row, name) {

	var ret = false;
	for (x in fields) {
		var f = fields[x];
		if (f.row == row && f.name.toLowerCase() == name.toLowerCase()) {
			ret = true
			break;
		}
	}

	return ret;
}
// this function get the ASIT column value
function getASITFieldValue(fields, row, name) {
	var ret = null;
	for (x in fields) {
		var f = fields[x];
		if (f.row == row && f.name.toLowerCase() == name.toLowerCase()) {
			ret = f.value + "";
			break;
		}
	}
	return ret;
}
//this function to update the ASIT rows based on the new values
function updateASITColumns(asitRows, tableName) {

	if (asitRows.length == 0) {
		logDebug("**ERROR: : noting was sent to update");

	}
	//var tableName = asit.getTableName();
	if (tableName == "") {
		logDebug("ERROR: tableName cannot be Empty");
	}
	var tsm = aa.appSpecificTableScript.getAppSpecificTableModel(this.capId, tableName);

	if (!tsm.getSuccess()) {
		logDebug("ERROR: error retrieving app specific table " + tableName + " " + tsm.getErrorMessage());

	}

	var tsm = tsm.getOutput();
	var tsm = tsm.getAppSpecificTableModel();
	var cells = tsm.getTableField();
	var NumberOfCells = cells.size();
	var newtableFields = aa.util.newArrayList();
	var fields = tsm.getTableFields().iterator();
	var columns = aa.util.newArrayList();
	var columnScripts = tsm.getColumns();
	var NumberOfColumns = columnScripts.size();
	var NumberOfRows = Math.ceil(NumberOfCells / NumberOfColumns);

	if (NumberOfColumns < 0) {
		logDebug("invalid number of columns");
	}
	// set columns
	var colNames = [];
	for (var iterator = columnScripts.iterator(); iterator.hasNext();) {
		var scriptModel = iterator.next();
		columns.add(scriptModel.getColumnModel());
		colNames.push(scriptModel.getColumnName());
	}
	tsm.setColumns(columns);
	// set table fields
	var editedMsg = "";
	var edited = 0;
	for (var ri = 0; ri < NumberOfRows; ri++) {
		for (var colIndex = 0; colIndex < NumberOfColumns; colIndex++) {
			var cname = colNames[colIndex];
			var rowinIndexDB = fields.next().getRowIndex();
			var val = cells.get((ri * NumberOfColumns) + colIndex);
			if (hasField(asitRows, ri, cname)) {
				var newValue = getASITFieldValue(asitRows, ri, cname);
				editedMsg += "** " + cname + "[" + ri + "]=" + newValue + ", was " + val + "\n";
				val = newValue;
				edited++;

			}
			if (val == null) {
				val = "";
			}

			var res = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", [ val, columns.get(colIndex) ]);
			if (!res.getSuccess()) {
				logDebug("field creationg failed: " + res.getErrorMessage());
			}
			field = res.getOutput();
			field.setFieldLabel(cname);
			field.setRowIndex(rowinIndexDB);
			newtableFields.add(field);

		}

	}
	if (edited != asitRows.length) {
		logDebug("ERROR: Could not edit all edited fields! only " + edited + "/" + asitRows.length + " was edited:\n" + editedMsg);
	}
	tsm.setTableFields(newtableFields);

	var gsiBiz = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableBusiness").getOutput();
	gsiBiz.editAppSpecificTableInfos(tsm, this.capId, aa.getAuditID())
	logDebug("Successfully edited ASI Table: " + tableName + ". " + edited + " Cell(s) was edited:\n" + editedMsg);
	return edited;
}
