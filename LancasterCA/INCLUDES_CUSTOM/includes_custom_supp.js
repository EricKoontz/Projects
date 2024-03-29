// 09/17/2018: Added the creationg of new ASIT on primary license back into update

// 08/07/2018: UPDATED  getParentCapVIAPartialCap

// 07/16/2018: ADDED checkPrimaryAppTenantInfo for ASB/Licenses/Cannabis/Primary/Application new requirement to restrict tenant info table input

// 07/12/2018: revised to change references of 'local' license to 'primary'

// 07/05/2018: REPLACING ENTIRE CONTENTS WITH THE INCLUDES FILE FROM PRODUCTION ENVIRONMENT - CHAD has copies of current work!

/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
	    available to all master scripts
|
| Notes   : createRefLicProf - override to default the state if one is not provided
|
|         : createRefContactsFromCapContactsAndLink - testing new ability to link public users to new ref contacts
/------------------------------------------------------------------------------------------------------*/
//eval( aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput().getMasterScript(aa.getServiceProviderCode(),"INCLUDES_CUSTOM","ADMIN").getScriptText() + "");


function createRefLicProf(rlpId,rlpType,pContactType)
	{
	//Creates/updates a reference licensed prof from a Contact
	//06SSP-00074, modified for 06SSP-00238
	var updating = false;
	var capContResult = aa.people.getCapContactByCapID(capId);
	if (capContResult.getSuccess())
		{ conArr = capContResult.getOutput();  }
	else
		{
		logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
		return false;
		}

	if (!conArr.length)
		{
		logDebug ("**WARNING: No contact available");
		return false;
		}


	var newLic = getRefLicenseProf(rlpId)

	if (newLic)
		{
		updating = true;
		logDebug("Updating existing Ref Lic Prof : " + rlpId);
		}
	else
		var newLic = aa.licenseScript.createLicenseScriptModel();

	//get contact record
	if (pContactType==null)
		var cont = conArr[0]; //if no contact type specified, use first contact
	else
		{
		var contFound = false;
		for (yy in conArr)
			{
			if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
				{
				cont = conArr[yy];
				contFound = true;
				break;
				}
			}
		if (!contFound)
			{
			logDebug ("**WARNING: No Contact found of type: "+pContactType);
			return false;
			}
		}

	peop = cont.getPeople();
	addr = peop.getCompactAddress();

	newLic.setContactFirstName(cont.getFirstName());
	//newLic.setContactMiddleName(cont.getMiddleName());  //method not available
	newLic.setContactLastName(cont.getLastName());
	newLic.setBusinessName(peop.getBusinessName());
	newLic.setAddress1(addr.getAddressLine1());
	newLic.setAddress2(addr.getAddressLine2());
	newLic.setAddress3(addr.getAddressLine3());
	newLic.setCity(addr.getCity());
	newLic.setState(addr.getState());
	newLic.setZip(addr.getZip());
	newLic.setPhone1(peop.getPhone1());
	newLic.setPhone2(peop.getPhone2());
	newLic.setEMailAddress(peop.getEmail());
	newLic.setFax(peop.getFax());

	newLic.setAgencyCode(aa.getServiceProviderCode());
	newLic.setAuditDate(sysDate);
	newLic.setAuditID(currentUserID);
	newLic.setAuditStatus("A");

	if (AInfo["Insurance Co"]) 		newLic.setInsuranceCo(AInfo["Insurance Co"]);
	if (AInfo["Insurance Amount"]) 		newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
	if (AInfo["Insurance Exp Date"]) 	newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
	if (AInfo["Policy #"]) 			newLic.setPolicy(AInfo["Policy #"]);

	if (AInfo["Business License #"]) 	newLic.setBusinessLicense(AInfo["Business License #"]);
	if (AInfo["Business License Exp Date"]) newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

	newLic.setLicenseType(rlpType);

	if(addr.getState() != null)
		newLic.setLicState(addr.getState());
	else
		newLic.setLicState("AK"); //default the state if none was provided

	newLic.setStateLicense(rlpId);

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess())
		{
		logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		return true;
		}
	else
		{
		logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		return false;
		}
	}


function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists)
	{

	// contactTypeArray is either null (all), or an array or contact types to process
	//
	// ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
	//
	// replaceCapContact not implemented yet
	//
	// overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
	//
	// refContactExists is a function for REF contact comparisons.
	//
	// Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES". 
	// This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will 
	// be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
	// choice determines the default action of all contact types.   Other types can be configured separately.   
	// Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization), 
	// "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).
	
	var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";
	
	
	var ingoreArray = new Array();
	if (arguments.length > 1) ignoreArray = arguments[1];
	
	var defaultContactFlag = lookup(standardChoiceForBusinessRules,"Default");

	var c = aa.people.getCapContactByCapID(pCapId).getOutput()
	var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets

	for (var i in c)
	   {
	   var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
	   var con = c[i];

	   var p = con.getPeople();
	   
	   var contactFlagForType = lookup(standardChoiceForBusinessRules,p.getContactType());
	   
	   if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
	   	{
	   	if (contactTypeArray && !exists(p.getContactType(),contactTypeArray))
			continue;  // not in the contact type list.  Move along.
		}
	
	   if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
	   	{
	   	ruleForRefContactType = defaultContactFlag;
	   	}
	   
	   if (contactFlagForType) // explicit contact type is indicated
	   	{
	   	ruleForRefContactType = contactFlagForType;
	   	}

	   if (ruleForRefContactType.equals("D"))
	   	continue;
	   	
	   var refContactType = "";
	   
	   switch(ruleForRefContactType)
	   	{
		   case "U":
		     refContactType = p.getContactType();
		     break;
		   case "I":
		     refContactType = "Individual";
		     break;
		   case "O":
		     refContactType = "Organization";
		     break;
		   case "F":
		     if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
		     	refContactType = "Organization";
		     else
		     	refContactType = "Individual";
		     break;
		}
	   
	   var refContactNum = con.getCapContactModel().getRefContactNumber();
	   
	   if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
	   	{
	   	if (overwriteRefContact)
	   		{
	   		p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
	   		p.setContactType(refContactType);
	   		
	   						var a = p.getAttributes();
			
							if (a)
								{
								var ai = a.iterator();
								while (ai.hasNext())
									{
									var xx = ai.next();
									xx.setContactNo(refContactNum);
									}
					}
					
	   		var r = aa.people.editPeopleWithAttribute(p,p.getAttributes());
	   		
			if (!r.getSuccess()) 
				logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage()); 
			else
				logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data"); 
			}
			
	   	if (replaceCapContact)
	   		{
				// To Be Implemented later.   Is there a use case?
			}
			
	   	}
	   	else  // user entered the contact freehand.   Let's create or link to ref contact.
	   	{
			var ccmSeq = p.getContactSeqNumber();

			var existingContact = refContactExists(p);  // Call the custom function to see if the REF contact exists

			var p = cCopy[i].getPeople();  // get a fresh version, had to mangle the first for the search

			if (existingContact)  // we found a match with our custom function.  Use this one.
				{
					refPeopleId = existingContact;
				}
			else  // did not find a match, let's create one
				{

				var a = p.getAttributes();

				if (a)
					{
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext())
						{
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(),ignoreAttributeArray))
							ai.remove();
						}
					}
				
				p.setContactType(refContactType);
				var r = aa.people.createPeopleWithAttribute(p,a);

				if (!r.getSuccess())
					{logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				var refPeopleId = p.getContactSeqNumber();

				logDebug("Successfully created reference contact #" + refPeopleId);
				
				// Need to link to an existing public user.
				
			    var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
			    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
			        var userModel = getUserResult.getOutput();
			        logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());
					
					if (refPeopleId)	{
						logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
						aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
						}
					}
				}

			//
			// now that we have the reference Id, we can link back to reference
			//

		    var ccm = aa.people.getCapContactByPK(pCapId,ccmSeq).getOutput().getCapContactModel();

		    ccm.setRefContactNumber(refPeopleId);
		    r = aa.people.editCapContact(ccm);

		    if (!r.getSuccess())
				{ logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
			else
				{ logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);}


	    }  // end if user hand entered contact 
	}  // end for each CAP contact
} // end function


function cntAssocGarageSales(strnum, strname, city, state, zip, cfname, clname)
{

	/***

	Searches for Garage-Yard Sale License records 
	- Created in the current year 
	- Matches address parameters provided
	- Matches the contact first and last name provided
	- Returns the count of records

	***/

	// Create a cap model for search
	var searchCapModel = aa.cap.getCapModel().getOutput();

	// Set cap model for search. Set search criteria for record type DCA/*/*/*
	var searchCapModelType = searchCapModel.getCapType();
	searchCapModelType.setGroup("Licenses");
	searchCapModelType.setType("Garage-Yard Sale");
	searchCapModelType.setSubType("License");
	searchCapModelType.setCategory("NA");
	searchCapModel.setCapType(searchCapModelType);

	searchAddressModel = searchCapModel.getAddressModel();
	searchAddressModel.setStreetName(strname);

	gisObject = new com.accela.aa.xml.model.gis.GISObjects;
	qf = new com.accela.aa.util.QueryFormat;

	var toDate = aa.date.getCurrentDate();
	var fromDate = aa.date.parseDate("01/01/" + toDate.getYear()); 
	
	var recordCnt = 0;
	message = "The applicant has reached the Garage-Sale License limit of 3 per calendar year.<br>"

	capList = aa.cap.getCapListByCollection(searchCapModel, searchAddressModel, "", fromDate, toDate, qf, gisObject).getOutput();
	for (x in capList)
	{
		resultCap = capList[x];
		resultCapId = resultCap.getCapID();
		altId = resultCapId.getCustomID();
		//aa.print("Record ID: " + altId);
		resultCapIdScript = aa.cap.createCapIDScriptModel(resultCapId.getID1(),resultCapId.getID2(),resultCapId.getID3() );
		contact = aa.cap.getCapPrimaryContact(resultCapIdScript).getOutput();
		
		contactFname = contact.getFirstName();
		contactLname = contact.getLastName();
		
		if(contactFname==cfname && contactLname==clname)
		{
			recordCnt++;
			message = message + recordCnt + ": " + altId + " - " + contactFname + " " + contactLname + " @ " + strnum + " " + strname + "<br>";
		}		
	}
	
	return recordCnt;

}

function copyContactsWithAddress(pFromCapId, pToCapId)
{
   // Copies all contacts from pFromCapId to pToCapId and includes Contact Address objects
   //
   if (pToCapId == null)
   var vToCapId = capId;
   else
   var vToCapId = pToCapId;

   var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
   var copied = 0;
   if (capContactResult.getSuccess())
   {
      var Contacts = capContactResult.getOutput();
      for (yy in Contacts)
      {
         var newContact = Contacts[yy].getCapContactModel();

         var newPeople = newContact.getPeople();
         // aa.print("Seq " + newPeople.getContactSeqNumber());

         var addressList = aa.address.getContactAddressListByCapContact(newContact).getOutput();
         newContact.setCapID(vToCapId);
         aa.people.createCapContact(newContact);
         newerPeople = newContact.getPeople();
         // contact address copying
         if (addressList)
         {
            for (add in addressList)
            {
               var transactionAddress = false;
               contactAddressModel = addressList[add].getContactAddressModel();
			   
			   logDebug("contactAddressModel.getEntityType():" + contactAddressModel.getEntityType());
			   
               if (contactAddressModel.getEntityType() == "CAP_CONTACT")
               {
                  transactionAddress = true;
                  contactAddressModel.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
               }
               // Commit if transaction contact address
               if(transactionAddress)
               {
                  var newPK = new com.accela.orm.model.address.ContactAddressPKModel();
                  contactAddressModel.setContactAddressPK(newPK);
                  aa.address.createCapContactAddress(vToCapId, contactAddressModel);
               }
               // Commit if reference contact address
               else
               {
                  // build model
                  var Xref = aa.address.createXRefContactAddressModel().getOutput();
                  Xref.setContactAddressModel(contactAddressModel);
                  Xref.setAddressID(addressList[add].getAddressID());
                  Xref.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
                  Xref.setEntityType(contactAddressModel.getEntityType());
                  Xref.setCapID(vToCapId);
                  // commit address
                  commitAddress = aa.address.createXRefContactAddress(Xref.getXRefContactAddressModel());
				  if(commitAddress.getSuccess())
				  {
					commitAddress.getOutput();
					logDebug("Copied contact address");
				  }
               }
            }
         }
         // end if
         copied ++ ;
         logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
      }
   }
   else
   {
      logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
      return false;
   }
   return copied;
}


function changeCapContactTypes(origType, newType)
{
   // Renames all contacts of type origType to contact type of newType and includes Contact Address objects
   //
	var vCapId = capId;
	if (arguments.length == 3)
		vCapId = arguments[2];
   
   var capContactResult = aa.people.getCapContactByCapID(vCapId);
   var renamed = 0;
   if (capContactResult.getSuccess())
   {
      var Contacts = capContactResult.getOutput();
      for (yy in Contacts)
      {
         var contact = Contacts[yy].getCapContactModel();

         var people = contact.getPeople();
		 var contactType = people.getContactType();
          //aa.print("Contact Type " + contactType);

		if(contactType==origType)
		{
		
			var contactNbr = people.getContactSeqNumber();	
			var editContact = aa.people.getCapContactByPK(vCapId, contactNbr).getOutput();
			editContact.getCapContactModel().setContactType(newType)
		
	//		aa.print("Set to: " + people.getContactType());
        	 renamed ++ ;
			 
			var updContactResult = aa.people.editCapContact(editContact.getCapContactModel());		
			logDebug("contact " + updContactResult);
			logDebug("contact.getSuccess() " + updContactResult.getSuccess());	
			logDebug("contact.getOutput() " + updContactResult.getOutput());
			updContactResult.getOutput();
			logDebug("Renamed contact from " + origType + " to " + newType);
		}
      }
   }
   else
   {
      logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
      return false;
   }
   return renamed;
}


function editEstimatedJobValue(jobValue) // option CapId
{
	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args
		var bValScriptObjResult = aa.cap.getBValuatn4AddtInfo(itemCap);
		var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!bValScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + bValScriptObjResult.getErrorMessage());
		return false;
	}
	var bValScriptObj = bValScriptObjResult.getOutput();
	if (!bValScriptObj) {
		logDebug("**ERROR: No valuation detail script object");
		return false;
	}
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
		return false;
	}
	var cdScriptObj = cdScriptObjResult.getOutput();
	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return false;
	}
	bValScriptObj.setEstimatedValue(parseFloat(jobValue));
	var vedtResults = aa.cap.editAddtInfo(cdScriptObj,bValScriptObj);
		if (!vedtResults.getSuccess()) {
			logDebug("**Error updating the job value in additional information" + edtResults.getErrorMessage());
		}
		if (vedtResults !== null && vedtResults.getSuccess() === true) {
			logDebug("Updated the estimated job value to " + jobValue);
		}
}

