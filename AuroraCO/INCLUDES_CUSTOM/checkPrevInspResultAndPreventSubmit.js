
/**
 * Check insp type and result, when matched, check if prev required result exists
 * 
 * @param inspectionType type to match with current
 * @param reqInspResults {Array} result to match with current
 * @param preReqInspResult {Array} pre-required resuls for each reqInspResults (index must be same in each array, arrays should be same length)
 * @returns {Boolean} true if current result can be selected (has the pre-required or not within reqInspResults), false otherwise
 */
function checkPrevInspResultAndPreventSubmit(inspectionType, reqInspResults, preReqInspResult) {

	if (reqInspResults == null || preReqInspResult == null || reqInspResults.length != preReqInspResult.length) {
		cancel = true;
		showMessage = true;
		comment("checkPrevInspResultAndPreventSubmit: invalid method parameters");
		return false;
	}

	var prevResultExist = false;
	var inspections = null;
	var resultMatched = false;

	if (inspectionType == inspType) {
		for (s in reqInspResults) {
			if (inspResult == reqInspResults[s]) {
				resultMatched = true;
				//Load it once
				if (inspections == null) {
					inspections = aa.inspection.getInspections(capId);
					if (inspections.getSuccess()) {
						inspections = inspections.getOutput();
						if (inspections == null || inspections.length == 0) {
							logDebug("**INFO record inspections empty or null");
							prevResultExist = false;
							break;
						}
					} else {
						logDebug("**ERROR getInspections failed, " + inspections.getErrorMessage());
						prevResultExist = false;
						break;
					}
				}//not loaded before

				//find if older inspections has result of preReqInspResult[s]
				for (i in inspections) {
					var thisInsp = inspections[i];
					if (thisInsp.getInspectionType() == inspectionType && thisInsp.getInspectionStatus() == preReqInspResult[s]) {
						prevResultExist = true;
						break;
					}//type match
				}//for all inspections

				if (prevResultExist) {
					break;
				}
			}//inspResult matched
		}//for all insp results
	} else {
		return false;
	}

	if (!resultMatched) {
		//current result is not reqResult to check
		return true;
	}

	if (!prevResultExist) {
		cancel = true;
		showMessage = true;
		comment("Notices must be selected in ascending order to proceed.");
	}
	return prevResultExist;
}