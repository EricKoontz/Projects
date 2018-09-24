
/**
 * finds parent record from an ASI field, check if this parent is of certain type and creates a relation
 * 
 * @param asiFieldName field name to get parent capId from
 * @param parentRequiredType 4 levels record type that parent should match, <b>pass</b> null to ignore
 * 
 * @returns {Boolean} true if parent exist, matches criteria and no errors, false otherwise
 **/
function establishCivilPlanParentRelationship(asiFieldName, parentRequiredType) {
	var olduseAppSpecificGroupName = useAppSpecificGroupName;
	useAppSpecificGroupName = false;
	var asiValue = getAppSpecific(asiFieldName);
	useAppSpecificGroupName = olduseAppSpecificGroupName;

	if (asiValue == null || asiValue == "") {
		logDebug("**WARN Custom Field value is null or empty" + asiFieldName);
		return false;
	}

	var thisParentCapId = aa.cap.getCapID(asiValue);
	if (!thisParentCapId.getSuccess()) {
		logDebug("**WARN " + asiFieldName + " = " + asiValue + " // failed to get ParentCapId:" + thisParentCapId.getErrorMessage());
		return false;
	}//get parent capId success

	thisParentCapId = thisParentCapId.getOutput();
	var thisParentCapModel = aa.cap.getCap(thisParentCapId).getOutput();
	if (thisParentCapModel == null) {
		logDebug("**WARN get parent capModel: " + thisParentCapModel.getErrorMessage());
		return false;
	}

	var parentType = thisParentCapModel.getCapType().getValue();
	if (parentType == null) {
		return false;
	}

	if (parentRequiredType != null && !parentRequiredType.equalsIgnoreCase(parentType)) {
		logDebug("parentRequiredType:" + parentRequiredType + " != parentType:" + parentType);
		return false;
	}

	var childs = getChildren("*/*/*/*", capId);
	if (childs != null && childs.length > 0) {
		logDebug("**WARN this cap has childs:" + capId);
		return false;
	}

	//createAppHierarchy
	var hierarchy = aa.cap.createAppHierarchy(thisParentCapId, capId);
	if (!hierarchy.getOutput()) {
		logDebug("**ERROR hierarchy failed: " + hierarchy.getErrorMessage());
		return false;
	}
	return true;
}