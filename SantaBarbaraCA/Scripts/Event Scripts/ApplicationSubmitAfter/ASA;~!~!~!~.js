// call CSLB Interface for LP
try {
	var newLicNum = false; 
	newLicNum = getLPLicNum(capId);
	var newLicType = false; 
	newLicType = getLPLicType(capId);
	var conType = false;
	if(matches(newLicType,"Contractor","Electrical","Plumbing","Mechanical")) {
		conType = true;
	}

	var cslbMessage = null;
	cslbMessage = externalLP_CA_AT(newLicNum,newLicType,true,true,capId);
	if (conType && cslbMessage) {
		showMessage = true;
		comment(cslbMessage);
	}

}
catch (err) {
	logDebug("A JavaScript Error occurred: ASA;DSD!~!~!~ - CSLB Interface" + err.message);
} ;