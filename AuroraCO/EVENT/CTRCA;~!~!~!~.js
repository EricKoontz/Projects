//Needed to get GIS feature associated when created by ACA
//Copy Parcel GIS Objects to Record using function copyParcelGisObjects()
try{
	copyParcelGisObjects();
	var codeDistrict = new Array;
	codeDistrict = getGISBufferInfo("AURORACO","Code Enforcement Areas","0.01","CODE_NUMBER")
	if(codeDistrict && codeDistrict.length > 0){
		addParcelDistrict(null,codeDistrict[0]["CODE_NUMBER"]);
	}
	params = aa.util.newHashtable();
	var record = aa.cap.getCap(capId).getOutput();
	var capType=record.getCapType();
	capType=capType.toString();
	var appTypeArray= new Array();
	appTypeArray=capType.split("/");
	addParameter(params, "$$appTypeFirstLevel$$", appTypeArray[0]);
	
	var phoneNumber = "";
	var module = appTypeArray[0];
	if(module == "Building"){
	
	phoneNumber = "303-739-7000"
	
	}
	if(module == "Planning"){
	
	phoneNumber = "303-739-7000"
	
	}
	if(module == "Enforcement"){
	
	phoneNumber = "303-739-7000"
	
	}
	if(module == "PublicWorks"){
	
	phoneNumber = "303-739-7300"
	
	}
	if(module == "Water"){
	
	phoneNumber = "303-739-7370"
	
	}
	
	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
    addParameter(params,"$$acaURL$$",acaSite);
	addParameter(params, "$$deptPhoneNumber$$", phoneNumber);
	//getACARecordParam4Notification(params,acaUrl);
	addParameter(params, "$$recordAlias$$", cap.getCapType().getAlias());
	//addParameter(params, "$$acaRecordUrl$$", acaUrl);
	getRecordParams4Notification(params);
	getContactParams4Notification(params,"Applicant");
	getContactParams4Notification(params,"License Holder");
	getContactParams4Notification(params,"Constituent");
	getContactParams4Notification(params,"Complainant");
	getContactParams4Notification(params,"Reporting Party");
	getContactParams4Notification(params,"Contact");
	getContactParams4Notification(params,"Arborist Applicant");
	getContactParams4Notification(params,"Contractor Applicant");
	getContactParams4Notification(params,"Responsible Party");
	
	sendNotification("noreply@auroragov.org",params.get("$$applicantEmail$$"),"","GLOBAL SUBMISSION #416",params,null); 
	
} catch (err) {
	logDebug("A JavaScript Error occurred: CTRCA:*/*/*/*: copyParcelGisObjects():" + err.lineNumber + ". Err Message: " + err.message);
	logDebug("Stack: " + err.stack);
};

 function getRecordParams4Notification(params) {

	// pass in a hashtable and it will add the additional parameters to the table



	addParameter(params, "$$altID$$", capIDString);

	addParameter(params, "$$capName$$", capName);

	addParameter(params, "$$capStatus$$", capStatus);

	addParameter(params, "$$fileDate$$", fileDate);

	//addParameter(params, "$$workDesc$$", workDescGet(capId));

	addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));

	

	return params;

}

 function getContactParams4Notification(params,conType) {

	// pass in a hashtable and it will add the additional parameters to the table

	// pass in contact type to retrieve



	contactArray = getContactArray();



	for(ca in contactArray) {

		thisContact = contactArray[ca];



		if (thisContact["contactType"] == conType) {



			conType = conType.toLowerCase();



			addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);

			addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);

			addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);

			addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);

			addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);

			addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);

			addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);

			addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);

			addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);

			addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);

			addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);

			addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);

			addParameter(params, "$$" + conType + "City$$", thisContact["city"]);

			addParameter(params, "$$" + conType + "State$$", thisContact["state"]);

			addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);

			addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);

			addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);

			addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);

			addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);

		}

	}



	return params;	

}

//Begin script to link amendment to application when user Defers Payment in ACA, see script 36
var vParentId;
vParentId = "" + aa.env.getValue("ParentCapID");
if (vParentId == false || vParentId == null || vParentId == "") {
	var vAppId = getAppSpecific("Application ID");
	if (vAppId != "" && vAppId != null) {
		addParent(vAppId);
	}
}