function externalLP_CA_AT(licNum,rlpType,doPopulateRef,doPopulateTrx,itemCap)
	{

	/*
	Version: 3.2

	Usage:

		licNum			:  Valid CA license number.   Non-alpha, max 8 characters.  If null, function will use the LPs on the supplied CAP ID
		rlpType			:  License professional type to use when validating and creating new LPs
		doPopulateRef 	:  If true, will create/refresh a reference LP of this number/type
		doPopulateTrx 	:  If true, will copy create/refreshed reference LPs to the supplied Cap ID.   doPopulateRef must be true for this to work
		itemCap			:  If supplied, licenses on the CAP will be validated.  Also will be refreshed if doPopulateRef and doPopulateTrx are true

	returns: non-null string of status codes for invalid licenses

	examples:

	appsubmitbefore   (will validate the LP entered, if any, and cancel the event if the LP is inactive, cancelled, expired, etc.)
	===============
	true ^ cslbMessage = "";
	CAELienseNumber ^ cslbMessage = externalLP_CA(CAELienseNumber,CAELienseType,false,false,null);
	cslbMessage.length > 0 ^ cancel = true ; showMessage = true ; comment(cslbMessage)

	appsubmitafter  (update all CONTRACTOR LPs on the CAP and REFERENCE with data from CSLB.  Link the CAP LPs to REFERENCE.   Pop up a message if any are inactive...)
	==============
	true ^ 	cslbMessage = externalLP_CA(null,"CONTRACTOR",true,true,capId)
	cslbMessage.length > 0 ^ showMessage = true ; comment(cslbMessage);

	Note;  Custom LP Template Field Mappings can be edited in the script below
	*/

	var returnMessage = "";

	var workArray = new Array();
	if (licNum)
		workArray.push(String(licNum));

	if (itemCap)
		{
		var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
		if (capLicenseResult.getSuccess())
			{
			var capLicenseArr = capLicenseResult.getOutput();  }
		else
			{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }

		if (capLicenseArr == null || !capLicenseArr.length)
			{ logDebug("**WARNING: no licensed professionals on this CAP"); }
		//else
			//{
			//for (var thisLic in capLicenseArr)
			//	if (capLicenseArr[thisLic].getLicenseType() == rlpType)
			//		workArray.push(capLicenseArr[thisLic]);
			//}
		}
	else
		doPopulateTrx = false; // can't do this without a CAP;

	for (var thisLic = 0; thisLic < workArray.length; thisLic++)
		{
		var licNum = workArray[thisLic];
		var licObj = null;
		var isObject = false;

		if (typeof(licNum) == "object")  // is this one an object or string?
			{
			licObj = licNum;
			licNum = licObj.getLicenseNbr();
			isObject = true;
			}

// Make the call to the California State License Board

		var document;
		var root;        
		var aURLArgList = "https://www2.cslb.ca.gov/IVR/License+Detail.aspx?LicNum=" + licNum;
		var vOutObj = aa.httpClient.get(aURLArgList);
		var isError = false;
		if(vOutObj.getSuccess()){
			var vOut = vOutObj.getOutput();
			var sr =  aa.proxyInvoker.newInstance("java.io.StringBufferInputStream", new Array(vOut)).getOutput();
			var saxBuilder = aa.proxyInvoker.newInstance("org.jdom.input.SAXBuilder").getOutput();
			document = saxBuilder.build(sr);
			root = document.getRootElement();
			errorNode = root.getChild("Error");
		}
		else{
			isError = true;
		}
		if (isError){
			logDebug("The CSLB web service is currently unavailable");
			continue;
		}
		else if (errorNode)
		{
			logDebug("Error for license " + licNum + " : " + errorNode.getText().replace(/\+/g," "));
			returnMessage+="License " + licNum +  " : " + errorNode.getText().replace(/\+/g," ") + " ";
			continue;
		}


		var lpBiz = root.getChild("BusinessInfo");
		var lpStatus = root.getChild("PrimaryStatus");
		var lpClass = root.getChild("Classifications");
		var lpBonds = root.getChild("ContractorBond");
		var lpWC = root.getChild("WorkersComp");

		// Primary Status
		// 3 = expired, 10 = good, 11 = inactive, 1 = canceled.   We will ignore all but 10 and return text.
		var stas = lpStatus.getChildren();
		for (var i=0 ; i<stas.size(); i++) {
			var sta = stas.get(i);

			if (sta.getAttribute("Code").getValue() != "10")
				returnMessage+="License:" + licNum + ", " + sta.getAttribute("Desc").getValue() + " ";
		}

		if (doPopulateRef)  // refresh or create a reference LP
			{
			var updating = false;

			// check to see if the licnese already exists...if not, create.

			var newLic = getRefLicenseProf(licNum)

			if (newLic)
				{
				updating = true;
				logDebug("Updating existing Ref Lic Prof : " + licNum);
				}
			else
				{
				var newLic = aa.licenseScript.createLicenseScriptModel();
				}

			if (isObject)  // update the reference LP with data from the transactional, if we have some.
				{
				if (licObj.getAddress1()) newLic.setAddress1(licObj.getAddress1());
				if (licObj.getAddress2()) newLic.setAddress2(licObj.getAddress2());
				if (licObj.getAddress3()) newLic.setAddress3(licObj.getAddress3());
				if (licObj.getAgencyCode()) newLic.setAgencyCode(licObj.getAgencyCode());
				if (licObj.getBusinessLicense()) newLic.setBusinessLicense(licObj.getBusinessLicense());
				if (licObj.getBusinessName()) newLic.setBusinessName(licObj.getBusinessName());
				if (licObj.getBusName2()) newLic.setBusinessName2(licObj.getBusName2());
				if (licObj.getCity()) newLic.setCity(licObj.getCity());
				if (licObj.getCityCode()) newLic.setCityCode(licObj.getCityCode());
				if (licObj.getContactFirstName()) newLic.setContactFirstName(licObj.getContactFirstName());
				if (licObj.getContactLastName()) newLic.setContactLastName(licObj.getContactLastName());
				if (licObj.getContactMiddleName()) newLic.setContactMiddleName(licObj.getContactMiddleName());
				if (licObj.getCountryCode()) newLic.setContryCode(licObj.getCountryCode());
				if (licObj.getEmail()) newLic.setEMailAddress(licObj.getEmail());
				if (licObj.getCountry()) newLic.setCountry(licObj.getCountry());
				if (licObj.getEinSs()) newLic.setEinSs(licObj.getEinSs());
				if (licObj.getFax()) newLic.setFax(licObj.getFax());
				if (licObj.getFaxCountryCode()) newLic.setFaxCountryCode(licObj.getFaxCountryCode());
				if (licObj.getHoldCode()) newLic.setHoldCode(licObj.getHoldCode());
				if (licObj.getHoldDesc()) newLic.setHoldDesc(licObj.getHoldDesc());
				if (licObj.getLicenseExpirDate()) newLic.setLicenseExpirationDate(licObj.getLicenseExpirDate());
				if (licObj.getLastRenewalDate()) newLic.setLicenseLastRenewalDate(licObj.getLastRenewalDate());
				if (licObj.getLicesnseOrigIssueDate()) newLic.setLicOrigIssDate(licObj.getLicesnseOrigIssueDate());
				if (licObj.getPhone1()) newLic.setPhone1(licObj.getPhone1());
				if (licObj.getPhone1CountryCode()) newLic.setPhone1CountryCode(licObj.getPhone1CountryCode());
				if (licObj.getPhone2()) newLic.setPhone2(licObj.getPhone2());
				if (licObj.getPhone2CountryCode()) newLic.setPhone2CountryCode(licObj.getPhone2CountryCode());
				if (licObj.getSelfIns()) newLic.setSelfIns(licObj.getSelfIns());
				if (licObj.getState()) newLic.setState(licObj.getState());
				if (licObj.getSuffixName()) newLic.setSuffixName(licObj.getSuffixName());
				if (licObj.getZip()) newLic.setZip(licObj.getZip());
				}

			// Now set data from the CSLB

			if (lpBiz.getChild("Name").getText() != "") newLic.setBusinessName(unescape(lpBiz.getChild("Name").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("Addr1").getText() != "") newLic.setAddress1(unescape(lpBiz.getChild("Addr1").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("Addr2").getText() != "") newLic.setAddress2(unescape(lpBiz.getChild("Addr2").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("City").getText() != "") newLic.setCity(unescape(lpBiz.getChild("City").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("State").getText() != "") newLic.setState(unescape(lpBiz.getChild("State").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("Zip").getText() != "") newLic.setZip(unescape(lpBiz.getChild("Zip").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("BusinessPhoneNum").getText() != "") newLic.setPhone1(unescape(stripNN(lpBiz.getChild("BusinessPhoneNum").getText()).replace(/\+/g," ")));
			newLic.setAgencyCode(aa.getServiceProviderCode());
			newLic.setAuditDate(sysDate);
			newLic.setAuditID(currentUserID);
			newLic.setAuditStatus("A");
			newLic.setLicenseType(rlpType);
			newLic.setLicState("CA");  // hardcode CA
			newLic.setStateLicense(licNum);

			if (lpBiz.getChild("IssueDt").getText()) newLic.setLicenseIssueDate(aa.date.parseDate(lpBiz.getChild("IssueDt").getText()));
			if (lpBiz.getChild("ExpireDt").getText()) newLic.setLicenseExpirationDate(aa.date.parseDate(lpBiz.getChild("ExpireDt").getText()));
			if (lpBiz.getChild("ReissueDt").getText()) newLic.setLicenseLastRenewalDate(aa.date.parseDate(lpBiz.getChild("ReissueDt").getText()));

			var wcs = root.getChild("WorkersComp").getChildren();

			for (var j=0 ; j<wcs.size(); j++) {
				wc = wcs.get(j);

				if (wc.getAttribute("PolicyNo").getValue()) newLic.setWcPolicyNo(wc.getAttribute("PolicyNo").getValue());
				if (wc.getAttribute("InsCoCde").getValue()) newLic.setWcInsCoCode(unescape(wc.getAttribute("InsCoCde").getValue()));
				if (wc.getAttribute("WCEffDt").getValue()) newLic.setWcEffDate(aa.date.parseDate(wc.getAttribute("WCEffDt").getValue()))
				if (wc.getAttribute("WCExpDt").getValue()) newLic.setWcExpDate(aa.date.parseDate(wc.getAttribute("WCExpDt").getValue()))
				if (wc.getAttribute("WCCancDt").getValue()) newLic.setWcCancDate(aa.date.parseDate(wc.getAttribute("WCCancDt").getValue()))
				if (wc.getAttribute("Exempt").getValue() == "E") newLic.setWcExempt("Y"); else newLic.setWcExempt("N");

				break; // only use first
				}

			//
			// Do the refresh/create and get the sequence number
			//
			if (updating)
				{
				var myResult = aa.licenseScript.editRefLicenseProf(newLic);
				var licSeqNbr = newLic.getLicSeqNbr();
				}
			else
				{
				var myResult = aa.licenseScript.createRefLicenseProf(newLic);

				if (!myResult.getSuccess())
					{
					logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
					continue;
					}

				var licSeqNbr = myResult.getOutput()
				}

			logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " Sequence Number " + licSeqNbr);


			/////
			/////  Attribute Data -- first copy from the transactional LP if it exists
			/////


			if (isObject)  // update the reference LP with attributes from the transactional, if we have some.
				{
				var attrArray = licObj.getAttributes();

				if (attrArray)
					{
					for (var k in attrArray)
						{
						var attr = attrArray[k];
						editRefLicProfAttribute(licNum,attr.getAttributeName(),attr.getAttributeValue());
						}
					}
				}

			/////
			/////  Attribute Data
			/////
			/////  NOTE!  Agencies may have to configure template data below based on their configuration.  Please note all edits
			/////

			var cbs = root.getChild("Classifications").getChildren();
			for (var m=0 ; m<cbs.size(); m++) {
				cb = cbs.get(m);

				if (m == 0)
					{
					editRefLicProfAttribute(licNum,"CLASS CODE 1",cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum,"CLASS DESC 1",unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g," "));
					}

				if (m == 1)
					{
					editRefLicProfAttribute(licNum,"CLASS CODE 2",cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum,"CLASS DESC 2",unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g," "));
					}
				if (m == 2)
					{
					editRefLicProfAttribute(licNum,"CLASS CODE 3",cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum,"CLASS DESC 3",unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g," "));
					}

				if (m == 3)
					{
					editRefLicProfAttribute(licNum,"CLASS CODE 4",cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum,"CLASS DESC 4",unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g," "));
					}
				}

// dlh add in Status

	var stas = lpStatus.getChildren();
		for (var i=0 ; i<stas.size(); i++) {
			var sta = stas.get(i);

				if (sta.getAttribute("Desc").getValue()) editRefLicProfAttribute(licNum,"STATUS",unescape(sta.getAttribute("Desc").getValue()));

				break; // only use first
				}
				
//  do this again for WC  

            var wcs = root.getChild("WorkersComp").getChildren();
			for (var j=0 ; j< wcs.size(); j++) {
				wc = wcs.get(j);

				if (wc.getAttribute("PolicyNo").getValue()) editRefLicProfAttribute(licNum,"WC POLICY NO",unescape(wc.getAttribute("PolicyNo").getValue()));

				if (wc.getAttribute("InsCoCde").getValue()) editRefLicProfAttribute(licNum,"WC CO CODE",unescape(wc.getAttribute("InsCoCde").getValue()));
			
				if (wc.getAttribute("InsCoName").getValue()) editRefLicProfAttribute(licNum,"WC CO NAME",unescape(wc.getAttribute("InsCoName").getValue()).replace(/\+/g," "));

				if (wc.getAttribute("WCEffDt").getValue()) editRefLicProfAttribute(licNum,"WC EFF DATE",unescape(wc.getAttribute("WCEffDt").getValue()));

				if (wc.getAttribute("WCExpDt").getValue()) editRefLicProfAttribute(licNum,"WC EXP DATE",unescape(wc.getAttribute("WCExpDt").getValue()));

				if (wc.getAttribute("WCCancDt").getValue()) editRefLicProfAttribute(licNum,"WC CAN DATE",unescape(wc.getAttribute("WCCancDt").getValue()));

				if (wc.getAttribute("Exempt").getValue() == "E") 
					editRefLicProfAttribute(licNum,"WC EXEMPT","Y"); 
				else 
					editRefLicProfAttribute(licNum,"WC EXEMPT","N");
					 
				break; // only use first
				}

// end dlh change update attribute WC data 

			var bos = root.getChild("ContractorBond").getChildren();

			for (var n=0 ; n<bos.size(); n++) {
				var bo = bos.get(n);
				if (bo.getAttribute("BondAmt").getValue()) editRefLicProfAttribute(licNum,"BOND AMOUNT",unescape(bo.getAttribute("BondAmt").getValue()));
				if (bo.getAttribute("BondCancDt").getValue()) editRefLicProfAttribute(licNum,"BOND EXPIRATION",unescape(bo.getAttribute("BondCancDt").getValue()));

				// Currently unused but could be loaded into custom attributes.
				if (bo.getAttribute("SuretyTp").getValue()) editRefLicProfAttribute(licNum,"BOND SURETYTP",unescape(bo.getAttribute("SuretyTp").getValue()));

				if (bo.getAttribute("InsCoCde").getValue()) editRefLicProfAttribute(licNum,"BOND INSOCDE",unescape(bo.getAttribute("InsCoCde").getValue()).replace(/\+/g," "));

				if (bo.getAttribute("InsCoName").getValue()) editRefLicProfAttribute(licNum,"BOND ICONAME",unescape(bo.getAttribute("InsCoName").getValue()).replace(/\+/g," "));

				if (bo.getAttribute("BondNo").getValue()) editRefLicProfAttribute(licNum,"BOND NO",unescape(bo.getAttribute("BondNo").getValue()));

				if (bo.getAttribute("BondEffDt").getValue()) editRefLicProfAttribute(licNum,"BOND EFFDATE",unescape(bo.getAttribute("BondEffDt").getValue()));

	

/*
				aa.print("Bond Surety Type       : " + unescape(bo.getAttribute("SuretyTp").getValue()))
				aa.print("Bond Code              : " + unescape(bo.getAttribute("InsCoCde").getValue()))
				aa.print("Bond Insurance Company : " + unescape(bo.getAttribute("InsCoName").getValue()).replace(/\+/g," "))
				aa.print("Bond Number            : " + unescape(bo.getAttribute("BondNo").getValue()))
				aa.print("Bond Amount            : " + unescape(bo.getAttribute("BondAmt").getValue()))
				aa.print("Bond Effective Date    : " + unescape(bo.getAttribute("BondEffDt").getValue()))
				aa.print("Bond Cancel Date       : " + unescape(bo.getAttribute("BondCancDt").getValue()))
*/
				break; // only use first bond
				}

			if (doPopulateTrx)
				{
				var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode,licSeqNbr)
					if (!lpsmResult.getSuccess())
					{ logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage()) ; }

				var lpsm = lpsmResult.getOutput();

				// Remove from CAP

				var isPrimary = false;

				for (var currLic in capLicenseArr)
					{
					var thisLP = capLicenseArr[currLic];
					if (thisLP.getLicenseType() == rlpType && thisLP.getLicenseNbr() == licNum)
						{
						logDebug("Removing license: " + thisLP.getLicenseNbr() + " from CAP.  We will link the new reference LP");
						if (thisLP.getPrintFlag() == "Y")
							{
							logDebug("...remove primary status...");
							isPrimary = true;
							thisLP.setPrintFlag("N");
							aa.licenseProfessional.editLicensedProfessional(thisLP);
							}
						var remCapResult = aa.licenseProfessional.removeLicensedProfessional(thisLP);
						if (capLicenseResult.getSuccess())
							{
							logDebug("...Success."); }
						else
							{ logDebug("**WARNING removing lic prof: " + remCapResult.getErrorMessage()); }
						}
					}

				// add the LP to the CAP
				var asCapResult= aa.licenseScript.associateLpWithCap(itemCap,lpsm)
				if (!asCapResult.getSuccess())
				{ logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage()) }
				else
					{ logDebug("Associated the CAP to the new LP") }

				// Now make the LP primary again
				if (isPrimary)
					{
					var capLps = getLicenseProfessional(itemCap);

					for (var thisCapLpNum in capLps)
						{
						if (capLps[thisCapLpNum].getLicenseNbr().equals(licNum))
							{
							var thisCapLp = capLps[thisCapLpNum];
							thisCapLp.setPrintFlag("Y");
							aa.licenseProfessional.editLicensedProfessional(thisCapLp);
							logDebug("Updated primary flag on Cap LP : " + licNum);

							// adding this return will cause the test script to work without error, even though this is the last statement executed
							//if (returnMessage.length > 0) return returnMessage;
							//else return null;

							}
						}
				}
			} // do populate on the CAP
		} // do populate on the REF
	} // for each license

	if (returnMessage.length > 0) return returnMessage;
	else return null;

} // end function

