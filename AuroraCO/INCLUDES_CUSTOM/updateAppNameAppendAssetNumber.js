
/**
 * update appName, appends asi value to current name, if asi value not empty and not already appended
 * @param asiFieldName asi field that has the value
*/
function updateAppNameAppendAssetNumber(asiFieldName) {

	if (typeof AInfo[asiFieldName] !== 'undefined' && AInfo[asiFieldName] != null && AInfo[asiFieldName] != "") {
		var appName = cap.getSpecialText();
		var asiValue = AInfo[asiFieldName];

		if (appName == null) {
			appName = asiValue;
		} else {
			if (appName.indexOf(asiValue) == -1) {
				//prevent multiple concatenation
				appName = appName + " " + asiValue;
			}
		}

		//only update if value was changed
		if (appName != cap.getSpecialText()) {
			editAppName(appName);
		}
	}//asiField has Value

	return true;
}