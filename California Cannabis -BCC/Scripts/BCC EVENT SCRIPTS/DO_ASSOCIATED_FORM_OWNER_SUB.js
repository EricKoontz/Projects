// Begin associated forms for owner data
//if (publicUser && getAppSpecific("Are you requesting a temporary license?") != "Yes") {
if (publicUser) {
	var newAfData = [{
			"Id": "1",
			"Alias": "Owner Submittal",
			"recordId": ""
		}
	];
	doAssocFormRecs(null, newAfData);
}
// End associated forms for owner data
