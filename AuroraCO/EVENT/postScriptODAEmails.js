//postScript to send emails to staff from custom fields

try {

	var projMgr = getAppSpecific("ODA Project Manager");
	var projCoor = getAppSpecific("ODA Project Coordinator");
	logDebug("projMgr: " + projMgr);
	logDebug("projCoor: " + projCoor);

	// get PM's email
	var pmFull = projMgr.split(' ');
	var pmFirst = pmFull[0];
	var pmLast = pmFull[pmFull.length - 1];
	
	logDebug("pmFirst: " + pmFirst);
	logDebug("pmLast: " + pmLast);

	userObj = aa.person.getUser(pmFirst, "", pmLast).getOutput();
	var pmEmail = userObj.getEmail();
	logDebug("pmEmail: " + pmEmail);
	
	// get projCoor's email
	var pcFull = projCoor.split(' ');
	var pcFirst = pcFull[0];
	var pcLast = pcFull[pcFull.length - 1];
	
	logDebug("pcFirst: " + pcFirst);
	logDebug("pcLast: " + pcLast);

	userObj = aa.person.getUser(pcFirst, "", pcLast).getOutput();
	var pcEmail = userObj.getEmail();
	logDebug("pcEmail: " + pcEmail);
	
	// will need to get the params for this template
	
	sendNotification("noreply@auroraco.gov", pmEmail, "", "TEST_FOR_SCRIPTS", null, null);
	sendNotification("noreply@auroraco.gov", pcEmail, "", "TEST_FOR_SCRIPTS", null, null);
	
}catch (err) {
	logDebug("A JavaScript Error occured: " + err.message);
}