function getLPLicNum(pCapId) {
//Function find licensed professionals number
        var newLicNum = null;
	var licProf = aa.licenseProfessional.getLicensedProfessionalsByCapID(pCapId).getOutput();
	if (licProf != null)
		for(x in licProf)
		{
                        newLicNum = licProf[x].getLicenseNbr();
		        // logDebug("Found " + licProf[x].getLicenseNbr());
                        return newLicNum;
		}
	else
		// logDebug("No licensed professional on source");
                return null;
}


function getLatestScheduledDate()
{	
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
	{
		inspList = inspResultObj.getOutput();
        var array=new Array();  
        var j=0;		
		for (i in inspList)
        {		    			 				
			if (inspList[i].getInspectionStatus().equals("Scheduled"))
			{	                   					
				array[j++]=aa.util.parseDate(inspList[i].getInspection().getScheduledDate());				
			}
		}
		
		var latestScheduledDate=array[0];
		for (k=0;k<array.length;k++)
        {		          	
			temp=array[k];
			if(temp.after(latestScheduledDate))
			{
				latestScheduledDate=temp;
			} 
		}
		return latestScheduledDate;
	}
	return false;
}

function voidRemoveFees(vFeeCode)
	{
	var feeSeqArray = new Array();
	var invoiceNbrArray = new Array();
	var feeAllocationArray = new Array();
    var itemCap = capId;
    if (arguments.length > 1)
        itemCap = arguments[1];
 
	// for each fee found
	//  	  if the fee is "NEW" remove it
	//  	  if the fee is "INVOICED" void it and invoice the void
	//
	
	var targetFees = loadFees(itemCap);

	for (tFeeNum in targetFees)
		{
		targetFee = targetFees[tFeeNum];

		if (targetFee.code.equals(vFeeCode))
			{

			// only remove invoiced or new fees, however at this stage all AE fees should be invoiced.

			if (targetFee.status == "INVOICED")
				{
				var editResult = aa.finance.voidFeeItem(itemCap, targetFee.sequence);

				if (editResult.getSuccess())
					logDebug("Voided existing Fee Item: " + targetFee.code);
				else
					{ logDebug( "**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }

				var feeSeqArray = new Array();
				var paymentPeriodArray = new Array();

				feeSeqArray.push(targetFee.sequence);
				paymentPeriodArray.push(targetFee.period);
				var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);

				if (!invoiceResult_L.getSuccess())
					{
					logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
					return false;
					}

				break;  // done with this payment
				}



			if (targetFee.status == "NEW")
				{
				// delete the fee
				var editResult = aa.finance.removeFeeItem(itemCap, targetFee.sequence);

				if (editResult.getSuccess())
					logDebug("Removed existing Fee Item: " + targetFee.code);
				else
					{ logDebug( "**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }

				break;  // done with this payment
				}

			} // each matching fee
		}  // each  fee
}  // function


function removeZeroFees() {
	var feeArr = loadFees();
	for (x in feeArr) {
		thisFee = feeArr[x];
		if (thisFee.status == "NEW" && thisFee.amount == 0) {
			voidRemoveFees(thisFee.code)//, "FINAL");
		}
	}
}

function updateFeeFromASI(ASIField, FeeCode) {
	var tmpASIQty = parseFloat("0" + getAppSpecific(ASIField))
	var FeeSchedule = aa.finance.getFeeScheduleByCapID(capId).getOutput()
	logDebug("updateFeeFromASI Function: ASI Field = " + ASIField + "; Fee Code = " + FeeCode + "; Fee Schedule: " + FeeSchedule);

	if (arguments.length == 3) FeeSchedule = arguments[2];	// Fee Scheulde for Fee Code
	
	//Check to see if the ASI Field has a value. If so, then check to see if the fee exists.
	if (tmpASIQty > 0) {
		logDebug("ASI Field: " + ASIField + " was found and has a positive value. Attempting to update fee information.");
		updateFee(FeeCode,FeeSchedule,"FINAL",tmpASIQty,"N");
	}

	else {
		logDebug("ASI Field: " + ASIField + " is not found or has a value <= 0.")
		if (feeExists(FeeCode)) {
			//Fee is found and should be voided or removed.
			voidRemoveFees(FeeCode)
		}
	}
}

function relayPaymentReceiveAfter() {
    logDebug("Enter relayPaymentReceiveAfter()");    
    logDebug("");

    var url = "http://216.64.186.249/lancaster.cayenta.web/api/paymentreceive";
    logDebug("url: " + url);

    var login = "login";
    logDebug("login: " + login);

    var password = "password";
    logDebug("password: " + password);    
    
    logDebug("Begin Globals");
    for (variableIndex in this) {
        var variable = this[variableIndex];
        if (typeof variable != "function") {
            logDebug(variableIndex + ":" + variable)
        }
    }
    logDebug("End Globals");
    logDebug("");

    //Echo the environment variables
    logDebug("Begin Environment Variables");
    var paramValues = aa.env.getParamValues();
    var keys = paramValues.keys();
    while (keys.hasNext()) {
        var key = keys.next();
        var value = paramValues.get(key);
        logDebug(key + ":" + value);
    }
    logDebug("End Environment Variables");
    logDebug("");

    var capId = getCapId();
    logDebug("capId: " + capId);

    try{

        //Construct the transaction model that we'll be sending ot the REST endpoint
        var transactionModel = {
            "capId": capId,
            "eventDate": aa.util.now(),
            "appTypeArray": appTypeArray
        };

        //Add the environment variables
        keys = paramValues.keys();
        while (keys.hasNext()) {
            var key = keys.next();        
            var value = paramValues.get(key);
            transactionModel[key] = value;        
        }

        //Get the fee schedule
        var getFeeScheduleByCapIDScriptResult = aa.finance.getFeeScheduleByCapID(capId);
        if (getFeeScheduleByCapIDScriptResult.getSuccess()) {
            transactionModel.feeSchedule = getFeeScheduleByCapIDScriptResult.getOutput();
        } else {
            logDebug(getFeeScheduleByCapIDScriptResult.getErrorMessage());
        }

        //Get the payment items
        var getPaymentByCapIDScriptResult = aa.finance.getPaymentByCapID(capId, null);
        if (getPaymentByCapIDScriptResult.getSuccess()) {
            transactionModel.paymentItems = getPaymentByCapIDScriptResult.getOutput();
        } else {
            logDebug(getPaymentByCapIDScriptResult.getErrorMessage());
        }

        //Get the payment fee items
        var getPaymentFeeItemsScriptResult = aa.finance.getPaymentFeeItems(capId, null);
        if (getPaymentFeeItemsScriptResult.getSuccess()) {
            transactionModel.paymentFeeItems = [];
            var paymentFeeItems = getPaymentFeeItemsScriptResult.getOutput();
            for (paymentFeeItemIndex in paymentFeeItems) {
                var paymentFeeItem = paymentFeeItems[paymentFeeItemIndex];            
                transactionModel.paymentFeeItems.push(paymentFeeItem);            
            }
        } else {
            logDebug(getPaymentFeeItemsScriptResult.getErrorMessage());
        }

        //Get the fee items
        var getFeeItemByCapIDScriptResult = aa.finance.getFeeItemByCapID(capId);
        if (getFeeItemByCapIDScriptResult.getSuccess()) {
            transactionModel.feeItems = getFeeItemByCapIDScriptResult.getOutput();
        } else {
            logDebug(getFeeItemByCapIDScriptResult.getErrorMessage());
        }

        ////Get the applicant
        //var getCapScriptResult = aa.cap.getCap(capId);
        //if (getCapScriptResult.getSuccess()) {

        //    var capScriptModel = getCapScriptResult.getOutput();
        //    //logDebug("capScriptModel: " + capScriptModel);

        //    var capModel = capScriptModel.getCapModel();
        //    //logDebug("capModel: " + capModel);

        //    //Get the applicant
        //    var applicant = capModel.getApplicantModel();
        //    //logDebug("applicant: " + applicant);

        //    transactionModel.applicant = applicant;
        //} else {
        //    aa.print(getCapScriptResult.getErrorMessage());
        //}

        //Get the contacts
        var getCapContactByCapIDScriptResult = aa.people.getCapContactByCapID(capId);
        if(getCapContactByCapIDScriptResult.getSuccess()){
            transactionModel.contacts = getCapContactByCapIDScriptResult.getOutput();        
        }else{
            logDebug(getOwnerByCapIdScriptResult.getErrorMessage());
        }

        //Get the owners
        var getOwnerByCapIdScriptResult = aa.owner.getOwnerByCapId(capId);
        if (getOwnerByCapIdScriptResult.getSuccess()) {
            transactionModel.owners = getOwnerByCapIdScriptResult.getOutput();
        } else {
            logDebug(getOwnerByCapIdScriptResult.getErrorMessage());
        }

        //Create an instance of the ObjectMapper that we'll be using for serialization
        var objectMapper = new org.codehaus.jackson.map.ObjectMapper();   

        var transactionModelString = objectMapper.writeValueAsString(transactionModel);
        logDebug("transactionModelString: " + transactionModelString);

        doHttpPostRequest(login, password, url, transactionModelString, "application/json")

    } catch (exception) {

        var subject = "relayPaymentReceiveAfter custom script function processing error alert";
        var message = "";

        try { message += "Exception caught in relayPaymentReceiveAfter custom script function\n" } catch (_exception) { }
        try { message += "exception: " + exception + "\n"; } catch (_exception) { }
        try { message += "exception.fileName: " + exception.fileName + "\n"; } catch (_exception) { }
        try { message += "exception.lineNumber: " + exception.lineNumber + "\n"; } catch (_exception) { }
        try { message += "exception.message: " + exception.message + "\n"; } catch (_exception) { }
        try { message += "exception.name: " + exception.name + "\n"; } catch (_exception) { }
        try { message += "exception.rhinoException: " + exception.rhinoException + "\n"; } catch (_exception) { }
        try { message += "exception.stack: " + exception.stack + "\n"; } catch (_exception) { }
        try { message += "\n" + objectMapper.writeValueAsString(exception)  + "\n"; } catch(_exception) { }

        logDebug(message);
    }

    aa.env.setValue("ScriptReturnCode", "1");
    aa.env.setValue("ScriptReturnMessage", "relayPaymentReceiveAfter()");

    logDebug("");
    logDebug("Exit relayPaymentReceiveAfter()");
}

function doHttpPostRequest(username, password, url, body, contentType) {
    logDebug("Enter doHttpPostRequest()");

    logDebug("username: " + username);
    logDebug("password: " + password);
    logDebug("url: " + url);
    logDebug("body: " + body);
    logDebug("contentType: " + contentType);

    var post = new org.apache.commons.httpclient.methods.PostMethod(url);
    var client = new org.apache.commons.httpclient.HttpClient();

    // ---- Authentication ---- //
    if(username !== null && password !== null){
        var creds = new org.apache.commons.httpclient.UsernamePasswordCredentials(username, password);
        client.getParams().setAuthenticationPreemptive(true);
        client.getState().setCredentials(org.apache.commons.httpclient.auth.AuthScope.ANY, creds);
    }
    // -------------------------- //

    post.setRequestHeader("Content-type", contentType);
    
    post.setRequestEntity(
        new org.apache.commons.httpclient.methods.StringRequestEntity(body, contentType, "UTF-8")
    );

    var status = client.executeMethod(post);

    if(status >= 400){
        throw "HTTP Error: " + status;
    }
    
    var br = new java.io.BufferedReader(new java.io.InputStreamReader(post.getResponseBodyAsStream()));
    var response = "";
    var line = br.readLine();
    while(line != null){
        response = response + line;
        line = br.readLine();
    }

    post.releaseConnection();

    logDebug(status);
    logDebug(response);

    logDebug("Exit doHttpPostRequest()");
    return response;
}

// Custom License Scripts


function calcMonthsLate(date1){//date1 is the ASI Business Open Date (Application) or License Expiration Date (Renewal) passed by calculateLicAppRenewPenaltyFee
//	var fDate = new Date("12/01/2016");//testing

	var fDate = convertDate(fileDate); logDebug("fDate: "+fDate);
	var monthLate = 0;
	var yMonthLate = 0;
	var monthsLate = 0;
	
	if(date1 < fDate){
		
		var oMonth = date1.getMonth();
		var oYear = date1.getFullYear();
			logDebug("oMonth: "+oMonth+" oYear: "+oYear);
		
		var fDateMonth = fDate.getMonth();
		var fDateYear = fDate.getFullYear();
			logDebug("fDateMonth: "+fDateMonth+" fDateYear: "+fDateYear);
		
		if((oYear < fDateYear) || (oYear == fDateYear && oMonth < fDateMonth)){
			monthLate = (fDateMonth - oMonth); logDebug("Months late: "+ monthLate);
			yMonthLate = ((fDateYear - oYear)*12); logDebug("Years late: "+ yMonthLate);
			monthsLate = monthLate+yMonthLate;
		}
		logDebug("Total months late: "+ monthsLate);
		return monthsLate;
	}
}

function calculateLicAppRenewPenaltyFee(){
	var date1 = null;
	if(appTypeArray[3] == "Application"){
		var date1 = convertDate(AInfo["Business Open Date"]);
		logDebug("Business Open Date: "+date1);
	}
	if(appTypeArray[3] == "Renewal"){
		date1 = dateAdd(null, 0);
		var parentLicenseCAPID = getParentLicenseCapID(capId);
		if (parentLicenseCAPID != null){
			//var date1 = parentLicenseCAPID.getExpDate();
			licObj = new licenseObject(null, parentLicenseCAPID);
			if (licObj != null) 
				date1 = licObj.b1ExpDate;
			logDebug("License Expiration Date: "+date1);
		}else{
			logDebug("No parent license found");
		}
	}
	if(date1){
		var monthsLate = calcMonthsLate(date1);
		if(monthsLate > 0){
			if(monthsLate == 1) updateFee("BLPN010","BL_PENALTY","FINAL",1,"Y");
			if(monthsLate == 2) updateFee("BLPN020","BL_PENALTY","FINAL",1,"Y");
			if(monthsLate == 3) updateFee("BLPN030","BL_PENALTY","FINAL",1,"Y");
			if(monthsLate > 3 && monthsLate < 13) updateFee("BLPN040","BL_PENALTY","FINAL",1,"Y");
			if(monthsLate > 12 && monthsLate < 25) updateFee("BLPN050","BL_PENALTY","FINAL",1,"Y");
			if(monthsLate > 24) updateFee("BLPN060","BL_PENALTY","FINAL",1,"Y");
		}
		else logDebug("Not delinquint, no penalty added.");
	}
	else logDebug("date1 was not set");
}

function daysBetween(date1, date2){
	if (typeof(date1) == "object") date1 = date1.toString(); //Added these because we can't always assume it's a string, ASIT dates are objects.
	if (typeof(date2) == "object") date2 = date2.toString(); //
	if (date1.indexOf("-") != -1) { date1 = date1.split("-"); } else if (date1.indexOf("/") != -1) { date1 = date1.split("/"); } else { return 0; }
	if (date2.indexOf("-") != -1) { date2 = date2.split("-"); } else if (date2.indexOf("/") != -1) { date2 = date2.split("/"); } else { return 0; }
	if (parseInt(date1[0], 10) >= 1000) {
		var sDate = new Date(date1[0]+"/"+date1[1]+"/"+date1[2]);
	} else if (parseInt(date1[2], 10) >= 1000) {
		var sDate = new Date(date1[2]+"/"+date1[0]+"/"+date1[1]); 
	} else {
		return 0;
	}
	if (parseInt(date2[0], 10) >= 1000) {
		var eDate = new Date(date2[0]+"/"+date2[1]+"/"+date2[2]);
	} else if (parseInt(date2[2], 10) >= 1000) {
		var eDate = new Date(date2[2]+"/"+date2[0]+"/"+date2[1]);
	} else {
		return 0;
	}
	var one_day = 1000*60*60*24;
	var daysApart = Math.abs(Math.ceil((sDate.getTime()-eDate.getTime())/one_day));
	return daysApart;
}

function getParentLicenseCapID(capid) {
	
	logDebug("START getParentLicenseCapID! cap id is:"+capid);
	
	if (capid == null || aa.util.instanceOfString(capid)) { logDebug("getParentLicenseCapID: return null b/c not a string"); return null; }

	var result = aa.cap.getProjectByChildCapID(capid, "Renewal", "Incomplete");
logDebug("getParentLicenseCapID: return from aa.cap.getProjectByChildCapID is:"+result);
printObjProperties(result);
	if(result.getSuccess() ) {
		projectScriptModels = result.getOutput();
		projectScriptModel = projectScriptModels[0];
logDebug("getParentLicenseCapID: you have a parent and got it from script model...printing the obj");
printObjProperties(projectScriptModel);
logDebug("getParentLicenseCapID: going to return the id--->"+projectScriptModel.getProjectID());
		return projectScriptModel.getProjectID();
	} else {		
logDebug("getParentLicenseCapID: going to call getParentCapVIAPartialCap with capid");
		return getParentCapVIAPartialCap(capid);
	}
}

function updateLicense(){
	try {
		// get license capId
		var licId = getParentCapIDForComplete(capId);
		
		if (licId != null) {
			// get license
			var thisLic = new licenseObject(licId.getCustomID(),licId); 
			
			// update expiration date
			var prevExp = thisLic.b1ExpDate; 												
			var licExpStatus = thisLic.getStatus();											
			today = new Date();																
			logDebug(thisLic.b1Exp.getExpDate().getYear());
			logDebug(today.getFullYear());
			// determine how many years from the current expiration have elapsed and then add this to the new date 
			// ensure keep the original mon & day for the expiration
			var newYear = (today.getFullYear() - thisLic.b1Exp.getExpDate().getYear()) + 1;	
			logDebug("newYear = " + newYear);
			thisLic.setExpiration(dateAddMonths(prevExp, (12 * newYear)));
			if (licExpStatus != "Active") {
				// update expiration status to 'Active'
				thisLic.setStatus("Active");											
			}	
			
			// update license record status to 'Issued'
			updateAppStatus("Active", "updated by script", licId);
			
			// update custom lists
			replaceASITables(capId, licId);
		} else {
			logDebug("Error: unable to get parent license record to update");
		}
	}
	catch (err){
		logDebug("Javascript error: " + err.message);
	}
}

function feeTotalByStatus(feeStatus) {
	var statusArray = new Array(); 
	if (arguments.length > 0) {
		for (var i=0; i<arguments.length; i++) statusArray.push(arguments[i]);
	}
	var feeTotal = 0;
	var feeResult=aa.fee.getFeeItems(capId);
	if (feeResult.getSuccess()) { 
		var feeObjArr = feeResult.getOutput(); 
		for (ff in feeObjArr) {
			thisFeeStatus = "" + feeObjArr[ff].getFeeitemStatus();
			if (exists(thisFeeStatus,statusArray)) feeTotal+=feeObjArr[ff].getFee();	
		}
	}
	else { 
		logDebug( "Error getting fee items: " + feeResult.getErrorMessage()); 
	}
	return feeTotal;
}


function convertDate(thisDate)
	{

	if (typeof(thisDate) == "string")
		{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
		}

	if (typeof(thisDate)== "object")
		{

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
			{
			return thisDate;
			}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}
			
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}			

		if (thisDate.getClass().toString().equals("class java.util.Date"))
			{
			return new Date(thisDate.getTime());
			}

		if (thisDate.getClass().toString().equals("class java.lang.String"))
			{
			return new Date(String(thisDate));
			}
		}

	if (typeof(thisDate) == "number")
		{
		return new Date(thisDate);  // assume milliseconds
		}

	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

	}

function addFeeFromASI(ASIField, FeeCode) {
	var tmpASIQty = parseFloat("0" + getAppSpecific(ASIField))
	var FeeSchedule = aa.finance.getFeeScheduleByCapID(capId).getOutput()
	logDebug("addeFeeFromASI Function: ASI Field = " + ASIField + "; Fee Code = " + FeeCode + "; Fee Schedule: " + FeeSchedule);

	if (arguments.length == 3) FeeSchedule = arguments[2];	// Fee Scheulde for Fee Code
	
	//Check to see if the ASI Field has a value. If so, then check to see if the fee exists.
	if (tmpASIQty > 0) {
		logDebug("ASI Field: " + ASIField + " was found and has a positive value. Attempting to add fee information.");
		addFee(FeeCode,FeeSchedule,"FINAL",tmpASIQty,"Y");
	}
}

 
function getFeeDefByCode(fsched, feeCode) {

	var arrFeesResult = aa.finance.getFeeItemList(null,fsched,null);
	if (arrFeesResult.getSuccess()) {
		var arrFees = arrFeesResult.getOutput();
		for (xx in arrFees) {
			var fCode = arrFees[xx].getFeeCod();
			if (fCode.equals(feeCode)) {
				var f = new FeeDef();
				f.feeCode = fCode; 
				f.feeDesc = arrFees[xx].getFeeDes();
				f.formula = arrFees[xx].getFormula();
				f.calcProc = arrFees[xx].getCalProc();
				var rft = arrFees[xx].getrFreeItem();
				f.comments = rft.getComments();
				return f;
			}
	
		} // for xx
	}
	else { 
		logDebug("Error getting fee schedule " + arrFeesResult.getErrorMessage());
		return null;
	}
} // function

function FeeDef () { // Fee Definition object 
	this.formula = null;
	this.feeUnit = null;
	this.feeDesc = null;
	this.feeCode = null;
	this.comments = null;
        this.calcProc = null;
}



function getSubGrpFeeAmt (subGrp){
	//Check for a specific status to use, optional argument 1
	var spStatus = "";
	if (arguments.length >= 2) {spStatus = arguments[1]};
	
	//Check for a specific FeeCode to exclude, optional argument 2
	var excludedFeeCode = "";
	if (arguments.length == 3) {excludedFeeCode = arguments[2]};
	
	if (spStatus != "") {
		logDebug("Getting total fees for Sub Group: " + subGrp + "; Having a status of: " + spStatus)
		var runFeeTot = 0
		var feeA = loadFees()
		for (x in feeA)	{
			thisFee = feeA[x];
			if (thisFee.subGroup != null) {
				var thisFeeSubGrp = thisFee.subGroup
				var thisFeeSubGrpAry = thisFeeSubGrp.split(",")
				if (IsStrInArry(subGrp,thisFeeSubGrpAry) && (thisFee.status == spStatus)){
					//Check to see if fee should be excluded, if not then count it.
					if (excludedFeeCode == thisFee.code) {
						logDebug("Fee " + thisFee.code + " found with sub group: " + thisFee.subGroup + "; Amount: " + thisFee.amount + "; Status: " + thisFee.status);
						logDebug("Fee " + thisFee.code + " is excluded from the Running Total: " + runFeeTot);
					}
					//excludedFeeCode is not specified, so count all
					else {
						if (thisFee.description.indexOf("Alternative Energy") < 0) {
							logDebug("Fee " + thisFee.code + " found with sub group: " + thisFee.subGroup + "; Amount: " + thisFee.amount + "; Status: " + thisFee.status );
							runFeeTot = runFeeTot + thisFee.amount;
							logDebug("Fee: " + thisFee.code + " added to the running total. Running Total: " + runFeeTot);
						}
					}
				}
			}
		}
	}
	else {
		logDebug("Getting total fees for Sub Group: " + subGrp + "; Having a status of INVOICED or NEW.")
		var runFeeTot = 0
		var feeA = loadFees()
		for (x in feeA)	{
			thisFee = feeA[x];
			if (thisFee.subGroup != null) {
				var thisFeeSubGrp = thisFee.subGroup
				var thisFeeSubGrpAry = thisFeeSubGrp.split(",")
				if (IsStrInArry(subGrp,thisFeeSubGrpAry) && (thisFee.status == "INVOICED" || thisFee.status == "NEW")) {
		         	        if (excludedFeeCode == thisFee.code) {
						logDebug("Fee " + thisFee.code + " found with sub group: " + thisFee.subGroup + "; Amount: " + thisFee.amount + "; Status: " + thisFee.status );
						logDebug("Fee " + thisFee.code + " is excluded from the Running Total: " + runFeeTot);
					}
					//excludedFeeCode is not specified, so count all
					else {
						if (thisFee.description.indexOf("Alternative Energy") < 0) {
							logDebug("Fee " + thisFee.code + " found with sub group: " + thisFee.subGroup + "; Amount: " + thisFee.amount + "; Status: " + thisFee.status );
							runFeeTot = runFeeTot + thisFee.amount;
							logDebug("Fee: " + thisFee.code + " added to the running total. Running Total: " + runFeeTot);
						}
					}
				}
			}
		}
	}
	logDebug("Final returned amount: " + runFeeTot);
	return (runFeeTot);
}


function IsStrInArry(eVal,argArr) {
	var x;
   	for (x in argArr){
   		if (eVal == argArr[x]){
   			return true;
   		}
 	  }	
	return false;
}

function getFeeCount(fCode) {
	retValue = 0;
	feeArray = loadFees();
	for (fIndex in feeArray) {
		thisFee = feeArray[fIndex];
		if (thisFee.code == fCode) 
			retValue++;
	}
	return retValue;
}


function calculateAppPenaltyFee() {

	penalizedSubGroup = "PG";
	var feeSchedule = aa.finance.getFeeScheduleByCapID(capId).getOutput()

	baseFees = new Array();
	baseFees["Rental Housing"] = "RNTH070";
	baseFees["Taxi Owner"] = "TXIB030";
	baseFees["Vehicle for Hire Owner"] = "TXIB030";
	baseFees["Tow Owner"] = "TOWB030";

	licenseFees = new Array();
	licenseFees["General"] = "GEN010";		// qty is ASI "# of People Working in Lancaster"
	licenseFees["Alcohol"] = "GEN010";		// qty is ASI "# of People Working in Lancaster"
	licenseFees["Internet Lounge"] = "GEN010";		// qty is ASI "# of People Working in Lancaster"
	licenseFees["Newsrack"] = "GEN010";		// qty is ASI "# of People Working in Lancaster"
	licenseFees["Street Performer"] = "GEN010";		// qty is ASI "# of People Working in Lancaster"
	licenseFees["Bingo"] = "BNGO040";
	licenseFees["Fortune Teller"] = "FRTL040";
	licenseFees["Group Home"] = "GH010";
	licenseFees["Massage Business Permit"] = "MSGO010";
	licenseFees["Massage Technician Permit"] = "MSGT010"
	licenseFees["Pawn Shop - Second Hand Dealer"] = "PWN040";
	licenseFees["Rental Housing"] = "RNTH070";	
	licenseFees["Salon Rental"] = "SRNTL010";	// uses fee indicator
	licenseFees["Taxi Driver"] = "TAXTOWD040";
	licenseFees["Vehicle for Hire Driver"] = "TAXTOWD040";
	licenseFees["Tow Driver"] = "TAXTOWD040";
	licenseFees["Taxi Owner"] = "TXIB030";		// qty is ASI "Number of Vehicles
	licenseFees["Vehicle for Hire Owner"] = "TXIB030";		// qty is ASI "Number of Vehicles
	licenseFees["Tobacco Retailer"] = "TOBCO030";
	licenseFees["Tow Owner"] = "TOWB030";
	
	renewalFees = new Array();
	renewalFees["General"] = "BL_GEN_RENEW;GENR010";		// qty is ASI "# of People Working in Lancaster"
	renewalFees["Alcohol"] = "BL_GEN_RENEW;GENR010";		// qty is ASI "# of People Working in Lancaster"
	renewalFees["Internet Lounge"] = "BL_GEN_RENEW;GENR010";		// qty is ASI "# of People Working in Lancaster"
	renewalFees["Newsrack"] = "BL_GEN_RENEW;GENR010";
	renewalFees["Street Performer"] = "BL_GEN_RENEW;GENR010";		// qty is ASI "# of People Working in Lancaster"
	renewalFees["Bingo"] = "BINGO_RENEW;BNGOR020";
	renewalFees["Fortune Teller"] = "FRTL_RENEW;FRTLR020";
	renewalFees["Group Home"] = "GH_RENEW;GHR020";
	renewalFees["Massage Business Permit"] = "MSGO_RENEW;MSGOR020";
	renewalFees["Massage Technician Permit"] = "MSGT_RENEW;MSGTR020"
	renewalFees["Pawn Shop - Second Hand Dealer"] = "PWN_RENEW;PWNR010";
	renewalFees["Rental Housing"] = "RNTH_RENEW;RNTHR010";	
	renewalFees["Salon Rental"] = "SRNTL_RENEW;SRNTLR010";	// uses fee indicator
	renewalFees["Taxi Driver"] = "TAXTOWD_RENEW;TAXTOWDR020";
	renewalFees["Vehicle For Hire Driver"] = "TAXTOWD_RENEW;TAXTOWDR020";
	renewalFees["Tow Driver"] = "TAXTOWD_RENEW;TAXTOWDR020";
	renewalFees["Taxi Owner"] = "TXIB_RENEW;TXIBR020";		// qty is ASI "Number of Vehicles
	renewalFees["Vehicle For Hire Owner"] = "TXIB_RENEW;TXIB030";		// qty is ASI "Number of Vehicles
	renewalFees["Tobacco Retailer"] = "TOBACCO_RENEW;TOBCOR010";
	renewalFees["Tow Owner"] = "TOWB_RENEW;TOWBR020";


	processingFees = new Array();
	processingFees["General"] = "GEN090";
	processingFees["Alcohol"] = "GEN090";
	processingFees["Internet Lounge"] = "GEN090";
	processingFees["Newsrack"] = "GEN090";
	processingFees["Street Performer"] = "GEN090";
	processingFees["Fortune Teller"] = "FRTL050";
	processingFees["Pawn Shop - Second Hand Dealer"] = "PWN050"
//	processingFees["Rental Housing"] = "RNTH100";
	processingFees["Tobacco Retailer"] = "TOBCO011";
	processingFees["Salon Rental"] = "SRNTL040";


	SBFees = new Array();
	SBFees["General"] = "GEN050";
	SBFees["Alcohol"] = "GEN050";
	SBFees["Internet Lounge"] = "GEN050";
	SBFees["Newsrack"] = "GEN050";
	SBFees["Street Performer"] = "GEN050";
	SBFees["Bingo"] = "BNGO020";
	SBFees["Fortune Teller"] = "FRTL020";
	SBFees["Group Home"] = "GH020";
	SBFees["Massage Business Permit"] = "MSGO20";
	SBFees["Massage Technician Permit"] = "MSGT020";
	SBFees["Pawn Shop - Second Hand Dealer"] = "PWN020";
	SBFees["Rental Housing"] = "RNTH030";
	SBFees["Salon Rental"] = "SRNTL020";
	SBFees["Taxi Driver"] = "TAXTOWD020";
	SBFees["Vehicle for Hire Driver"] = "TAXTOWD020";
	SBFees["Tow Driver"] = "TAXTOWD020";
	SBFees["Taxi Owner"] = "TXIB020";
	SBFees["Vehicle for Hire Owner"] = "TXIB020";
	SBFees["Tobacco Retailer"] = "TOBCO020";
	SBFees["Tow Owner"] = "TOWB020"


	try {
	var date1 = null;
	licType = "" + appTypeArray[2];
	if (licType == "Rental Housing")
		date1 = convertDate(AInfo['Purchase Date or Rental Start Date']);
	else
		date1 = convertDate(AInfo["Business Open Date"]);
	logDebug("Business Open Date: "+date1);
	nonProfit = false;
	if (licType == "General" && AInfo["Business Ownership Type"] == "Non-Profit") nonProfit = true;
	if (licType == "Group Home" && AInfo["Is the Group Home licensed by the State of California?"] == "Yes") nonProfit = true;
	
	if (date1) {
		licType = "" + appTypeArray[2];
		var monthsLate = calcMonthsLate(date1);
		logDebug("Months late = " + monthsLate);
		if (monthsLate > 0) {
			penalizedAmount = 0;
			if (matches(licType, "Rental Housing", "Taxi Owner", "Vehicle for Hire Owner", "Tow Owner")) {
				refFeeItem = getFeeDefByCode(feeSchedule, baseFees[licType]);
				penalizedAmount = parseFloat(refFeeItem.formula);
			}
			else {
				penalizedAmount = getSubGrpFeeAmt("PG"); // this needs to only be the amt of the FIRST license fee. Maybe divide by number of times the fee exists?
				if (penalizedAmount > 0) penalizedAmount = penalizedAmount / getFeeCount(licenseFees[licType]);
			}
			renewFeeInfo = "" + renewalFees[licType];
			renewFeePieces = renewFeeInfo.split(";");
			if (renewFeePieces.length == 2) {
				renewFeeSchedule = renewFeePieces[0];
				renewFeeCode = renewFeePieces[1];
			}
			else { renewFeeSchedule = null; renewFeeCode = null;  }  // bad
			logDebug("Renewal fee code = " + renewFeeCode);
			logDebug("Renewal fee schedule = " + renewFeeSchedule);
			logDebug("Penalized amount = " + penalizedAmount);
			if (penalizedAmount >= 0) {
				if (penalizedAmount > 0) {
					if(monthsLate >= 1) addFee("BLPN010","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 20%
					if(monthsLate >= 2) addFee("BLPN020","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 30%
					if(monthsLate >= 3) addFee("BLPN030","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 40%
					if(monthsLate >= 4) addFee("BLPN040","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 50%
				}

				if (monthsLate >= 12) {
					// add first instance of license renewal fee, process fee and SB1186 fee
					if (matches(licType, "General", "Group Home")) {
						if (!nonProfit)  { 
							addFeeFromSchFromASI("# of People Working in Lancaster",renewFeeCode, renewFeeSchedule);
							if (processingFees[licType]) addFee(processingFees[licType], feeSchedule, "FINAL", 1, "Y");
						}
					}
					else {
						if (matches(licType, "Alcohol", "Internet Lounge",  "Street Performer")) {
							addFeeFromSchFromASI("# of People Working in Lancaster",renewFeeCode, renewFeeSchedule);		
						}
						else {
							if (licType == "Rental Housing") addFeeFromSchFromASI("Total Number of Dwelling Units",renewFeeCode, renewFeeSchedule);
							else {
								if (matches(licType, "Taxi Owner", "Vehicle for Hire Owner")) addFeeFromSchFromASI("Number of Vehicles (Fee Associated)",renewFeeCode, renewFeeSchedule)
								else {
									if (licType == "Tow Owner") addFeeFromSchFromASI("Number of Vehicles Operating in Lancaster", renewFeeCode, renewalFeeSchedule);
									else addFee(renewFeeCode, renewFeeSchedule, "FINAL", 1, "Y");
								}
							}
						}
						if (processingFees[licType]) addFee(processingFees[licType], feeSchedule, "FINAL", 1, "Y");
					}
					if (SBFees[licType]) addFee(SBFees[licType], feeSchedule, "FINAL", 1, "Y"); 
				}
			
				if (penalizedAmount > 0) {
					if (monthsLate >= 13) addFee("BLPN010","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 20%
					if (monthsLate >= 14) addFee("BLPN020","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 30%
					if (monthsLate >= 15) addFee("BLPN030","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 40%
					if (monthsLate >= 16) addFee("BLPN040","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 50%
				}

				if (monthsLate >= 24) {
					// add second instance of license renewal fee, process fee and SB1186
					if (matches(licType, "General", "Group Home")) {
						if (!nonProfit)  { 
							addFeeFromSchFromASI("# of People Working in Lancaster",renewFeeCode, renewFeeSchedule);
							if (processingFees[licType]) addFee(processingFees[licType], feeSchedule, "FINAL", 1, "Y");
						}
					}
					else {
						if (matches(licType, "Alcohol", "Internet Lounge",  "Street Performer")) {
							addFeeFromSchFromASI("# of People Working in Lancaster",renewFeeCode, renewFeeSchedule);		
						}
						else {
							if (licType == "Rental Housing") addFeeFromSchFromASI("Total Number of Dwelling Units",renewFeeCode, renewFeeSchedule);
							else {
								if (matches(licType, "Taxi Owner", "Vehicle for Hire Owner")) addFeeFromSchFromASI("Number of Vehicles (Fee Associated)",renewFeeCode, renewFeeSchedule)
								else {
									if (licType == "Tow Owner") addFeeFromSchFromASI("Number of Vehicles Operating in Lancaster", renewFeeCode, renewalFeeSchedule);
									else addFee(renewFeeCode, renewFeeSchedule, "FINAL", 1, "Y");
								}
							}
						}
						if (processingFees[licType]) addFee(processingFees[licType], feeSchedule, "FINAL", 1, "Y");
					}
					if (SBFees[licType]) addFee(SBFees[licType], feeSchedule, "FINAL", 1, "Y"); 
				}
				if (penalizedAmount > 0) {
					if (monthsLate >= 25) addFee("BLPN010","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 20%
					if (monthsLate >= 26) addFee("BLPN020","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 30%
					if (monthsLate >= 27) addFee("BLPN030","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 40%
					if (monthsLate >= 28) addFee("BLPN040","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 50%
				}

				if (monthsLate >= 36) {
					// add third instance of license renewal fee, process fee and SB1186
					if (matches(licType, "General", "Group Home")) {
						if (!nonProfit)  { 
							addFeeFromSchFromASI("# of People Working in Lancaster",renewFeeCode, renewFeeSchedule);
							if (processingFees[licType]) addFee(processingFees[licType], feeSchedule, "FINAL", 1, "Y");
						}
					}
					else {
						if (matches(licType, "Alcohol", "Internet Lounge",  "Street Performer")) {
							addFeeFromSchFromASI("# of People Working in Lancaster",renewFeeCode, renewFeeSchedule);		
						}
						else {
							if (licType == "Rental Housing") addFeeFromSchFromASI("Total Number of Dwelling Units",renewFeeCode, renewFeeSchedule);
							else {
								if (matches(licType, "Taxi Owner", "Vehicle for Hire Owner")) addFeeFromSchFromASI("Number of Vehicles (Fee Associated)",renewFeeCode, renewFeeSchedule)
								else {
									if (licType == "Tow Owner") addFeeFromSchFromASI("Number of Vehicles Operating in Lancaster", renewFeeCode, renewalFeeSchedule);
									else addFee(renewFeeCode, renewFeeSchedule, "FINAL", 1, "Y");
								}
							}
						}
						if (processingFees[licType]) addFee(processingFees[licType], feeSchedule, "FINAL", 1, "Y");
					}
					if (SBFees[licType]) addFee(SBFees[licType], feeSchedule, "FINAL", 1, "Y"); 
				}
				if (penalizedAmount > 0) {
					if (monthsLate >= 37) addFee("BLPN010","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 20%
					if (monthsLate >= 38) addFee("BLPN020","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 30%
					if (monthsLate >= 39) addFee("BLPN030","BL_PENALTY","FINAL",penalizedAmount,"Y"); // 40%
				}
			}
		}
	}
	} 
	catch (err) { logDebug("Error calculating penalty fee : " + err); }
}

function getParentCapVIAPartialCap(capid)
{
logDebug("START getParentCapVIAPartialCap! with capid :"+capid );
	//3. Get parent license CAPID from renewal CAP table
	var result2 = aa.cap.getProjectByChildCapID(capid, "Renewal", "Incomplete");
	
// placed this check b/c in latest version the status of the renewal records is not tracking properly
	if (!result2.getSuccess()) {
		var result2 = aa.cap.getProjectByChildCapID(capid, "Renewal", "");
	}
	
	if(result2.getSuccess())
	{
		licenseProjects = result2.getOutput();
		if (licenseProjects == null || licenseProjects.length == 0)
		{
			logDebug("ERROR: Failed to get parent CAP with partial CAPID(" + partialCapID + ")");
			return null;
		}
		licenseProject = licenseProjects[0];

		logDebug("inside getParentCapVIAPartialCap and about to update relationship... licenseProject PrintObj is:");
		printObjProperties(licenseProject);
		
		// update renewal relationship from partial cap to real cap
		// 08-07-2018 this is no need for the includes_custom script
//		updateRelationship2RealCAP(licenseProject.getProjectID(), capid);

		logDebug("after the update of the relationship... I should retrun the project ID of:"+licenseProject.getProjectID());
		
		//4. Return parent license CAP ID.
		return licenseProject.getProjectID();
	}
	else
	{
		return null;
	}
}



function getParentCapIDForComplete(capid) {

logDebug("START OF GET PARENT CAP ID FOR COMPLETE IN INCLUDES CUSTOM");
	if (capid == null || aa.util.instanceOfString(capid))
	{
		return null;
	}
	//1. Get parent license for review

	var result = aa.cap.getProjectByChildCapID(capid, "Renewal", "Complete");
	if (!result.getSuccess()) {
		var result = aa.cap.getProjectByChildCapID(capid, "Renewal", "");
	}

    if(result.getSuccess())
    {
		var projectScriptModels = result.getOutput();
		if (projectScriptModels == null || projectScriptModels.length == 0)
		{
			logDebug("ERROR: Failed to get parent CAP with CAPID(" + capid + ") for review");
			return null;
		}
		//2. return parent CAPID.
		var projectScriptModel = projectScriptModels[0];
logDebug("returning a project model project id from GET PARENT CAP ID FOR COMPLETE IN INCLUDES CUSTOM:"+projectScriptModel.getProjectID());
		return projectScriptModel.getProjectID();
	}  
    else 
    {
      logDebug("ERROR: Failed to get parent CAP by child CAP(" + capid + ") for review: " + result.getErrorMessage());
      return null;
    }
}


function replaceASITables(pFromCapId, pToCapId) {
	// Function dependencies on addASITable()
	// par3 is optional 0 based string array of table to ignore
	var itemCap = pFromCapId;

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
		var tai = ta.iterator();
	var tableArr = new Array();
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		ignoreArr = arguments[2];
		limitCopy = true;
	}
	while (tai.hasNext()) {
		var tsm = tai.next();

		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName() + "";
		var numrows = 0;

		//Check list
		if (limitCopy) {
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++)
				if (ignoreArr[i] == tn) {
					ignore = true;
					break;
				}
			if (ignore)
				continue;
		}
		if (!tsm.rowIndex.isEmpty()) {
			var tsmfldi = tsm.getTableField().iterator();
			var tsmcoli = tsm.getColumns().iterator();
			var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
			var numrows = 1;
			while (tsmfldi.hasNext()) // cycle through fields
			{
				if (!tsmcoli.hasNext()) // cycle through columns
				{
					var tsmcoli = tsm.getColumns().iterator();
					tempArray.push(tempObject); // end of record
					var tempObject = new Array(); // clear the temp obj
					numrows++;
				}
				var tcol = tsmcoli.next();
				var tval = tsmfldi.next();

				var readOnly = 'N';
				if (readOnlyi.hasNext()) {
					readOnly = readOnlyi.next();
				}

				var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
				tempObject[tcol.getColumnName()] = fieldInfo;
				//tempObject[tcol.getColumnName()] = tval;
			}

			tempArray.push(tempObject); // end of record
		}

		removeASITable(tn, pToCapId);
		addASITable(tn, tempArray, pToCapId);
		logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	}
} 
 



function calculateInitialExpDate() {
	startDate = null;
	now = new Date();
	if (appTypeArray[2] == "Rental Housing") {
		if (AInfo['Purchase Date or Rental Start Date'] && AInfo['Purchase Date or Rental Start Date'] != "") {
			startDate = AInfo['Purchase Date or Rental Start Date'];
		}
	}
	else {
		if (AInfo['Business Open Date'] && AInfo['Business Open Date'] != "") {
			startDate = AInfo['Business Open Date'];
		}
		else {
			startDate = jsDateToMMDDYYYY(now);
		}
	}
	startDateJS = new Date(startDate);
	if (startDate == null || startDateJS.getTime() >= now.getTime()) {
		// start date is in the future
		tmpNewDateJS = new Date(now.getFullYear(), startDateJS.getMonth(), 0);
		if (tmpNewDateJS.getTime() <= startDateJS.getTime()) {
			// we backed up into the past,bump out
			tmpNewDateJS = new Date(dateAddMonths(jsDateToMMDDYYYY(tmpNewDateJS), 12));
		}
	}
	else {
		// start date is in the past
		tmpNewDateJS = new Date(startDateJS.getFullYear(), startDateJS.getMonth(), 0);
		while (tmpNewDateJS.getTime() < now.getTime()) {
			tmpNewDateJS = new Date(dateAddMonths(jsDateToMMDDYYYY(tmpNewDateJS), 12));
		}
	}	
	return jsDateToMMDDYYYY(tmpNewDateJS);
}


function runReportAsync(reportTemplate, vRParams,rModule, itemCapId) {
	var vChangeReportName = "";
	var vAsyncScript = "RUNREPORTASYNC";
	envParameters = aa.util.newHashMap();
	//Change Report Name Requested
	if (arguments.length > 3) {
		vChangeReportName = arguments[3]; // use provided report name
	}
	var envParameters = aa.util.newHashMap();
 	envParameters.put("ServProvCode", aa.getServiceProviderCode());
    	envParameters.put("CapId", itemCapId);
    	envParameters.put("CustomCapId", itemCapId.getCustomID());
   	envParameters.put("ReportTemplate", reportTemplate);
   	envParameters.put("vRParams", vRParams);
        envParameters.put("Module", rModule);
        envParameters.put("ReportUser", "ADMIN");
	
	//Start modification to support batch script
	aa.env.setValue("reportTemplate", reportTemplate);
	aa.env.setValue("vRParams", vRParams);
	aa.env.setValue("vChangeReportName", vChangeReportName);
	aa.env.setValue("CapId", itemCapId);	
	aa.env.setValue("Module", rModule);
	//call runReportASync script
	logDebug("Attempting to run: " + vAsyncScript);
	aa.runAsyncScript(vAsyncScript, envParameters);
	
	return true;
}

function getParentCapIDForInComplete(capid) {
	if (capid == null || aa.util.instanceOfString(capid))
	{
		return null;
	}
	//1. Get parent license for review
	var result = aa.cap.getProjectByChildCapID(capid, "Renewal", "Incomplete");
    if(result.getSuccess())
	{
		var projectScriptModels = result.getOutput();
		if (projectScriptModels == null || projectScriptModels.length == 0)
		{
			aa.print("ERROR: Failed to get parent CAP with CAPID(" + capid + ") for review");
			return null;
		}
		//2. return parent CAPID.
		var projectScriptModel = projectScriptModels[0];
		return projectScriptModel.getProjectID();
	}  
    else 
    {
      logDebug("ERROR: Failed to get parent CAP by child CAP(" + capid + ") for review: " + result.getErrorMessage());
      return null;
    }
}


function updateLicenseWithRenewalASI() {
	showDebug = true;
	showMessage = true;
	aa.print("<font color=red><b>START</b> of updateLicenseWithRenewalASI "+capId+" </font>");
	
	var newCanCkbox = getAppSpecific("Cultivation");
	var newCanopyVal = getAppSpecific("Square Foot of Canopy");
	
	var newManuCkbox = getAppSpecific("Manufacturing");
	var newManuVal = getAppSpecific("Square Foot of Manufacturing");
	
	var newSqTotal = getAppSpecific("Square Footage (SQFT) of Your Business");
	
	editAppSpecific("Cultivation",newCanCkbox,pCapId);
	editAppSpecific("Square Foot of Canopy",newCanopyVal,pCapId);
	
	editAppSpecific("Manufacturing",newManuCkbox,pCapId);
	editAppSpecific("Square Foot of Manufacturing",newManuVal,pCapId);
	
	editAppSpecific("Square Footage (SQFT) of Your Business",newSqTotal,pCapId);
	
	aa.print("<font color=red><b>END</b> of updateLicenseWithRenewalASI "+capId+" </font>");
}

function cannabisAddAppSpecificTableInfors(tableName, capIDModel, asitFieldArray)
/* * asitFieldArray is Array[Map<columnName, columnValue>] * */
{
	if (asitFieldArray == null || asitFieldArray.length == 0)
	{
		return;
	}
	var asitTableScriptModel = aa.appSpecificTableScript.createTableScriptModel();
	var asitTableModel = asitTableScriptModel.getTabelModel();
	var rowList = asitTableModel.getRows();
	asitTableModel.setSubGroup(tableName);
	for (var i = 0; i < asitFieldArray.length; i++)
	{
		var rowScriptModel = aa.appSpecificTableScript.createRowScriptModel();
		var rowModel = rowScriptModel.getRow();
		rowModel.setFields(asitFieldArray[i]);
		rowList.add(rowModel);
	}
	asitTableModel.group = "LIC_CANN_LOC";
	var inforsAdded = false;
	var inforsAdded = aa.appSpecificTableScript.addAppSpecificTableInfors(capIDModel, asitTableModel);
	return inforsAdded;
}

/**
* Set update column value. format: Map<rowID, Map<columnName, columnValue>>
**/
function cannabisSetUpdateColumnValue(updateRowsMap, rowID, columnName, columnValue)
{
	var updateFieldsMap = updateRowsMap.get(rowID);
	if (updateFieldsMap == null)
	{
		updateFieldsMap = aa.util.newHashMap();
		updateRowsMap.put(rowID, updateFieldsMap);
	}
	updateFieldsMap.put(columnName, columnValue);
}

/**
* update ASIT rows data. updateRowsMap format: Map<rowID, Map<columnName, columnValue>>
**/
function cannabisUpdateAppSpecificTableInfors(tableName, capIDModel, updateRowsMap/** Map<rowID, Map<columnName, columnValue>> **/)
{
	if (updateRowsMap == null || updateRowsMap.isEmpty())
	{
		return;
	}
	
	var asitTableScriptModel = aa.appSpecificTableScript.createTableScriptModel();
	var asitTableModel = asitTableScriptModel.getTabelModel();
	var rowList = asitTableModel.getRows();
	asitTableModel.setSubGroup(tableName);
	var rowIdArray = updateRowsMap.keySet().toArray();
	for (var i = 0; i < rowIdArray.length; i++)
	{
		var rowScriptModel = aa.appSpecificTableScript.createRowScriptModel();
		var rowModel = rowScriptModel.getRow();
		rowModel.setFields(updateRowsMap.get(rowIdArray[i]));
		rowModel.setId(rowIdArray[i]);
		rowList.add(rowModel);
	}
	var inforsUpdated = false;
	inforsUpdated = aa.appSpecificTableScript.updateAppSpecificTableInfors(capIDModel, asitTableModel);
	return inforsUpdated;
}


function updateCannabisPrimaryTable(parentCapId) {
	showDebug = true;
	showMessage = true;
	var success = true;
	logDebug("<font color=red><b>START</b> of updateCannabisPrimaryTable "+capId+" </font>");

	// table name
	var tableName = "TENANT INFORMATION";
	// rows data, element is Map<columnName, columnValue>.
	
	var myCultivation = AInfo["Cultivation"];
	var myManufacturing = AInfo["Manufacturing"];
	var myTotalSiteSqFt = AInfo["Square Footage (SQFT) of Your Business"];
	var myCanopySqFt = AInfo["Square Foot of Canopy"];
	var myManufacturingSF = AInfo["Square Foot of Manufacturing"];
	var mySuiteNumber = AInfo["Tenant Suite Number"];
	var myBusinessName = AInfo["Doing Business As (DBA) Name"];

	logDebug("**** my values are ****");
	logDebug("myBusinessName:		"+myBusinessName); // = AInfo["DBA Name"];
	logDebug("mySuiteNumber:		"+mySuiteNumber); // = Primary Address Unit Start
	logDebug("myCultivation:		"+myCultivation); // = AInfo["Cultivation"];
	logDebug("myManufacturing:		"+myManufacturing); // = AInfo["Manufacturing"];
	logDebug("myTotalSiteSqFt:		"+myTotalSiteSqFt); // = AInfo["Square Footage (SQFT) of Your Business"];
	logDebug("myCanopySqFt:			"+myCanopySqFt); // = AInfo["Square Foot of Canopy"];
	logDebug("myManufacturingSF:	"+myManufacturingSF); // = AInfo["Square Foot of Manufacturing"];
	
	var searchMap = aa.util.newHashMap(); // Map<columnName, List<columnValue>>
	
	// Create a List object to add the value of Column.
	var columnName ="Business Name";
	var valuesList = aa.util.newArrayList();
	valuesList.add(myBusinessName);
	searchMap.put(columnName, valuesList);
	
	var appSpecificTableInfo = aa.appSpecificTableScript.getAppSpecificTableInfo(parentCapId, tableName, searchMap);
	if (appSpecificTableInfo.getSuccess())
	{
		var appSpecificTableModel = appSpecificTableInfo.getOutput().getAppSpecificTableModel();
		var tableFields = appSpecificTableModel.getTableFields(); // List<BaseField>
		if (tableFields != null)
		{
			logDebug("TABLE FIELDS = " + tableFields);
			logDebug("tableFields size = " + tableFields.size());
		}	
		if (tableFields != null && tableFields.size() > 0)
		{
			var updateRowsMap = aa.util.newHashMap(); 
			for (var i=0; i < tableFields.size(); i++)
			{
				var fieldObject = tableFields.get(i); // BaseField
				logDebug("fieldObject = " + fieldObject);
				//get the column name.
				var columnName = fieldObject.getFieldLabel();
				//get the value of column
				var columnValue = fieldObject.getInputValue();
				//get the row ID 
				var rowID = fieldObject.getRowIndex();
				logDebug(columnName + ": " + columnValue + "   rowID: " + rowID);

				cannabisSetUpdateColumnValue(updateRowsMap, rowID, "Suite Number", mySuiteNumber);
				cannabisSetUpdateColumnValue(updateRowsMap, rowID, "Cultivation", myCultivation);
				cannabisSetUpdateColumnValue(updateRowsMap, rowID, "Manufacturing", myManufacturing );
				cannabisSetUpdateColumnValue(updateRowsMap, rowID, "Total Unit SqFt", myTotalSiteSqFt);
				cannabisSetUpdateColumnValue(updateRowsMap, rowID, "Canopy SqFt", myCanopySqFt);
				cannabisSetUpdateColumnValue(updateRowsMap, rowID, "Manufacturing SF", myManufacturingSF);
			
			}
			if (!updateRowsMap.isEmpty())
			{	
				success = cannabisUpdateAppSpecificTableInfors(tableName, parentCapId, updateRowsMap);
				logDebug("Result of CannabisUpdate Call: " + success);
			}
				
			else 
				{logDebug("no updates identified");}
		}
		else // this is a new row in the table - table is empty
		{
			// table name
			var tableName = "TENANT INFORMATION";
			// rows data, element is Map<columnName, columnValue>.
			var testAsitFieldArray = [];
			//Create a map to save the field and value map.
			// row 1
			var asitFieldsRow1 = aa.util.newHashMap(); // Map<columnName, columnValue>

			asitFieldsRow1.put("Business Name",myBusinessName);
			asitFieldsRow1.put("Suite Number",mySuiteNumber);
			asitFieldsRow1.put("Cultivation", myCultivation);
			asitFieldsRow1.put("Manufacturing", myManufacturing);
			asitFieldsRow1.put("Total Unit SqFt", myTotalSiteSqFt);
			asitFieldsRow1.put("Canopy SqFt", myCanopySqFt);
			asitFieldsRow1.put("Manufacturing SF", myManufacturingSF);
			testAsitFieldArray.push(asitFieldsRow1);

			// add asit data 
			var tenantAppSpecAddOK = false;
			tenantAppSpecAddOK = cannabisAddAppSpecificTableInfors(tableName, parentCapId, testAsitFieldArray);
			return tenantAppSpecAddOK;
		}
	}
	else
	{
		logDebug("Business Name not found in Parent Primary ASIT");
		success = false;
	}
	
	logDebug("<font color=red><b>END</b> of updateCannabisPrimaryTable "+capId+" </font>");
	return success;
}

function copyCannabisTenantInfoToCannabisPrimaryLicenseASIT(tableName, priCapId) {
//showDebug = true;
//showMessage = true;
	logDebug("<font color=red><b>START</b> of copyCannabisTenantInfoToCannabisPrimaryLicenseASIT "+capId+" </font>");
	logDebug("the cap id is:"+capId);
		
	var tenantParentPrimaryCapId = getApplication(AInfo["City of Lancaster License Number"]);

	if (tenantParentPrimaryCapId != '' && tenantParentPrimaryCapId != null) { 
		logDebug("the cap exists!"); 

		var tenantAppSpecUpdateOK = false;
		tenantAppSpecUpdateOK = updateCannabisPrimaryTable(tenantParentPrimaryCapId);
		if (tenantAppSpecUpdateOK ) { 
			logDebug("Data has been updated to Primary License Table"); 
		}
		else { 
			logDebug("Data WAS NOT updated to License Table!!!!!!!!!!!!!");
			showMessage = true; comment("<font color=red><b>WARNING:</b> Tenant Data WAS NOT copied to License Table!</font>");
		}

		// NOW we have to check the total SF on the primary tenant info, 
		// and if it is more thant the ASI we need to create a hold condition.
		
		var primLicTenantTotSF = cannabisGetPrimaryLicASITColumnTotal(tenantParentPrimaryCapId, "TENANT INFORMATION", "Total Unit SqFt");
		var primLicTotSF = getAppSpecific("Square Footage (SQFT) of Your Business", tenantParentPrimaryCapId);
		var primLicOperationSquareFoot = getAppSpecific("Local License Operation Square Footage",tenantParentPrimaryCapId);
		
		if (!primLicOperationSquareFoot) { primLicOperationSquareFoot = 0; logDebug("primLicOperationSquareFoot was null or zero!"); }
		if (!primLicTotSF) { primLicTotSF = 0; logDebug("primLicTotSF was null or zero!"); }

		var primLicTotSFCheck = Number(primLicOperationSquareFoot) + Number(primLicTenantTotSF);

		logDebug("the primary lic Tenant total SF is:"+primLicTenantTotSF);
		logDebug("the primary Lic total SF is:"+primLicTotSF);
		logDebug("the primary license Operation Square Foot is:"+primLicOperationSquareFoot);
		logDebug("the primary Lic Total SF to check is:"+primLicTotSFCheck);
		
		//get the primary license Local License Operation Square Footage
		
		
		if (primLicTotSFCheck > primLicTotSF) {
			logDebug("the tenant total sf on the Primary is GREATER THAN the total square footage of your business!");
			logDebug("because of this, a conditional hold must be done and Primary License must be updated.");
			// place a hold condition on this tenant app so that City can update the Primary first!
			var conditionGroup = "Licensing",
				conditionType = "Cannabis Primary License Needs Update",
				conditionName = "Update to Primary License Require",
				conditionComment = "Addition of unit square feet for this tenant exceeds Total Facility Square feet on the Primary License, additional Site Regulation fee must be paid by the Primary License Holder prior to issuance of Tenant License.",
				impactCode = "Hold",
				condStatus = "Applied",
				auditStatus = "A",
				displayNotice = "Y",
				displayNoticeOnACA = "N",
				condInheretible = "N",
				displayLongDesc = "Y";


            //Create new empty cap condition model and set the expected values.
            var newCondModel = aa.capCondition.getNewConditionScriptModel().getOutput();
			
			logDebug("********* PRINTING the empty condition model! **************");
//			printObjProperties(newCondModel);
			
            newCondModel.setCapID(capId);
            newCondModel.setConditionGroup(conditionGroup);
            newCondModel.setConditionType(conditionType);
            newCondModel.setConditionDescription(conditionName);
            newCondModel.setConditionComment(conditionComment);
            newCondModel.setLongDescripton(conditionComment);
			newCondModel.setDispConditionComment(conditionComment);
			newCondModel.setDispLongDescripton(displayLongDesc);
            newCondModel.setConditionStatus(condStatus);
            newCondModel.setEffectDate(sysDate);
            newCondModel.setIssuedDate(sysDate);
			newCondModel.setStatusDate(sysDate);
            newCondModel.setIssuedByUser(systemUserObj);
            newCondModel.setStatusByUser(systemUserObj);
            newCondModel.setAuditID(currentUserID);
            newCondModel.setAuditStatus(auditStatus);
            newCondModel.setDisplayConditionNotice(displayNotice);
            newCondModel.setDisplayNoticeOnACA(displayNoticeOnACA);
            newCondModel.setImpactCode(impactCode);
            newCondModel.setInheritable(condInheretible);

			logDebug("********* PRINTING the POPULATED condition model! **************");
			printObjProperties(newCondModel);

logDebug("calling create cap condition!");
            aa.capCondition.createCapCondition(newCondModel);
logDebug("finished calling create cap condition!");
		}
		else {
			logDebug("the tenant total sf on the Primary is less than or equal to the total square footage of your business!");
			logDebug(" no update of fees or conditional hold is necessary!");
		}
	}
	else { 
		logDebug("the cap does not exist!"); 
		showMessage = true; comment("<font color=red><b>WARNING:</b> Parent Primary License does not exist in system!</font>");
	}
//	showDebug = true;
//	showMessage = true;
	logDebug("<font color=red><b>END</b> of copyCannabisTenantInfoToCannabisPrimaryLicenseASIT</font>");
}

function cannabisGetPrimaryLicASITColumnTotal(aCapId, aTableName, aColName) {
	logDebug("*********** START of cannabisGetPrimaryLicASITColumnTotal");
	logDebug("*** aCapId:"+aCapId);
	logDebug("*** aTableName:"+aTableName);
	logDebug("*** aColName:"+aColName);

	if (controlString == "ApplicationSubmitBefore") {
		loadASITablesBefore();
		
		
		if (typeof (eval(aTableName)) == "object") {
			var tPrimarySiteInfo =  eval(aTableName);
		}
		else {
			logDebug("could not determine table object!");
		}
	}
	else {
		var tPrimarySiteInfo = loadASITable(aTableName, aCapId);
	}
	
	if (tPrimarySiteInfo) {
		logDebug("there are this many rows in the table:" + tPrimarySiteInfo.length );
		var arrRowID;
		var xTotSF = 0;
		for (arrRowID in tPrimarySiteInfo) {
			var myTRow = tPrimarySiteInfo[arrRowID];
			for(myTRowKey in myTRow){
				if (myTRowKey == aColName) {
					xTotSF += Number(myTRow[myTRowKey]);
				}
			}
		}
		logDebug("The total SF is: "+xTotSF);
	}
	else { 
		logDebug("no table information exists on this license:"+aCapId);
	}

	logDebug("*********** END of cannabisGetPrimaryLicASITColumnTotal");
	
	return xTotSF;
}

function sumPrimaryASITSquareFeetAndReplaceTotalSFASI() {
/* ******************
 optional param that is the capId of a Primary Lic to run this on

 if you send in blanks for fee schedule no fee will be assessed!
*/
	logDebug("START of sumPrimaryASITSquareFeetAndReplaceTotalSFASI");

	var retVal = false;
		
	var sumSFPrimaryCapId = capId;
	if (arguments.length > 0) {
		sumSFPrimaryCapId = arguments[0]; 
		logDebug("passed in a capId!");
	} 

	logDebug("so the cap id is:"+sumSFPrimaryCapId);
	
	var sumTotSF = cannabisGetPrimaryLicASITColumnTotal(sumSFPrimaryCapId, "SITE INFORMATION", "Total SqFt") || 0;

	var prevTotSF = getAppSpecific("Total Facility Sqft Tracking",sumSFPrimaryCapId);

	
	if ( sumTotSF <= 0 || sumTotSF <= prevTotSF ) {
		cancel = true;
		logDebug("the sum total was less than or equal to zero OR less than or equal to the previous SF");
		logDebug("sum total was:"+sumTotSF);
		logDebug("previous SF was:"+prevTotSF);
		editAppSpecific("Square Footage (SQFT) of Your Business",sumTotSF,sumSFPrimaryCapId);
		editAppSpecific("Total Facility Sqft Tracking",sumTotSF,sumSFPrimaryCapId);
	}
	else {
		// check to see if this is the first time.
		if (prevTotSF == 0) {
			logDebug("this is the first time you have copied site info to total sf!");
			logDebug("you should now assess the fee for the first time!");
			//we assume the fee was collected at license issuance no need to add fee.
		} 
		else {  
			logDebug("you have copied total sf before, so now we check for changes and proRate the fees!");
			logDebug("the previous Total SF:"+prevTotSF);
			logDebug("the sum total SF to add is:"+sumTotSF);
			
			var yearlyTot = 0;

			//1			if old SF was < 31K and total new SF < 31K do nothing (base fee of $68,887)
			if (prevTotSF <= 30999 && sumTotSF <= 30999 ){																
				logDebug("there has been no change in fee amount since total has not exceed 30K SF yet!");
			}
			//2			if old SF was < 31,000 and total new SF >= 31,000 but < 110,000 (Base fee of $68,887 plus $524 per 1000sqft)			
			else if ( prevTotSF <= 30999 && sumTotSF >= 31000 && sumTotSF < 110000) {											
				logDebug("you have exceeded the first 31K in SF, calculating fee for additional SF!");
				var newAddedSF = sumTotSF - 30000; // already paid for the first 30K
				logDebug("newAddedSF is:"+newAddedSF);
				logDebug("calculating yearly total fee...");
				
				yearlyTot = 524 * Math.floor(newAddedSF/1000);
				logDebug("the yearly total is:"+yearlyTot);
			} //2-1 if old SF was >= 3100 and prev < 100000 and new sum < 110000
			else if ( prevTotSF >= 31000 && prevTotSF < 110000 && sumTotSF < 110000 ) {
				logDebug("you were already over 31K SF, but are still under 110K SF!");
				var newAddedSF = sumTotSF - prevTotSF; // already paid for the first 30K
				logDebug("newAddedSF is:"+newAddedSF);
				logDebug("calculating yearly total fee...");
				
				yearlyTot = 524 * Math.floor(newAddedSF/1000);
				logDebug("the yearly total is:"+yearlyTot);
			}
			else if (prevTotSF < 110000 && sumTotSF >= 110000 && sumTotSF < 111000 ) {
				logDebug("you have just crossed over to 110K SF tier!");
				yearlyTot = 114967;
				logDebug("the yearly total is:"+yearlyTot);
				logDebug("************* WARNING- this amount may be incorrect! ******************");
			}
			else if ( prevTotSF < 110000 && sumTotSF >= 111000 ) {
				logDebug("you have just crossed over 110K SF and have additional SF!");
				var newAddedSF = sumTotSF - 110000; // already paid for the first 30K
				logDebug("newAddedSF is:"+newAddedSF);
				logDebug("calculating yearly total fee...");
				
				yearlyTot = 114967 + (418 * Math.floor(newAddedSF/1000));
				logDebug("the yearly total is:"+yearlyTot);
				logDebug("************* WARNING- this amount may be incorrect! ******************");
			} 
			else if ( prevTotSF >= 110000 && sumTotSF >= 110000 && sumTotSF < 111000 ) {
				logDebug("paid 110K base fee, but not yet over 111000! no fee added");
				yearlyTot = 0;
				logDebug("the yearly total is:"+yearlyTot);
			}
			else if ( prevTotSF >= 110000 && sumTotSF >= 111000 ) {
				//06-27-2018: you need to take the modulus of prevTotSF/1000 plus newAddSF and 
				//				take the floor of THAT/1000 to get the yearlyTot
				logDebug("Paid 110K base fee amount, now adding more than 111000");
				var newAddedSF = sumTotSF - prevTotSF; // already paid for the first 30K
				logDebug("newAddedSF is:"+newAddedSF);
				
				newAddedSF += (prevTotSF % 1000);
				logDebug("after adding modulus of prevtot/1000 newAddedSF is:"+newAddedSF);
				
				logDebug("calculating yearly total fee...");
				yearlyTot = 418 * Math.floor(newAddedSF/1000);
				logDebug("the yearly total is:"+yearlyTot);
			} 
			else {
				logDebug("WARNING! Did not compute previous total SF:"+prevTotSF+" and sum Total SF:"+sumTotSF);
			}
			
			logDebug("now calculating remaining months of the Primary License");
			var thisExp = aa.expiration.getLicensesByCapID(sumSFPrimaryCapId);
			if (thisExp.getSuccess()) {
				var b1Exp = thisExp.getOutput();

				var expDate = b1Exp.getExpDate();
				logDebug("exp date is: "+expDate);
				if (expDate) {
					var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
				}
				logDebug("after if exp date is: "+expDate);
		
				var expDate1 = convertDate(expDate);	//expiration date
				var fDate = new Date();					// today
				
				logDebug("dates to compare are--> Exp Date:"+expDate1+" and today:"+fDate);
				var expDate1Month = expDate1.getMonth();
				var fDateMonth = fDate.getMonth();
				logDebug("and comparing the months --> ExpDateMonth:"+expDate1Month+" and today month:"+fDateMonth);

				var monthsToProrate = 0;
				if ( expDate1Month < fDateMonth ) {
					monthsToProrate = 13 - (fDateMonth - expDate1Month);
				} 
				else {
					monthsToProrate = expDate1Month - fDateMonth + 1;
				}
				logDebug("the number of months for proration calc is:"+monthsToProrate)

				var percentOfYearlyFee = Number(Math.floor((monthsToProrate)/(12)+'e4')+'e-4');
				logDebug("the prorate percentage is:"+percentOfYearlyFee);
				
				var proratedFee = Number(percentOfYearlyFee * yearlyTot).toFixed(2);
				logDebug("Now Charging $"+proratedFee);
				
				if ( proratedFee > 0 ) {
					addFee("MCL010P","LIC_CANN_LOC_PRORATE","FINAL",proratedFee,"N",sumSFPrimaryCapId);
				}
				else {
					logDebug("Fee not added because prorated fee is less than Zero");
				}
			}
			else {
				logDebug("ERROR: UNABLE TO DETERMINE EXP DATE! PLEASE APPLY FEE MANUALLY!");
				cancel = true;
				// if this ever happens.. this record will need to have the tracking Sqft updated
				// manually as well (supervisor?)
			}

			// now update the ASI for current and previous amounts!
			// copy the total to both current total and previous
			logDebug("SF will update to:"+sumTotSF);
			editAppSpecific("Square Footage (SQFT) of Your Business",sumTotSF,sumSFPrimaryCapId);
			editAppSpecific("Total Facility Sqft Tracking",sumTotSF,sumSFPrimaryCapId);
		}
		retVal = true;			
	}
	logDebug("END of sumPrimaryASITSquareFeetAndReplaceTotalSFASI");
	return retVal;
}

function copyEmployeeNameToAppName() {
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess()){
		var primaryFlag ='';
		var Contacts = capContactResult.getOutput();

		for (var contactIdx in Contacts){
			primaryFlag = Contacts[contactIdx].getCapContactModel().getPrimaryFlag();
			firstName = Contacts[contactIdx].getCapContactModel().getFirstName();
			middleName = Contacts[contactIdx].getCapContactModel().getMiddleName();
			lastName = Contacts[contactIdx].getCapContactModel().getLastName();

			if ('Y'== primaryFlag){		
				contFull = (firstName+ " " +middleName+ " " +lastName); 
				contactFullNames = contFull.replace(/null/g, ""); 
 				editAppName(contactFullNames);
				comment("New App Name: " +contactFullNames);
				comment("Employee Name: "+ firstName +" "+ middleName +" "+ lastName); 
				
			}else{
				comment("Employee name undefined");
			}
		}	
	}
}

function printObjProperties(obj){
    var idx;

    if(obj.getClass != null){
        logDebug("************* " + obj.getClass() + " *************");
    }
	else {
		logDebug("this is not an object with a class!");
	}

    for(idx in obj){
        if (typeof (obj[idx]) == "function") {
            try {
                logDebug(idx + "==>  " + obj[idx]());
            } catch (ex) { }
        } else {
            logDebug(idx + ":  " + obj[idx]);
        }
    }
}


function sumPrimaryAppASITSquareFeetAndReplaceTotalSFASI() {

	showDebug = true;
	showMessage = true;
	logDebug("START of sumPrimaryAppASITSquareFeetAndReplaceTotalSFASI");
        aa.print("START of sumPrimaryAppASITSquareFeetAndReplaceTotalSFASI");
		
	var sumTotSF = cannabisGetPrimaryLicASITColumnTotal(capId,"SITE INFORMATION", "Total SqFt") || 0;

	// now update the ASI for current and previous amounts!
	// copy the total to both current total and previous
		editAppSpecific("Square Footage (SQFT) of Your Business",sumTotSF);
		editAppSpecific("Total Facility Sqft Tracking",sumTotSF);		

	logDebug("END of sumPrimaryAppASITSquareFeetAndReplaceTotalSFASI");
    aa.print("END of sumPrimaryAppASITSquareFeetAndReplaceTotalSFASI");
}


function sumPrimaryRenewalASITSquareFeetAndReplaceTotalSFASI() {

	showDebug = true;
	showMessage = true;
	logDebug("START of sumPrimaryRenewalASITSquareFeetAndReplaceTotalSFASI");
	aa.print("START of sumPrimaryRenewalASITSquareFeetAndReplaceTotalSFASI");
		
	var prevTotSF = getAppSpecific("Square Footage (SQFT) of Your Business",capId);
	var sumTotSF = cannabisGetPrimaryLicASITColumnTotal(capId, "SITE INFORMATION", "Total SqFt") || 0;

	if (sumTotSF <= prevTotSF){ 
		logDebug("The new facility Sqft total is less than or equal to the Previous Facility Sqft");

	}
	else {
		logDebug("The new facility Sqft total is greater than the Previous Facility Sqft");
	}	
	
	//Display Sqft values
	logDebug("Previous Facility SF was:"+prevTotSF);
	aa.print("Previous Facility SF was:"+prevTotSF);
	logDebug("New Facility SQFT is:"+sumTotSF);
	aa.print("New Facility SQFT is:"+sumTotSF);

	
	//Edit Facility Sqft ASI fields
	editAppSpecific("Square Footage (SQFT) of Your Business",sumTotSF);
	editAppSpecific("Total Facility Sqft Tracking",sumTotSF);
	updateFee("MCLR020","LIC_CANN_LOC_REN","FINAL",prevTotSF,"N");

	logDebug("END of sumPrimaryRenewalASITSquareFeetAndReplaceTotalSFASI");
	aa.print("END of sumPrimaryRenewalASITSquareFeetAndReplaceTotalSFASI");
}


function sumPrimaryRenewalCanopySquareFeetAndReplaceTotalSFASI() {

	showDebug = true;
	showMessage = true;
	logDebug("START of sumPrimaryRenewalCanopySquareFeetAndReplaceTotalSFASI");
	aa.print("START of sumPrimaryRenewalCanopySquareFeetAndReplaceTotalSFASI");
	
	var prevTotCanopySF = getAppSpecific("Total Square Foot of Canopy",capId);
	var primCanopySF = getAppSpecific("Square Foot of Canopy",capId);
	var tenantCanopySF = cannabisGetPrimaryLicASITColumnTotal(capId,"TENANT INFORMATION", "Canopy SqFt") || 0;
		
	if (primCanopySF == null) {
		primCanopySF = "0";
	}	

	if (tenantCanopySF == null) {
		tenantCanopySF = "0";
	}
	
	aa.print("Primary License Canopy SF is: "+primCanopySF);
	aa.print("Tenant License Canopy SF is: "+tenantCanopySF);
	
	var newTotCanopySF = 0 + parseInt(primCanopySF) + parseInt(tenantCanopySF);		
		
	// now update the ASI!
		editAppSpecific("Total Square Foot of Canopy",newTotCanopySF);	
		logDebug("Previous Total SqFt of Canopy: " +prevTotCanopySF);
		aa.print("Previous Total SqFt of Canopy: " +prevTotCanopySF);		
		logDebug("New Total Sqft of Canopy: " +newTotCanopySF);
		aa.print("New Total Sqft of Canopy: " +newTotCanopySF);
		
	logDebug("END of sumPrimaryRenewalCanopySquareFeetAndReplaceTotalSFASI");
	aa.print("END of sumPrimaryRenewalCanopySquareFeetAndReplaceTotalSFASI");
}


function sumPrimaryRenewalManufacturingSquareFeetAndReplaceTotalSFASI() {

	showDebug = true;
	showMessage = true;
	logDebug("START of sumPrimaryRenewalManufacturingSquareFeetAndReplaceTotalSFASI");
	aa.print("START of sumPrimaryRenewalManufacturingSquareFeetAndReplaceTotalSFASI");
	
	var prevTotMfgSF = getAppSpecific("Total Square Foot of Manufacturing",capId);
	var primMfgSF = getAppSpecific("Square Foot of Manufacturing",capId);
	var tenantMfgSF = cannabisGetPrimaryLicASITColumnTotal(capId,"TENANT INFORMATION", "Manufacturing SF") || 0;
		
	if (primMfgSF == null) {
		primMfgSF = "0";
	}	

	if (tenantMfgSF == null) {
		tenantMfgSF = "0";
	}
	
	aa.print("Primary License Manufacturing SF is: "+primMfgSF);
	aa.print("Tenant License Manufacturing SF is: "+tenantMfgSF);
	
	var newTotMfgSF = 0 + parseInt(primMfgSF) + parseInt(tenantMfgSF);		
		
	// now update the ASI!
		editAppSpecific("Total Square Foot of Manufacturing",newTotMfgSF);	
		logDebug("Previous Total SqFt of Manufacturing: " +prevTotMfgSF);
		aa.print("Previous Total SqFt of Manufacturing: " +prevTotMfgSF);		
		logDebug("New Total Sqft of Manufacturing: " +newTotMfgSF);
		aa.print("New Total Sqft of Manufacturing: " +newTotMfgSF);
		
	logDebug("END of sumPrimaryRenewalManufacturingSquareFeetAndReplaceTotalSFASI");
	aa.print("END of sumPrimaryRenewalManufacturingSquareFeetAndReplaceTotalSFASI");
}

// 7-11-2018: new requirement to copy the total canopy and manufacture SF to 
//				primary lic ASI fields (add with to the primary ASI)

function addCannabisTenantCanopyAndManufactureToPrimaryLicenseASI() {
	aa.print("<font color=red><b>START</b> of addCannabisTenantCanopyAndManufactureToPrimaryLicenseASI "+capId+" </font>");
	aa.print("the cap id is:"+capId);
	
	var tenantParentPrimaryCapId = getApplication(AInfo["City of Lancaster License Number"]);

	if (tenantParentPrimaryCapId != '' && tenantParentPrimaryCapId != null) { 
		aa.print("the cap exists!"); 

		var thisCanopySqFt 		= AInfo["Square Foot of Canopy"];
		var thisManufacturingSF = AInfo["Square Foot of Manufacturing"];

		var primLicCanopyTotSF = getAppSpecific("Total Square Foot of Canopy", tenantParentPrimaryCapId);
		var newPrimLicTotSFCanopy = 0 + parseInt(thisCanopySqFt) + parseInt(primLicCanopyTotSF);
		aa.print("the primary license canopy SF is:"+primLicCanopyTotSF);
		aa.print("the NEW primary license canopy SF is:"+newPrimLicTotSFCanopy);
		editAppSpecific("Total Square Foot of Canopy",newPrimLicTotSFCanopy,tenantParentPrimaryCapId);
		aa.print("just updated ASI: Total Square Foot of Canopy with new value on cap:"+tenantParentPrimaryCapId);
		
		var primLicManuTotSF = getAppSpecific("Total Square Foot of Manufacturing",tenantParentPrimaryCapId);
		var newPrimLicTotSFManu = 0 + parseInt(thisManufacturingSF) + parseInt(primLicManuTotSF);
		aa.print("the primary license manufacture SF is:"+primLicManuTotSF);
		aa.print("the NEW primary license manufacture SF is:"+newPrimLicTotSFManu);
		editAppSpecific("Total Square Foot of Manufacturing",newPrimLicTotSFManu,tenantParentPrimaryCapId);
		aa.print("just updated ASI: Total Square Foot of Manufacturing with new value on cap:"+tenantParentPrimaryCapId);
	}
	else { 
		aa.print("the cap does not exist!"); 
		showMessage = true; comment("<font color=red><b>WARNING:</b> Parent Primary License does not exist in system!</font>");
	}
	aa.print("<font color=red><b>END</b> of addCannabisTenantCanopyAndManufactureToPrimaryLicenseASI "+capId+" </font>");
}


function checkPrimaryAppTenantInfo() {
	aa.print("START OF CHECKPRIMARYAPPTENANTINFO!");

	loadASITablesBefore();
	
	if (typeof TENANTINFORMATION == "object") {
		var checkTenantTable = TENANTINFORMATION.length;
		aa.print("check tenant table is:"+checkTenantTable);
		if (checkTenantTable >= 1) {
			cancel=true;
			aa.print("canceling this event!!!!");
			comment("<font color=red><b>You may not enter tenant information on the Primary Application.  This must be done on the TENANT application.</b></font>");
		}
	}
	aa.print("END OF CHECKPRIMARYAPPTENANTINFO!");	
}


function checkArrayForDuplicates(a) {
    var counts = [];
    for(var i = 0; i <= a.length; i++) {
        if(counts[a[i]] === undefined) {
            counts[a[i]] = 1;
        } else {
            return true;
        }
    }
    return false;
}

function checkForSiteInfoDupeBuildings() {
	aa.print("START OF checkForSiteInfoDupeBuildings!");
	loadASITablesBefore();
	
	if (typeof SITEINFORMATION == "object") {
		var siteInfoTabl = SITEINFORMATION;
		var siteInfoLen = SITEINFORMATION.length;
		var dupeCheckArray = [];
		for (i in  siteInfoTabl)
		{
			var mySiteRow = siteInfoTabl[i];
			dupeCheckArray[i] = mySiteRow["Building #"];
		}
		
		// now that you have an array of building numbers, check for dupes
		
		var siteDupes = false;
		siteDupes = checkArrayForDuplicates(dupeCheckArray);
		
		if (siteDupes) {
			cancel=true;
			comment("<font color=red><b>Please do not enter duplicate Building # in the Site Information table!</b></font>");
		}
		else {
			aa.print("no duplicate building numbers found")
		}
	}
	aa.print("END OF checkForSiteInfoDupeBuildings!");	
}




function checkLicOperationGreaterTotalBusinessSF() {
	aa.print("START OF checkLicOperationGreaterTotalBusinessSF!");

aa.print("the control string is:"+controlString);

	var licOpSF = parseInt(AInfo["Local License Operation Square Footage"]);

// make sure you pass in the table name with no spaces on a before event!

	if (controlString == "ApplicationSubmitBefore") {

		var licTotSF = cannabisGetPrimaryLicASITColumnTotal(capId, "SITEINFORMATION", "Total SqFt") || 0;
	}
	else {
		var licTotSF = cannabisGetPrimaryLicASITColumnTotal(capId, "SITE INFORMATION", "Total SqFt") || 0;
	}

	aa.print("the lic op SF:"+licOpSF);
	aa.print("the lic tot SF:"+licTotSF);
	
	if ( licOpSF > licTotSF ) {
		aa.print("OP IS GREATER THAN TOTAL!");
		cancel = true;
		comment("<font color=red><b>Operational Square Feet cannot be greater than Total Square Feet of your Business!</b></font>");
	}
	else {
		aa.print("op is not greater than total")
	}
	aa.print("END OF checkLicOperationGreaterTotalBusinessSF!");	
}


// 07-30-2018 - need to assess renewal fees when renewal record is created.

function assessPrimaryCannabisLicRenewalFees() {
	aa.print("<font color=red><b>START</b> of assessPrimaryCannabisLicRenewalFees "+capId+" </font>");
	aa.print("the cap id is:"+capId);
	
	aa.print("AInfo-Square Footage (SQFT) of Your Business:"+ AInfo["Square Footage (SQFT) of Your Business"]);
	aa.print("AInfo-Total Square Foot of Canopy:"+ AInfo["Total Square Foot of Canopy"]);
	aa.print("AInfo-Manufacturing:"+ AInfo["Manufacturing"]);
	
	if ( AInfo["Square Footage (SQFT) of Your Business"] ) {
		updateFee("MCLR020","LIC_CANN_LOC_REN","FINAL",AInfo["Square Footage (SQFT) of Your Business"],"N");
	}
	
	if ( AInfo["Total Square Foot of Canopy"] ) {
		updateFee("MCLR030","LIC_CANN_LOC_REN","FINAL",AInfo["Total Square Foot of Canopy"],"N");
	}
	
	if ( AInfo["Manufacturing"] ) {
		updateFee("MCLR040","LIC_CANN_LOC_REN","FINAL",1,"Y");
	} 
	
	aa.print("<font color=red><b>END</b> of assessPrimaryCannabisLicRenewalFees "+capId+" </font>");
	
}

function cannabisSetUpRenewalStatusForRenewed(capid) {
		var reviewResult = aa.cap.getProjectByChildCapID(capid, "Renewal", "Incomplete");
			if(reviewResult.getSuccess()) {
				var projectScriptModels = reviewResult.getOutput();
				var projectScriptModel = projectScriptModels[0];
				projectScriptModel.setStatus("Complete");
				aa.cap.updateProject(projectScriptModel);
				logDebug("just updated ("+capid+") renewal status to Complete... here is object:");
				printObjProperties(projectScriptModel);
			}  
			else 
			{
			  logDebug("ERROR: Failed to get renewal CAP by parent CAP(" + capId + ") for review: " + reviewResult.getErrorMessage());
			}
}
