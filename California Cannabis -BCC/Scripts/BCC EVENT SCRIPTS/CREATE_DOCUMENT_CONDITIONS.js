/*
var docsMissing = false;
var showList = false;
var addConditions = true;
var addTableRows = false;
var conditionType = "License Required Documents";
r = getRequiredDocuments(false);

if (r.length > 0) {
	for (x in r) {
		var dr = r[x].condition;

		var publicDisplayCond = null;
		if (dr) {
			ccr = aa.capCondition.getStandardConditions(conditionType, dr).getOutput();
			for (var i = 0; i < ccr.length; i++)
				if (ccr[i].getConditionDesc().toUpperCase() == dr.toUpperCase())
					publicDisplayCond = ccr[i];
		}

		if (dr && ccr.length > 0 && addConditions && !appHasCondition(conditionType, null, dr, null)) {
			addStdCondition(conditionType, dr);
		}

		if (dr && ccr.length > 0 && addTableRows) {
			row = new Array();
			row["Document Type"] = new asiTableValObj("Document Type", dr, "Y");
			row["Description"] = new asiTableValObj("Description", publicDisplayCond.getPublicDisplayMessage(), "Y");
			conditionTable.push(row);
		}
	}
}

if (r.length > 0 && showList && docsMissing) {
	comment("</ol></div>");
}
*/
syncRequirementConditions();
