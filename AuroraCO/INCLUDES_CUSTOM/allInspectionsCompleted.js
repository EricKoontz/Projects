
/**
 * check record if all inspections were completed
 * @param recordCapId record capId to check
 * @returns {Boolean} true if all inspections were completed, false otherwise
 */
function allInspectionsCompleted(recordCapId) {
	var t = aa.inspection.getInspections(recordCapId);
	if (t.getSuccess()) {
		var n = t.getOutput();
		for (xx in n)
			if (n[xx].getInspectionStatus().toUpperCase().equals("SCHEDULED"))
				return false;
	} else {
		logDebug("**ERROR failed to get inspections, error: " + t.getErrorMessage());
		return false;
	}
	return true;
}