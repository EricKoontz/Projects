/// <reference path="../Scripts/Master/INCLUDES_CUSTOM_GLOBALS.js" />
/// <reference path="../Scripts/Master/INCLUDES_ACCELA_FUNCTIONS.js" />

/*------------------------------------------------------------------------------------------------------/
| Byrne Software (2016)
|
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.
|
| Client  : Fresno
|
/------------------------------------------------------------------------------------------------------*/


//----------------------------------------------
// BPTs Initiallly Loaded
//-----------------------------------------------

function createRefLicProf(rlpId, rlpType, pContactType) {
    //Creates/updates a reference licensed prof from a Contact
    var updating = false;
    var capContResult = aa.people.getCapContactByCapID(capId);
    if (capContResult.getSuccess())
    { conArr = capContResult.getOutput(); }
    else
    {
        logDebug("**ERROR: getting cap contact: " + capContResult.getErrorMessage());
        return false;
    }

    if (!conArr.length) {
        logDebug("**WARNING: No contact available");
        return false;
    }


    var newLic = getRefLicenseProf(rlpId)

    if (newLic) {
        updating = true;
        logDebug("Updating existing Ref Lic Prof : " + rlpId);
    }
    else
        var newLic = aa.licenseScript.createLicenseScriptModel();

    //get contact record
    if (pContactType == null)
        var cont = conArr[0]; //if no contact type specified, use first contact
    else {
        var contFound = false;
        for (yy in conArr) {
            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType())) {
                cont = conArr[yy];
                contFound = true;
                break;
            }
        }
        if (!contFound) {
            logDebug("**WARNING: No Contact found of type: " + pContactType);
            return false;
        }
    }

    peop = cont.getPeople();
    //addr = peop.getCompactAddress();
    addr = getCapContactAddressByType(cont, "Mailing");

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

    if (AInfo["General Liability Policy Provider Name"]) newLic.setInsuranceCo(AInfo["General Liability Policy Provider Name"]);
    if (AInfo["General Liability Expiration Date"]) newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["General Liability Expiration Date"]));
    if (AInfo["General Liability Policy Number"]) newLic.setPolicy(AInfo["General Liability Policy Number"]);

    newLic.setLicenseType(rlpType);

    newLic.setLicState("CA");

    newLic.setStateLicense(rlpId);

    if (updating)
        myResult = aa.licenseScript.editRefLicenseProf(newLic);
    else
        myResult = aa.licenseScript.createRefLicenseProf(newLic);

    if (myResult.getSuccess()) {
        logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
        logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
        return true;
    }
    else {
        logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        return false;
    }
}

function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists) {

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

    var defaultContactFlag = lookup(standardChoiceForBusinessRules, "Default");

    var c = aa.people.getCapContactByCapID(pCapId).getOutput()
    var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets

    for (var i in c) {
        var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
        var con = c[i];

        var p = con.getPeople();

        var contactFlagForType = lookup(standardChoiceForBusinessRules, p.getContactType());

        if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
        {
            if (contactTypeArray && !exists(p.getContactType(), contactTypeArray))
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

        switch (ruleForRefContactType) {
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
            if (overwriteRefContact) {
                p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
                p.setContactType(refContactType);

                var a = p.getAttributes();

                if (a) {
                    var ai = a.iterator();
                    while (ai.hasNext()) {
                        var xx = ai.next();
                        xx.setContactNo(refContactNum);
                    }
                }

                var r = aa.people.editPeopleWithAttribute(p, p.getAttributes());

                if (!r.getSuccess())
                    logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
                else
                    logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
            }

            if (replaceCapContact) {
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

                if (a) {
                    //
                    // Clear unwanted attributes
                    var ai = a.iterator();
                    while (ai.hasNext()) {
                        var xx = ai.next();
                        if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(), ignoreAttributeArray))
                            ai.remove();
                    }
                }

                p.setContactType(refContactType);
                var r = aa.people.createPeopleWithAttribute(p, a);

                if (!r.getSuccess())
                { logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }

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

                    if (refPeopleId) {
                        logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
                        aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
                    }
                }
            }

            //
            // now that we have the reference Id, we can link back to reference
            //

            var ccm = aa.people.getCapContactByPK(pCapId, ccmSeq).getOutput().getCapContactModel();

            ccm.setRefContactNumber(refPeopleId);
            r = aa.people.editCapContact(ccm);

            if (!r.getSuccess())
            { logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
            else
            { logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq); }


        }  // end if user hand entered contact
    }  // end for each CAP contact
} // end function

function reversePayment() { logDebug("hello") }

function addToASITable(tableName, tableValues) // optional capId
{
    //  tableName is the name of the ASI table
    //  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
    itemCap = capId
    if (arguments.length > 2)
        itemCap = arguments[2]; // use cap ID specified in args

    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

    if (!tssmResult.getSuccess())
    { logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()); return false }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var col = tsm.getColumns();
    var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
    var coli = col.iterator();

    while (coli.hasNext()) {
        colname = coli.next();

        if (!tableValues[colname.getColumnName()]) {
            logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
            tableValues[colname.getColumnName()] = "";
        }

        if (typeof (tableValues[colname.getColumnName()].fieldValue) != "undefined") {
            fld.add(tableValues[colname.getColumnName()].fieldValue);
            fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
        }
        else // we are passed a string
        {
            fld.add(tableValues[colname.getColumnName()]);
            fld_readonly.add(null);
        }
    }

    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly); // set readonly field

    addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
    if (!addResult.getSuccess())
    { logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()); return false }
    else
        logDebug("Successfully added record to ASI Table: " + tableName);
}

function addASITable(tableName, tableValueArray) // optional capId
{
    //  tableName is the name of the ASI table
    //  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
    var itemCap = capId
    if (arguments.length > 2)
        itemCap = arguments[2]; // use cap ID specified in args

    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

    if (!tssmResult.getSuccess()) {
        logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false
    }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); // get Readonly field

    for (thisrow in tableValueArray) {

        var col = tsm.getColumns()
        var coli = col.iterator();
        while (coli.hasNext()) {
            var colname = coli.next();

            if (!tableValueArray[thisrow][colname.getColumnName()]) {
                logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
                tableValueArray[thisrow][colname.getColumnName()] = "";
            }

            if (typeof (tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
            {
                fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
                fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
                //fld_readonly.add(null);
            } else // we are passed a string
            {
                fld.add(tableValueArray[thisrow][colname.getColumnName()]);
                fld_readonly.add(null);
            }
        }

        tsm.setTableField(fld);

        tsm.setReadonlyField(fld_readonly);

    }

    var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

    if (!addResult.getSuccess()) {
        logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
        return false
    } else
        logDebug("Successfully added record to ASI Table: " + tableName);

}

function getLatestScheduledDate() {
    var inspResultObj = aa.inspection.getInspections(capId);
    if (inspResultObj.getSuccess()) {
        inspList = inspResultObj.getOutput();
        var array = new Array();
        var j = 0;
        for (i in inspList) {
            if (inspList[i].getInspectionStatus().equals("Scheduled")) {
                array[j++] = aa.util.parseDate(inspList[i].getInspection().getScheduledDate());
            }
        }

        var latestScheduledDate = array[0];
        for (k = 0; k < array.length; k++) {
            temp = array[k];
            logDebug("----------array.k---------->" + array[k]);
            if (temp.after(latestScheduledDate)) {
                latestScheduledDate = temp;
            }
        }
        return latestScheduledDate;
    }
    return false;
}

function cntAssocGarageSales(strnum, strname, city, state, zip, cfname, clname) {

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
    for (x in capList) {
        resultCap = capList[x];
        resultCapId = resultCap.getCapID();
        altId = resultCapId.getCustomID();
        //aa.print("Record ID: " + altId);
        resultCapIdScript = aa.cap.createCapIDScriptModel(resultCapId.getID1(), resultCapId.getID2(), resultCapId.getID3());
        contact = aa.cap.getCapPrimaryContact(resultCapIdScript).getOutput();

        contactFname = contact.getFirstName();
        contactLname = contact.getLastName();

        if (contactFname == cfname && contactLname == clname) {
            recordCnt++;
            message = message + recordCnt + ": " + altId + " - " + contactFname + " " + contactLname + " @ " + strnum + " " + strname + "<br>";
        }
    }

    return recordCnt;

}

function copyContactsWithAddress(pFromCapId, pToCapId) {
    // Copies all contacts from pFromCapId to pToCapId and includes Contact Address objects
    //
    if (pToCapId == null)
        var vToCapId = capId;
    else
        var vToCapId = pToCapId;

    var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
    var copied = 0;
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var newContact = Contacts[yy].getCapContactModel();

            var newPeople = newContact.getPeople();
            // aa.print("Seq " + newPeople.getContactSeqNumber());

            var addressList = aa.address.getContactAddressListByCapContact(newContact).getOutput();
            newContact.setCapID(vToCapId);
            aa.people.createCapContact(newContact);
            newerPeople = newContact.getPeople();
            // contact address copying
            if (addressList) {
                for (add in addressList) {
                    var transactionAddress = false;
                    contactAddressModel = addressList[add].getContactAddressModel();

                    logDebug("contactAddressModel.getEntityType():" + contactAddressModel.getEntityType());

                    if (contactAddressModel.getEntityType() == "CAP_CONTACT") {
                        transactionAddress = true;
                        contactAddressModel.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
                    }
                    // Commit if transaction contact address
                    if (transactionAddress) {
                        var newPK = new com.accela.orm.model.address.ContactAddressPKModel();
                        contactAddressModel.setContactAddressPK(newPK);
                        aa.address.createCapContactAddress(vToCapId, contactAddressModel);
                    }
                        // Commit if reference contact address
                    else {
                        // build model
                        var Xref = aa.address.createXRefContactAddressModel().getOutput();
                        Xref.setContactAddressModel(contactAddressModel);
                        Xref.setAddressID(addressList[add].getAddressID());
                        Xref.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
                        Xref.setEntityType(contactAddressModel.getEntityType());
                        Xref.setCapID(vToCapId);
                        // commit address
                        commitAddress = aa.address.createXRefContactAddress(Xref.getXRefContactAddressModel());
                        if (commitAddress.getSuccess()) {
                            commitAddress.getOutput();
                            logDebug("Copied contact address");
                        }
                    }
                }
            }
            // end if
            copied++;
            logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
        }
    }
    else {
        logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
        return false;
    }
    return copied;
}

function changeCapContactTypes(origType, newType) {
    // Renames all contacts of type origType to contact type of newType and includes Contact Address objects
    //
    var vCapId = capId;
    if (arguments.length == 3)
        vCapId = arguments[2];

    var capContactResult = aa.people.getCapContactByCapID(vCapId);
    var renamed = 0;
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var contact = Contacts[yy].getCapContactModel();

            var people = contact.getPeople();
            var contactType = people.getContactType();
            aa.print("Contact Type " + contactType);

            if (contactType == origType) {

                var contactNbr = people.getContactSeqNumber();
                var editContact = aa.people.getCapContactByPK(vCapId, contactNbr).getOutput();
                editContact.getCapContactModel().setContactType(newType)

                aa.print("Set to: " + people.getContactType());
                renamed++;

                var updContactResult = aa.people.editCapContact(editContact.getCapContactModel());
                logDebug("contact " + updContactResult);
                logDebug("contact.getSuccess() " + updContactResult.getSuccess());
                logDebug("contact.getOutput() " + updContactResult.getOutput());
                updContactResult.getOutput();
                logDebug("Renamed contact from " + origType + " to " + newType);
            }
        }
    }
    else {
        logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
        return false;
    }
    return renamed;
}

function checkWorkflowTaskAndStatus(capId, workflowTask, taskStatus) {
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else {
        aa.print("**ERROR: Failed to get workflow object: " + wfObj);
        return false;
    }

    for (i in wfObj) {
        fTask = wfObj[i];
        var status = fTask.getDisposition();
        var taskDesc = fTask.getTaskDescription();

        if (status != null && taskDesc != null && taskDesc.equals(workflowTask) && status.equals(taskStatus))
            return true;
    }

    return false;
}

function associatedRefContactWithRefLicProf(capIdStr, refLicProfSeq, servProvCode, auditID) {
    var contact = getLicenseHolderByLicenseNumber(capIdStr);
    if (contact && contact.getRefContactNumber()) {
        linkRefContactWithRefLicProf(parseInt(contact.getRefContactNumber()), refLicProfSeq, servProvCode, auditID)
    }
    else {
        logMessage("**ERROR:cannot find license holder of license");
    }
}

function linkRefContactWithRefLicProf(refContactSeq, refLicProfSeq, servProvCode, auditID) {

    if (refContactSeq && refLicProfSeq && servProvCode && auditID) {
        var xRefContactEntity = aa.people.getXRefContactEntityModel().getOutput();
        xRefContactEntity.setServiceProviderCode(servProvCode);
        xRefContactEntity.setContactSeqNumber(refContactSeq);
        xRefContactEntity.setEntityType("PROFESSIONAL");
        xRefContactEntity.setEntityID1(refLicProfSeq);
        var auditModel = xRefContactEntity.getAuditModel();
        auditModel.setAuditDate(new Date());
        auditModel.setAuditID(auditID);
        auditModel.setAuditStatus("A")
        xRefContactEntity.setAuditModel(auditModel);
        var xRefContactEntityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
        var existedModel = xRefContactEntityBusiness.getXRefContactEntityByUIX(xRefContactEntity);
        if (existedModel.getContactSeqNumber()) {
            //aa.print("The professional license have already linked to contact.");
            logMessage("License professional link to reference contact successfully.");
        }
        else {
            var XRefContactEntityCreatedResult = xRefContactEntityBusiness.createXRefContactEntity(xRefContactEntity);
            if (XRefContactEntityCreatedResult) {
                //aa.print("License professional link to reference contact successfully.");
                logMessage("License professional link to reference contact successfully.");
            }
            else {
                //aa.print("**ERROR:License professional failed to link to reference contact.  Reason: " +  XRefContactEntityCreatedResult.getErrorMessage());
                logMessage("**ERROR:License professional failed to link to reference contact.  Reason: " + XRefContactEntityCreatedResult.getErrorMessage());
            }
        }
    }
    else {
        //aa.print("**ERROR:Some Parameters are empty");
        logMessage("**ERROR:Some Parameters are empty");
    }

}

function getConatctAddreeByID(contactID, vAddressType) {
    var conArr = new Array();
    var capContResult = aa.people.getCapContactByContactID(contactID);

    if (capContResult.getSuccess()) {
        conArr = capContResult.getOutput();
        for (contact in conArr) {
            cont = conArr[contact];

            return getContactAddressByContact(cont.getCapContactModel(), vAddressType);
        }
    }
}

function getContactAddressByContact(contactModel, vAddressType) {
    var xrefContactAddressBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.XRefContactAddressBusiness").getOutput();
    var contactAddressArray = xrefContactAddressBusiness.getContactAddressListByCapContact(contactModel);
    for (i = 0; i < contactAddressArray.size() ; i++) {
        var contactAddress = contactAddressArray.get(i);
        if (vAddressType.equals(contactAddress.getAddressType())) {
            return contactAddress;
        }
    }
}

function copyContactAddressToLicProf(contactAddress, licProf) {
    if (contactAddress && licProf) {
        licProf.setAddress1(contactAddress.getAddressLine1());
        licProf.setAddress2(contactAddress.getAddressLine2());
        licProf.setAddress3(contactAddress.getAddressLine3());
        licProf.setCity(contactAddress.getCity());
        licProf.setState(contactAddress.getState());
        licProf.setZip(contactAddress.getZip());
        licProf.getLicenseModel().setCountryCode(contactAddress.getCountryCode());
    }
}

function associatedLicensedProfessionalWithPublicUser(licnumber, publicUserID) {
    var mylicense = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(), licnumber);
    var puser = aa.publicUser.getPublicUserByPUser(publicUserID);
    if (puser.getSuccess())
        aa.licenseScript.associateLpWithPublicUser(puser.getOutput(), mylicense.getOutput());
}

function associatedRefContactWithRefLicProf(capIdStr, refLicProfSeq, servProvCode, auditID) {
    var contact = getLicenseHolderByLicenseNumber(capIdStr);
    if (contact && contact.getRefContactNumber()) {
        linkRefContactWithRefLicProf(parseInt(contact.getRefContactNumber()), refLicProfSeq, servProvCode, auditID)
    }
    else {
        logMessage("**ERROR:cannot find license holder of license");
    }
}

function taskCloseAllAdjustBranchtaskExcept(e, t) {
    var n = new Array;
    var r = false;
    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++)
            n.push(arguments[i])
    } else
        r = true;
    var s = aa.workflow.getTasks(capId);
    if (s.getSuccess())
        var o = s.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + s.getErrorMessage());
        return false
    }
    var u;
    var a;
    var f;
    var l = aa.date.getCurrentDate();
    var c = " ";
    var h;
    for (i in o) {
        u = o[i];
        h = u.getTaskDescription();
        a = u.getStepNumber();
        if (r) {
            aa.workflow.handleDisposition(capId, a, e, l, c, t, systemUserObj, "B");
            logMessage("Closing Workflow Task " + h + " with status " + e);
            logDebug("Closing Workflow Task " + h + " with status " + e)
        } else {
            if (!exists(h, n)) {
                aa.workflow.handleDisposition(capId, a, e, l, c, t, systemUserObj, "B");
                logMessage("Closing Workflow Task " + h + " with status " + e);
                logDebug("Closing Workflow Task " + h + " with status " + e)
            }
        }
    }
}

function getLicenseHolderByLicenseNumber(capIdStr) {
    var capContactResult = aa.people.getCapContactByCapID(capIdStr);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var contact = Contacts[yy].getCapContactModel();
            var contactType = contact.getContactType();
            if ((contactType.toUpperCase().equals("LICENSE HOLDER") || contactType.toUpperCase().equals("LICENSE APPLICANT")) && contact.getRefContactNumber()) {
                return contact;
            }
        }
    }
}

function taskCloseAllExcept(pStatus, pComment) {
    // Closes all tasks in CAP with specified status and comment
    // Optional task names to exclude
    // 06SSP-00152
    //
    var taskArray = new Array();
    var closeAll = false;
    if (arguments.length > 2) //Check for task names to exclude
    {
        for (var i = 2; i < arguments.length; i++)
            taskArray.push(arguments[i]);
    }
    else
        closeAll = true;

    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }

    var fTask;
    var stepnumber;
    var processID;
    var dispositionDate = aa.date.getCurrentDate();
    var wfnote = " ";
    var wftask;

    for (i in wfObj) {
        fTask = wfObj[i];
        wftask = fTask.getTaskDescription();
        stepnumber = fTask.getStepNumber();
        //processID = fTask.getProcessID();
        if (closeAll) {
            aa.workflow.handleDisposition(capId, stepnumber, pStatus, dispositionDate, wfnote, pComment, systemUserObj, "Y");
            logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
            logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
        }
        else {
            if (!exists(wftask, taskArray)) {
                aa.workflow.handleDisposition(capId, stepnumber, pStatus, dispositionDate, wfnote, pComment, systemUserObj, "Y");
                logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
                logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
            }
        }
    }
}

//get contact by contact type for given capId
function getContactByTypeAA(conType, capId) {
    var contactArray = getPeople(capId);
    for (thisContact in contactArray) {
        if ((contactArray[thisContact].getCapContactModel().getContactType()).toUpperCase() == conType.toUpperCase())
            return contactArray[thisContact].getCapContactModel();
    }
    return false;
}

function dateAddMonths(pDate, pMonths) {
    // Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
    // If pDate is null, uses current date
    // pMonths can be positive (to add) or negative (to subtract) integer
    // If pDate is on the last day of the month, the new date will also be end of month.
    // If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, in which case the new date will be on the last day of the month
    //
    if (!pDate)
        baseDate = new Date();
    else
        baseDate = new Date(pDate);

    var day = baseDate.getDate();
    baseDate.setMonth(baseDate.getMonth() + pMonths);
    if (baseDate.getDate() < day) {
        baseDate.setDate(1);
        baseDate.setDate(baseDate.getDate() - 1);
    }
    return ((baseDate.getMonth() + 1) + "/" + baseDate.getDate() + "/" + baseDate.getFullYear());
}

// check for document in ASB event
function docCheck4ASB(docName) {
    try {
        var docAttached = false;

        if (!publicUser) // only works in AA, not ACA
        {
            var documentList = aa.env.getValue("DocumentModelList");
            if (!documentList) {
                return false;
            } else {
                for (var counter = 0; counter < documentList.size() ; counter++) {
                    var doc = documentList.get(counter);
                    if (doc.getDocCategory() == docName) {
                        docAttached = true;
                        break;
                    }
                }
            }
        } else {
            docAttached = true;
        }
        return docAttached;
    } catch (error) {
        cancel = true;
        showMessage = true;
        comment(error.message);
        comment("An error occurred while retrieving the document array");
    }
}


function capIdsGetByAddr4ServiceRequest() {
    //Gets CAPs with the same address as the current CAP, as capId (CapIDModel) object array (array includes current capId)
    //07SSP-00034/SP5015
    //

    //Get address(es) on current CAP
    var addrResult = aa.address.getAddressByCapId(capId);
    if (!addrResult.getSuccess()) {
        logDebug("**ERROR: getting CAP addresses: " + addrResult.getErrorMessage());
        return false;
    }

    var addrArray = new Array();
    var addrArray = addrResult.getOutput();
    if (addrArray.length == 0 || addrArray == undefined) {
        logDebug("The current CAP has no address.  Unable to get CAPs with the same address.")
        return false;
    }

    //use 1st address for comparison
    var streetName = addrArray[0].getStreetName();
    var hseNum = addrArray[0].getHouseNumberStart();
    var streetSuffix = addrArray[0].getStreetSuffix();
    var zip = addrArray[0].getZip();
    var streetDir = addrArray[0].getStreetDirection();

    if (streetDir == "")
        streetDir = null;
    if (streetSuffix == "")
        streetSuffix = null;
    if (zip == "")
        zip = null;

    if (hseNum && !isNaN(hseNum)) {
        hseNum = parseInt(hseNum);
    } else {
        hseNum = null;
    }

    var capArray = new Array();
    // get caps with same address
    if (streetName != null || hseNum != null || streetSuffix != null || zip != null || streetDir != null) {
        var capAddResult = aa.cap.getCapListByDetailAddress(streetName, hseNum, streetSuffix, zip, streetDir, null);
        if (capAddResult.getSuccess())
            capArray = capAddResult.getOutput();
        else {
            logDebug("**ERROR: getting similar addresses: " + capAddResult.getErrorMessage());
            return false;
        }
    }

    var capIdArray = new Array();
    //convert CapIDScriptModel objects to CapIDModel objects
    for (i in capArray)
        capIdArray.push(capArray[i].getCapID());

    if (capIdArray)
        return (capIdArray);
    else
        return false;
}



//----------------------------------------------
// BPTs Initiallly Loaded (END)
//----------------------------------------------

//----------------------------------------------
// Miscelleanous functions
//----------------------------------------------
function activeTasksCheckByCapId(itemCap) {

    var workflowResult = aa.workflow.getTasks(itemCap);
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else {
        logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }

    for (i in wfObj) {
        fTask = wfObj[i];
        if (fTask.getActiveFlag().equals("Y"))
            return true;
    }

    return false;
}

//Use this function for fire scripts when issuing permit automatically 
//in a differnt event than WTUA
//e.g. script 160: function fireScrt160_updatePermitIssuance()
function addPlanPickUpReqdCondition(){
    try{
        var $utils = bs.utils;
        var $iTrc = bs.utils.debug.ifTracer;
        var planCheckApproved = $utils.accela.workflow.getStatusHistoryCount(capId, "Plan Check", "Approved"),
            conditionGroup = "Fire",
            conditionType = "Plan Pickup Required",
            conditionName = "Permit Issued, Pending Plan Pickup",
            conditionComment = "Plans to be picked up prior to proceeding with permit activity",
            //dispConditionComment = "Plans to be picked up prior to proceeding with permit activity",
            //resConditionComment = "Plans to be picked up prior to proceeding with permit activity",
            impactCode = "Hold",
            condStatus = "Applied",
            auditStatus = "A",
            displayNotice = "Y";
                    
        if($iTrc(planCheckApproved > 0, 'planCheckApproved > 0')){
            var adminUserID = "ADMIN";
            var adminUserObj = aa.person.getUser(adminUserID).getOutput();
            
            //Create new empty cap condition model and set the expected values.
            var newCondModel = aa.capCondition.getNewConditionScriptModel().getOutput();
            newCondModel.setCapID(capId);
            newCondModel.setConditionGroup(conditionGroup);
            newCondModel.setConditionType(conditionType);
            newCondModel.setConditionDescription(conditionName);
            newCondModel.setConditionComment(conditionComment);
            newCondModel.setConditionStatus(condStatus);
            newCondModel.setEffectDate(sysDate);
            newCondModel.setIssuedDate(sysDate);
            newCondModel.setIssuedByUser(adminUserObj);
            newCondModel.setStatusByUser(adminUserObj);
            newCondModel.setAuditID(adminUserID);
            newCondModel.setAuditStatus(auditStatus);
            newCondModel.setDisplayConditionNotice(displayNotice);
            newCondModel.setImpactCode(impactCode);
            
            aa.capCondition.createCapCondition(newCondModel);
        }
    }
    catch(err)
    {
        showMessage = true;
        comment("Error on custom function addPlanPickUpReqdCondition(). Please contact system administrator. Err: " + err);
    }
}


//----------------------------------------------
// Miscelleanous functions (END)
//----------------------------------------------
function getAssignedCapUser(){
    var itemCap = capId
    if (arguments.length > 0) itemCap = arguments[0]; // use cap ID specified in args

    var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
    if (!cdScriptObjResult.getSuccess())
        { logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

    var cdScriptObj = cdScriptObjResult.getOutput();

    if (!cdScriptObj)
        { logDebug("**ERROR: No cap detail script object") ; return false; }

    cd = cdScriptObj.getCapDetailModel();

    return cd.getAsgnStaff();

}//END getAssignedCapUser()

/* function to check if a document was uploaded. */
function uploadedDocument(docCategory) {
    try {
        var DocumentModelArray = aa.env.getValue("DocumentModelList");
        if (DocumentModelArray) {
            //aa.print(DocumentModelArray.size());
            //var docCategory = "Requested Revisions";
            var documentUploaded = false;
            for (var i = 0; i < DocumentModelArray.size() ; i++) {
                if (DocumentModelArray.get(i).getDocCategory() == docCategory) {
                    documentUploaded = true;
                    break;
                }
            }

            return documentUploaded
        }
    }
    catch (err) {
        showMessage = true;
        comment("ERROR on custom function uploadedDocument(). Please contact administrator. Err: " + err);
    }
}//END uploadedDocument();

//----------------------------------------------
//  global vars
//----------------------------------------------
var scriptRoot = this;

//----------------------------------------------
// bs global namespace
//----------------------------------------------
var bs = bs || {};
(function () {
    var root = this;
    root.version = '1.0.0.0';

    var constants = root.constants = {
        debug: matches(currentUserID, "BYRNESCRIPTS", "BYRNE", "JALEDEZMA") ? true : false,
        reportsAvail: true,
        emailEmailRedirectTo:   lookup("COF EMAIL REDIRECT TO", "emailRedirectTo") == "null" ? "" : lookup("COF EMAIL REDIRECT TO", "emailRedirectTo"),  //for testing - empty string = no redirect
        defaultEmailSender: "do_not_reply@fresno.gov", //noreply@byrnesoftware.com",
        scriptReturnCode: { proceed: '0', stopPrevPage: '1', stopmainMenu: '2', stopPageDesig: '3', stopLogout: '4' },
        emailErrorTo: 'jal@byrnesoftware.com',  //cvm@byrnesoftware.com
        notificationTemplatePlanning: 'GENERIC_PLANNING_CORRESPONDENCE'
    };

    var emse = root.emse = {};
    (function () {
        var root = this;

        //Script 176
        //ApplicationSpecificInfoUpdateAfter (ASIUA)
        var enfScrt176_createCodeCompRec = root.enfScrt176_createCodeCompRec = function (){
            logDebug("enfScrt176_createCodeCompRec() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    reqCodeComp = AInfo["Requires Code Compliance"],
                    codCompRecTypeString = "Enforcement/Code Compliance/NA/NA",
                    desc4NewRecord = "Code Compliance for Case " + capId.getCustomID(),
                    codCompRecExists = false,
                    children = new Array();

                showDebug = bs.constants.debug;

                //If field is checked
                if($iTrc(reqCodeComp == "CHECKED", '"Requires Code Compliance" is CHECKED')){
                    //get children to verify that the record was not created previously.
                    children = getChildren(codCompRecTypeString, capId);

                    //check if current Code compliance children have the same description for the new record.
                    for(i in children){
                        var existingChildcapId = children[i];

                        //if child with same desc exists, then set codCompRecExists to true and break out of the loop
                        if(workDescGet(existingChildcapId).equals(desc4NewRecord)){
                            logDebug("Code Compliance record " + existingChildcapId.getCustomID() + " already exists. Not creating a new one." );
                            codCompRecExists = true;
                            break;
                        }
                    }

                    //If record has not been created, then create it
                    if(!codCompRecExists){
                        var newChildCapId = createChild("Enforcement", "Code Compliance", "NA", "NA", desc4NewRecord);
                        var newChildAltId = newChildCapId.getCustomID();

                        //update the Description of the new record
                        updateWorkDesc(desc4NewRecord, newChildCapId);

                        //Copy owner.  Address and Parcel get copied with createChild above
                        copyOwner(capId, newChildCapId);

                        logDebug("New Code Compliance record has been created with AltID: " + newChildAltId + ", capId: " + newChildCapId);
                    }
                    else
                        logDebug("A Code complaince record with description " + desc4NewRecord + " already exists.");
                }
            }
            catch(err){
                showMessage = true;
                comment("Error on custom function enfScrt176_createCodeCompRec(). Please contact system admistrator. Err: " + err);
                aa.print("Error on custom function enfScrt176_createCodeCompRec(). Please contact system admistrator. Err: " + err);
            }
            logDebug("enfScrt176_createCodeCompRec() ended.");
        };//END enfScrt176_createCodeCompRec()

        //Script 177
        //WorkflowTaskUpdateAfter (WTUA)
        //When hours are entered on the Status update of any workflow step, tally the total hours on Administrative Time
        var enfScrt177_updateAdminTime = root.enfScrt177_updateAdminTime = function(){
            logDebug("enfScrt177_updateAdminTime() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    totalWfHours = 0,
                    customField2Update = 'Administrative Time',
                    countHours = wfHours == 0.0 ? false : true; //if wfHours is not zero, then we need to udpate the total hours, set countHours to true

                showDebug = bs.constants.debug;

                //If countHours = true
                if($iTrc(countHours, 'countHours')){
                    logDebug("Counting total workflow hours");

                    //Get all tasks, including history
                    var wfTaskResult = aa.workflow.getWorkflowHistory(capId, null);
                    var taskArray = "";
                    if ($iTrc(wfTaskResult.getSuccess(), 'getTasks()')) {
                       taskArray = wfTaskResult.getOutput();
                    } else {//if error getting tasks then return
                       aa.print("**ERROR: Failed to get workflow object: " + wfTaskResult.getErrorMessage());
                       return false;
                    }

                    for (var i in taskArray) {
                        //For each task add the hours spent to countHours
                        var currTask = taskArray[i];

                        totalWfHours += parseFloat(currTask.hoursSpent);
                    }

                    //update Administrative Time field with total hours.
                    editAppSpecific(customField2Update, totalWfHours);
                }
            }
            catch(err){
                showMessage = true;
                logDebug("Error on custom function enfScrt177_updateAdminTime(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt177_updateAdminTime() ended.")
        };//END enfScrt177_updateAdminTime()

        //Script 178
        //WorkflowTaskUpdateAfter (WTUA)
        //Add fee to enforcement parent record of work order based on administrative hours
        var enfScrt178_addFee2Parent = root.enfScrt178_addFee2Parent = function(){
            logDebug("enfScrt178_addFee2Parent() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    adminFeeQty = AInfo["Administration Time"],
                    abatementType = AInfo["Abatement Type"],
                    amount = AInfo["Amount"],
                    altId = capId.getCustomID(),
                    parentCapId = getParent(capId),
                    parentAltId = "",
                    adminFeeItem = "",
                    abateFeeItem = "",
                    feeSchedule = "ENF_GENERAL",
                    adminFeeSeq = 0,
                    abateFeeSeq = 0,
                    feeSeqArray = new Array(),
                    totalAdminTime = 0,
                    totalContrTime = 0
                    ;

                showDebug = bs.constants.debug;

                if($iTrc(wfStatus == "Invoiced", 'wfStatus == "Invoiced"') && parentCapId){
                    parentAltId = parentCapId.getCustomID();
                    adminFeeItem = "ENF_GEN_01";

                    if($iTrc(abatementType == "Weed Abatement - Summary", 'abatementType == "Weed Abatement - Summary"')) abateFeeItem = "ENF_GEN_20";
                    if($iTrc(abatementType == "Administrative Abatement", 'abatementType == "Administrative Abatement"')) abateFeeItem = "ENF_GEN_21";
                    if($iTrc(abatementType == "Summary Abatement", 'abatementType == "Summary Abatement"')) abateFeeItem = "ENF_GEN_22";

                    //If feeQuanty is valid and the amount is a number we add the fees.
                    if($iTrc(adminFeeQty && !isNaN(adminFeeQty), '!isNaN(adminFeeQty)')){
                        totalAdminTime = adminFeeQty;
                        //In here we need to set capId to parent cap id temporarily in order to add the fees.
                        var tmpCapId = capId;
                        capId = parentCapId;

                        adminFeeSeq = addFee(adminFeeItem, feeSchedule, 'FINAL', parseFloat(adminFeeQty), 'N');

                        if($iTrc(amount && !isNaN(amount), '!isNaN(amount)')){
                            totalContrTime = amount;
                            abateFeeSeq = addFee(abateFeeItem, feeSchedule, 'FINAL', parseFloat(amount), 'N');
                        }

                        //We change capId to current capId
                        capId = tmpCapId;

                        //Get Fee items to get the seq to add the notes.
                        getFeeResult = aa.finance.getFeeItemsByFeeCodeAndPeriod(parentCapId, adminFeeItem, "FINAL", "NEW");

                        if (getFeeResult.getSuccess()) {
                            var feeList = getFeeResult.getOutput();
                            for (feeNum in feeList)
                                if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
                                    var feeSeq = feeList[feeNum].getFeeSeqNbr();
                                    feeSeqArray.push(feeSeq);
                                    logDebug("Assessed fee " + adminFeeItem + " found");
                                }
                        } else {
                            logDebug("**ERROR: getting fee items (" + adminFeeItem + "): " + getFeeResult.getErrorMessage())
                        }

                        //Get the abatement fee that was added to add the notes.
                        getFeeResult = aa.finance.getFeeItemsByFeeCodeAndPeriod(parentCapId, abateFeeItem, "FINAL", "NEW");

                        if (getFeeResult.getSuccess()) {
                            var feeList = getFeeResult.getOutput();
                            for (feeNum in feeList)
                                if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
                                    var feeSeq = feeList[feeNum].getFeeSeqNbr();
                                    feeSeqArray.push(feeSeq);
                                    logDebug("Assessed fee " + abateFeeItem + " found");
                                }
                        } else {
                            logDebug("**ERROR: getting fee items (" + abateFeeItem + "): " + getFeeResult.getErrorMessage())
                        }

                        //For each fee found above add the note.
                        for(eachFee in feeSeqArray){
                            currSeq = feeSeqArray[eachFee];

                            var newFeeAbate = aa.finance.getFeeItemByPK(parentCapId, currSeq).getOutput();
                            var f4ItemAbate = newFeeAbate.getF4FeeItem();
                            f4ItemAbate.setFeeNotes(altId);//Add note here.
                            aa.finance.editFeeItem(f4ItemAbate);
                        }
                    }

                    //update Administrative Time Work Order AND Contractor Work Order Value on the parent record.
                    var currParAdminTime = getAppSpecific("Administrative Time Work Order", parentCapId);
                    var currParContrTime = getAppSpecific("Contractor Work Order Value", parentCapId);

                    if(currParAdminTime && !isNaN(currParAdminTime)) totalAdminTime = parseFloat(totalAdminTime) + parseFloat(currParAdminTime);
                    if(currParContrTime && !isNaN(currParContrTime)) totalContrTime = parseFloat(totalContrTime) + parseFloat(currParContrTime);

                    editAppSpecific("Administrative Time Work Order", totalAdminTime, parentCapId);
                    editAppSpecific("Contractor Work Order Value", totalContrTime, parentCapId);
                }
            }
            catch(err){
                showMessage = true;
                comment("Error on custom function enfScrt178_addFee2Parent(). Please contact administrator. Err: " + err);
                aa.print("Error on custom function enfScrt178_addFee2Parent(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt178_addFee2Parent() ended.");
        };//END enfScrt178_addFee2Parent();

        //Script 188
        //ApplicationSpecificInfoUpdateAfter (ASIUA)
        //Update the Amount field on the Data Fields tab when the information is saved
        var enfScrt188_woUpdateAmount = root.enfScrt188_woUpdateAmount = function (){
            logDebug("enfScrt188_woUpdateAmount() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    altId = capId.getCustomID(),
                    customListName = 'WORK ORDER'
                    totalAmount = 0.0;

                showDebug = bs.constants.debug;

                //Load Custom List into an array
                var workOrderArray = loadASITable(customListName);
                //If not undefined and lenght > 0, then we have values
                if($iTrc(workOrderArray != "undefined" && workOrderArray.length > 0, 'WORK ORDER list is not empty')){

                    //Itirate thru the table to read each row and get the Total
                    for(eachRow in workOrderArray){
                        var myRow = workOrderArray[eachRow];
                        var myRowTotal = myRow.Total;//Get total for current row
                        if(!isNaN(parseFloat(myRowTotal)))
                            totalAmount = totalAmount + parseFloat(myRowTotal);//add total to totalAmount
                    }
                }

                //Update Amount field with sum of total fields from Custom List.
                if(!isNaN(parseFloat(totalAmount)))
                    editAppSpecific("Amount", totalAmount);
            }
            catch(err){
                showMessage = true;
                logDebug("Error on custom function enfScrt188_woUpdateAmount(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt188_woUpdateAmount() ended.");
        };//END enfScrt188_woUpdateAmount()

        //Script 185
        //WorkflowTaskUpdateAfter (WTUA)
        //Update workflow on  Enforcement/Demolition/NA/NA when child building Demo permit is issued.
        var enfScrt185_updateDemoCase = root.enfScrt185_updateDemoCase = function(){
            logDebug("enfScrt185_updateDemoCase() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils
                    ;

                showDebug = bs.constants.debug;

                if($iTrc(wfTask == "Permit Issuance" && "Issued", 'wfTask == "Permit Issuance" && "Issued"')){
                    var parentCapId = getParent(capId);

                    if(parentCapId){
                        var parCap = aa.cap.getCap(parentCapId).getOutput();
                        var parAppTypeString = parCap.getCapType().toString();

                        if($iTrc(parAppTypeString == "Enforcement/Demolition/NA/NA", 'parAppTypeString == "Enforcement/Demolition/NA/NA"')){
                            //If task is not Active we need to activate it before updating.
                            if($iTrc(!$utils.accela.workflow.isTaskActiveByCapId(parentCapId, "Demolition Work", "ENF_DEMO"), '!isTaskActiveByCapId("Demolition Work")'))
                                $utils.accela.workflow.activateTaskByCapId(parentCapId, "Demolition Work", "ENF_DEMO");

                            updateTask("Demolition Work", "Permit is Issued", "Updated via script 185.", "Updated via script 185", "", parentCapId);
                        }
                    }
                }
            }
            catch(err){
                showMessage = true;
                comment("Error on custom function enfScrt185_updateDemoCase(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt185_updateDemoCase() ended.");
        };//END enfScrt185_updateDemoCase()

        //Script 189
        //InspectionScheduleBefore (ISB)
        //Prevent Inspection Schedule of Code Compliance group if fee balance exist.
        var enfScrt189_cancelInspectionSchedule = root.enfScrt189_cancelInspectionSchedule = function (){
            logDebug("enfScrt189_cancelInspectionSchedule() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    feeBalance = $utils.accela.fees.getBalance("", "", null, capId);

                showDebug = bs.constants.debug;

                if($iTrc(inspGroup == "ENF_COMP" && feeBalance > 0, 'inspGroup == "ENF_COMP" && feeBalance > 0')){
                    cancel = true;
                    showMessage = true;
                    comment("An inspection cannot be scheduled until all fees are paid");
                }

            }
            catch(err){
                showMessage = true;
                comment("Error on custom function enfScrt189_cancelInspectionSchedule(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt189_cancelInspectionSchedule() ended.");
        };//END enfScrt189_cancelInspectionSchedule()

        //Script 364
        //ApplicationSpecificInfoUpdateAfter(ASIUA)
        //When an item is added to the Violation Types list, default the ‘Date Added’ field to today’s date
        var enfScrt364_dateAddedInViolationTypesList = root.enfScrt364_dateAddedInViolationTypesList = function (){
            logDebug("enfScrt364_dateAddedInViolationTypesList() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    customListName = "VIOLATION TYPE";

                showDebug = bs.constants.debug;

                //Load the table into an array
                var violationTypeTable = loadASITable(customListName);

                //Loop through each row
                for(eachRow in violationTypeTable){
                    var myRow = violationTypeTable[eachRow];
                    //if Date Added is blank then we set to today's date.
                    if($iTrc(myRow["Date Added"] == "", 'myRow["Date Added"] == ""')){
                        myRow["Date Added"] = dateAdd(null, 0);
                    }
                }

                //It's not easy to update a row directly via scripting,
                //therefore we need to remove the rows and add them again using the updated array.
                removeASITable(customListName);
                addASITable(customListName, violationTypeTable);
            }
            catch(err){
                showMessage = true;
                comment("Error on custom function enfScrt364_dateAddedInViolationTypesList(). Please contact administrator.  Err: " + err);
            }
            logDebug("enfScrt364_dateAddedInViolationTypesList() ended.");
        };//END enfScrt364_dateAddedInViolationTypesList()

        //Script 186 - 187
        //ApplicationSpecificInfoUpdateAfter(ASIUA)
        //Assign the appropriate Unit Price based on the Item selected
        var enfScrt186_187_updateUnitPriceNTotal = root.enfScrt186_187_updateUnitPriceNTotal = function (){
            logDebug("enfScrt186_187_updateUnitPriceNTotal() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    customListName = "WORK ORDER",
                    unitPriceLookupTable = "FNO_WO_UNIT_PRICE";

                showDebug = bs.constants.debug;

                //Load the table into an array.
                var workOrderTable = loadASITable(customListName);

                //Loop through each row
                for(eachRow in workOrderTable){
                    var myRow = workOrderTable[eachRow];
                    var workItem = myRow["Work Items"]
                    var unitPrice = lookup(unitPriceLookupTable, workItem) != "undefined" ? lookup(unitPriceLookupTable, workItem) : "";
                    //if Date Added is blank then we set to today's date.
                    if($iTrc(myRow["Unit Price"] == "", 'myRow["Unit Price"] == ""')){
                        myRow["Unit Price"] = unitPrice;
                        if(!isNaN(unitPrice))
                            myRow["Total"] = (parseFloat(myRow["Unit Price"]) * parseFloat(myRow["Quantity"])) + "";
                    }
                    else{
                        myRow["Total"] = (parseFloat(myRow["Unit Price"]) * parseFloat(myRow["Quantity"])) + "";
                    }
                }

                //It's not easy to update a row directly via scripting,
                //therefore we need to remove the rows and add them again using the updated array.
                removeASITable(customListName);
                addASITable(customListName, workOrderTable);

            }catch(err){
                showMessage = true;
                comment("Error on custom function enfScrt186_187_updateUnitPriceNTotal(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt186_187_updateUnitPriceNTotal() ended.");
        };//END enfScrt186_187_updateUnitPriceNTotal()

        //Script 237
        //ApplicationSubmitAfter(ASA)
        //Assign the correct Area to the record
        var enfScrt237_areaAssignment = root.enfScrt237_areaAssignment = function (){
            logDebug("enfScrt237_areaAssignment() started");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    assignDeptLookup = "COF CODE ENF AREA",
                    assign2Dept = "",
                    parcelAttr = new Array(),
                    codeInspArea = getGISInfo("FRESNO", "Parcels", "CODE_ENFORCEMENT_AREA");

                loadParcelAttributes(parcelAttr);

                showDebug = bs.constants.debug;

                assign2Dept = lookup(assignDeptLookup, codeInspArea);

                if($iTrc(codeInspArea && assign2Dept != undefined, 'codeInspArea && assign2Dept != "undefined"')){
                    $utils.accela.assignCap2Dept(assign2Dept);
                }

            }catch(err){
                showMessage = true;comment("Error on custom function enfScrt237_areaAssignment(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt237_areaAssignment() ended.");
        };//END enfScrt237_areaAssignment();

        //Script 363
        //ApplicationSubmitAfter(ASA)
        //Add a notice to the General Enforcement record when an address is flagged as being a registered vacant building
        var enfScrt363_addVacantBldNotice = root.enfScrt363_addVacantBldNotice = function() {
            logDebug("enfScrt363_addVacantBldNotice() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    conditionGroup = "Enforcement",
                    conditionType = "Vacant Building",
                    conditionName = "Registered Vacant Building",
                    conditionComment = "The address associated with this case is a registered vacant building",
                    //dispConditionComment = "The address associated with this case is a registered vacant building",
                    //resConditionComment = "The address associated with this case is a registered vacant building",
                    impactCode = "Notice",
                    condStatus = "Applied",
                    auditStatus = "A",
                    displayNotice = "Y",
                    addrAttr = new Array(),
                    resVacBld = null;

                showDebug = bs.constants.debug;

                loadAddressAttributes(addrAttr);

                resVacBld = addrAttr["AddressAttribute.REGISTERED VACANT BUILDING"];

                if($iTrc(resVacBld && resVacBld.toUpperCase() == "YES", 'resVacBld && resVacBld.toUpperCase() == "YES"')){

                    //Create new empty cap condition model and set the expected values.
                    var newCondModel = aa.capCondition.getNewConditionScriptModel().getOutput();
                    newCondModel.setCapID(capId);
                    newCondModel.setConditionGroup(conditionGroup);
                    newCondModel.setConditionType(conditionType);
                    newCondModel.setConditionDescription(conditionName);
                    newCondModel.setConditionComment(conditionComment);
                    newCondModel.setConditionStatus(condStatus);
                    newCondModel.setEffectDate(sysDate);
                    newCondModel.setIssuedDate(sysDate);
                    newCondModel.setIssuedByUser(systemUserObj);
                    newCondModel.setStatusByUser(systemUserObj);
                    newCondModel.setAuditID(currentUserID);
                    newCondModel.setAuditStatus(auditStatus);
                    newCondModel.setDisplayConditionNotice(displayNotice);
                    newCondModel.setImpactCode(impactCode);

                    aa.capCondition.createCapCondition(newCondModel);
                }

            }catch(err){
                showMessage = true; comment("Error on custom function enfScrt363_addVacantBldNotice(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt363_addVacantBldNotice() ended");
        };//END enfScrt363_addVacantBldNotice()

        //Script 180
        //DocumentUploadAfter (DUA)
        //When a Document with the type of "Contractor Photos" is uploaded to ACA on a Work Order record,
        //send an email to the Assigned Staff of both the Work Order and the related Parent record, create a Follow Up inspection as a Pending inspection
        var enfScrt180_schedFollowUpInsp = root.enfScrt180_schedFollowUpInsp = function(){
            logDebug("enfScrt180_schedFollowUpInsp() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    docType = "Contractor Photos";
                if($iTrc(publicUser, 'publicUser')){
                    if($iTrc(uploadedDocument(docType), 'uploadedDocument(docType)')){
                        var assignedUser = getAssignedCapUser(),
                            assignedUserEmail = getUserEmail(assignedUser),
                            parAssignedUser = "",
                            parAssignedUserEmail = "",
                            inspGroup = "ENF_COMP",
                            inspType = "Follow-Up Inspection",
                            altId = capId.getCustomID(),
                            parentCapId = getParent(capId),
                            parentAltId = "",
                            address = "",
                            addrArr = new Array(),
                            emailSubj = "Contractor Photos Uploaded for " + altId,
                            emailBody = "Contractor Photos have been uploaded for " + altId + " at ",
                            parcelNum = ""
                            ;

                        showDebug = bs.constants.debug;

                        loadAddressAttributes(addrArr);
                        address = addrArr["AddressAttribute.HouseNumberStart"] + " " +
                                  addrArr["AddressAttribute.StreetDirection"] + " " +
                                  addrArr["AddressAttribute.StreetName"] + " " +
                                  addrArr["AddressAttribute.Zip"] + " ";

                        //Get parcel to get the parcel number to include in email body.
                        var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
                        if (!capParcelResult.getSuccess())
                            logDebug("**ERROR: Failed to get parcels: " + capParcelResult.getErrorMessage());

                        var Parcels = capParcelResult.getOutput().toArray();
                        if (Parcels[0]==undefined)
                            logDebug("Current CAP has no parcel");

                        if(Parcels[0]!=undefined)
                            parcelNum = Parcels[0].getParcelNumber();

                        //update email body text with address and
                        emailBody += address + parcelNum;

                        //Email assigned user of WO.
                        if(assignedUser){
                            if(assignedUserEmail)
                                bs.utils.accela.email.emailPerson({ to: assignedUserEmail, subj: emailSubj, body: emailBody });
                            else
                                logDebug("WARNING: Unable to email assigned user of Work Order");
                        }

                        //Send email to assigned user of parent enforcement record.
                        if(parentCapId){
                            var parCap = aa.cap.getCap(parentCapId).getOutput();
                            var parAppTypeString = parCap.getCapType().toString();
                            parentAltId = parentCapId.getCustomID();

                            if($iTrc(matches(parAppTypeString, "Enforcement/Demolition/NA/NA", "Enforcement/General Enforcement/NA/NA", "Enforcement/Weed Abatement/NA/NA"),
                                     'matches(parAppTypeString, "Enforcement/Demolition/NA/NA", "Enforcement/General Enforcement/NA/NA", "Enforcement/Weed Abatement/NA/NA")')){
                                parAssignedUser = getAssignedCapUser(parentCapId);
                                if(parAssignedUser)
                                   parAssignedUserEmail = getUserEmail(parAssignedUser)

                                if(parAssignedUser && parAssignedUserEmail)
                                    bs.utils.accela.email.emailPerson({ to: parAssignedUserEmail, subj: emailSubj, body: emailBody });
                                else
                                    logDebug("WARNING: Unable to email assigned user of Work Order Parent");
                                
                                //Create pending inspection on parent enforcement record.
                                createPendingInspection(inspGroup, inspType, parentCapId);
                            }
                        }
                    }
                }
            }catch(err){
                showMessage = true;comment("Error on custom function enfScrt180_schedFollowUpInsp(). Please contact administrator. Err: " + err);
            }
            logDebug("enfScrt180_schedFollowUpInsp() ended.");
        };//END enfScrt180_schedFollowUpInsp()

        //Script 174
        //ApplicationSubmitAfter(ASA)
        //Open building or planning record with same address
        var enfScrt174_openRecsWithSameAddress = root.enfScrt174_openRecsWithSameAddress = function(){
            logDebug("enfScrt174_openRecsWithSameAddress() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    conditionGroup = "Enforcement",
                    conditionType = "",
                    conditionName = "",
                    conditionComment = "",
                    //dispConditionComment = "",
                    //resConditionComment = "",
                    impactCode = "Notice",
                    condStatus = "Applied",
                    auditStatus = "A",
                    displayNotice = "Y",
                    sameAddrAltId = "",
                    sameAddrCapId = "",
                    parcelNum = "",
                    sameParcelAltId = "",
                    sameParcelCapId = "",
                    capIdsArray = capIdsGetByAddr(),
                    capIdsArraySameParcel = new Array(),
                    bldOpenRecsAltIds = new Array(),
                    bldOpenRecsCapIds = new Array(),
                    bldOpenRecsParcelAltIds = new Array(),
                    bldOpenRecsParcelCapIds = new Array(),
                    bldOpenRecsBothAltIds = new Array(),
                    bldOpenRecsBothCapIds = new Array(),
                    plnOpenRecsAltIds = new Array(),
                    plnOpenRecsCapIds = new Array(),
                    plnOpenRecsParcelAltIds = new Array(),
                    plnOpenRecsParcelCapIds = new Array(),
                    plnOpenRecsBothAltIds = new Array(),
                    plnOpenRecsBothCapIds = new Array();

                showDebug = bs.constants.debug;

                //Get parcel to get the parcel number to include in email body.
                var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
                if (!capParcelResult.getSuccess())
                    logDebug("**ERROR: Failed to get parcels: " + capParcelResult.getErrorMessage());

                var Parcels = capParcelResult.getOutput().toArray();
                if (Parcels[0]==undefined)
                    logDebug("Current CAP has no parcel");

                if(Parcels[0]!=undefined)
                    parcelNum = Parcels[0].getParcelNumber();

                if($iTrc(parcelNum != "", 'parcelNum != ""'))
                    capIdsArraySameParcel = capIdsGetByParcel(parcelNum);

                //For each record with same address
                for(eachCapId in capIdsArray){
                    sameAddrCapId = capIdsArray[eachCapId];
                    sameAddrAltId = capIdsArray[eachCapId].getCustomID();

                    var sameAddrCap = aa.cap.getCap(sameAddrCapId).getOutput();
                    var sameAddrAppTypeString = sameAddrCap.getCapType().toString();
                    var sameAddrAppTypeArray = sameAddrAppTypeString.split("/");
                    var sameAddrAppType = sameAddrAppTypeArray[0];

                    //if application type is of Building or Planning
                    if($iTrc(matches(sameAddrAppType, "Building", "Planning"), 'matches(sameAddrAppType, "Building", "Planning")')){
                        //check if any workflow tasks are active
                        if(activeTasksCheckByCapId(sameAddrCapId)){
                            //push the record id in an array to use later in the code

                            //If rec exists on same parcel records, then we put on both array.
                            if(capIdsArraySameParcel.toString().indexOf(sameAddrCapId) != -1){
                                //If record type is Building then we add to building list.
                                if(sameAddrAppType == "Building"){
                                    bldOpenRecsBothAltIds.push(sameAddrAltId);
                                    bldOpenRecsBothCapIds.push(sameAddrCapId);
                                }//else planning list
                                else{
                                    plnOpenRecsBothAltIds.push(sameAddrAltId);
                                    plnOpenRecsBothCapIds.push(sameAddrCapId);
                                }
                            }
                            else{
                                //If record type is Building then we add to building list.
                                if(sameAddrAppType == "Building"){
                                    bldOpenRecsAltIds.push(sameAddrAltId);
                                    bldOpenRecsCapIds.push(sameAddrCapId);
                                }//else planning list
                                else{
                                    plnOpenRecsAltIds.push(sameAddrAltId);
                                    plnOpenRecsCapIds.push(sameAddrCapId);
                                }
                            }
                        }
                    }
                }

                //For each record with same parcel
                for(eachCapId in capIdsArraySameParcel){
                    sameParcelCapId = capIdsArraySameParcel[eachCapId];
                    sameParcelAltId = capIdsArraySameParcel[eachCapId].getCustomID();

                    var sameParcelCap = aa.cap.getCap(sameParcelCapId).getOutput();
                    var sameParcelAppTypeString = sameParcelCap.getCapType().toString();
                    var sameParcelAppTypeArray = sameParcelAppTypeString.split("/");
                    var sameParcelAppType = sameParcelAppTypeArray[0];

                    //if application type is of Building or Planning
                    if($iTrc(matches(sameParcelAppType, "Building", "Planning"), 'matches(sameAddrAppType, "Building", "Planning")')){
                        //check if any workflow tasks are active
                        if(activeTasksCheckByCapId(sameParcelCapId)){
                            //push the record id in an array to use later in the code
                            //if record exists on same address array, then we have already put on both array
                            //and we only need to put in parcel array if not in address array
                            if(capIdsArray.toString().indexOf(sameParcelCapId) == -1){
                                //if record type is building then push into building list
                                if(sameParcelAppType == "Building"){
                                    bldOpenRecsParcelAltIds.push(sameParcelAltId);
                                    bldOpenRecsParcelCapIds.push(sameParcelCapId);
                                }//Else into planning list
                                else{
                                    plnOpenRecsParcelAltIds.push(sameParcelAltId);
                                    plnOpenRecsParcelCapIds.push(sameParcelCapId);
                                }
                            }
                        }
                    }
                }

                //PROCESS BUILDING RECORDS
                //if there are any open records
                if($iTrc(bldOpenRecsAltIds.length > 0 || bldOpenRecsParcelAltIds.length > 0 || bldOpenRecsBothAltIds.length > 0, 'bldOpenRecsAltIds.length > 0 || bldOpenRecsParcelAltIds.length > 0 || bldOpenRecsBothAltIds.length > 0')){
                    //If there is only one open record then we use 'record' and 'is'
                    if($iTrc(bldOpenRecsAltIds.length == 1 && bldOpenRecsParcelAltIds.length == 0 && bldOpenRecsBothAltIds.length == 0, 'bldOpenRecsAltIds.length == 1 && bldOpenRecsParcelAltIds.length == 0 && bldOpenRecsBothAltIds.length == 0')){
                        conditionName = "Record " + bldOpenRecsAltIds;
                        conditionComment = "The following record " + bldOpenRecsAltIds + " is active for the address this case is associated with."
                    }
                    if($iTrc(bldOpenRecsAltIds.length == 0 && bldOpenRecsParcelAltIds.length == 1 && bldOpenRecsBothAltIds.length == 0, 'bldOpenRecsAltIds.length == 0 && bldOpenRecsParcelAltIds.length == 1 && bldOpenRecsBothAltIds.length == 0')){
                        conditionName = "Record " + bldOpenRecsParcelAltIds;
                        conditionComment = "The following record " + bldOpenRecsParcelAltIds + " is active for the parcel this case is associated with."
                    }
                    if($iTrc(bldOpenRecsAltIds.length == 0 && bldOpenRecsParcelAltIds.length == 0 && bldOpenRecsBothAltIds.length == 1, 'bldOpenRecsAltIds.length == 0 && bldOpenRecsParcelAltIds.length == 0 && bldOpenRecsBothAltIds.length == 1')){
                        conditionName = "Record " + bldOpenRecsBothAltIds;
                        conditionComment = "The following record " + bldOpenRecsBothAltIds + " is active for the address and parcel this case is associated with."
                    }

                    //else if more than one, we use 'records' and 'are'
                    if($iTrc(bldOpenRecsBothAltIds.length > 1, 'bldOpenRecsBothAltIds.length > 1')){
                        conditionName = "Records " + bldOpenRecsBothAltIds[0] + "," + bldOpenRecsBothAltIds[1] + ",...";
                        conditionComment += "The following records " + bldOpenRecsBothAltIds + " are active for the address and parcel this case is associated with.  ";
                    }

                    if($iTrc(bldOpenRecsAltIds.length > 1, 'bldOpenRecsAltIds.length > 1')){
                        if(conditionName == "")
                            conditionName = "Records " + bldOpenRecsAltIds[0] + "," + bldOpenRecsAltIds[1] + ",...";

                        conditionComment += "The following records " + bldOpenRecsAltIds + " are active for the address this case is associated with.  ";
                    }

                    if($iTrc(bldOpenRecsParcelAltIds.length > 1, 'bldOpenRecsParcelAltIds.length > 1')){
                        if(conditionName == "")
                            conditionName = "Records " + bldOpenRecsParcelAltIds[0] + "," + bldOpenRecsParcelAltIds[1] + ",...";

                        conditionComment += "The following records " + bldOpenRecsParcelAltIds + " are active for the parcel this case is associated with.  ";
                    }

                    conditionType = "Open Building Record";

                    //Create new empty cap condition model and set the expected values.
                    var newCondModel = aa.capCondition.getNewConditionScriptModel().getOutput();
                    newCondModel.setCapID(capId);
                    newCondModel.setConditionGroup(conditionGroup);
                    newCondModel.setConditionType(conditionType);
                    newCondModel.setConditionDescription(conditionName);
                    newCondModel.setConditionComment(conditionComment);
                    newCondModel.setConditionStatus(condStatus);
                    newCondModel.setEffectDate(sysDate);
                    newCondModel.setIssuedDate(sysDate);
                    newCondModel.setIssuedByUser(systemUserObj);
                    newCondModel.setStatusByUser(systemUserObj);
                    newCondModel.setAuditID(currentUserID);
                    newCondModel.setAuditStatus(auditStatus);
                    newCondModel.setDisplayConditionNotice(displayNotice);
                    newCondModel.setImpactCode(impactCode);

                    aa.capCondition.createCapCondition(newCondModel);

                    //link each record as parent of the enforcement record.
                    for(eachCapId in bldOpenRecsCapIds) addParent(bldOpenRecsCapIds[eachCapId]);
                    for(eachCapId in bldOpenRecsParcelCapIds) addParent(bldOpenRecsParcelCapIds[eachCapId]);
                    for(eachCapId in bldOpenRecsBothCapIds) addParent(bldOpenRecsBothCapIds[eachCapId]);
                }

                //PROCESS PLANNING RECORDS
                //if there are any open records
                if($iTrc(plnOpenRecsAltIds.length > 0 || plnOpenRecsParcelAltIds.length > 0 || plnOpenRecsBothAltIds.length > 0, 'plnOpenRecsAltIds.length > 0 || plnOpenRecsParcelAltIds.length > 0 || plnOpenRecsBothAltIds.length > 0')){
                    //If there is only one open record then we use 'record' and 'is'
                    if($iTrc(plnOpenRecsAltIds.length == 1 && plnOpenRecsParcelAltIds.length == 0 && plnOpenRecsBothAltIds.length == 0, 'plnOpenRecsAltIds.length == 1 && plnOpenRecsParcelAltIds.length == 0 && plnOpenRecsBothAltIds.length == 0')){
                        conditionName = "Record " + plnOpenRecsAltIds;
                        conditionComment = "The following record " + plnOpenRecsAltIds + " is active for the address this case is associated with."
                    }
                    if($iTrc(plnOpenRecsAltIds.length == 0 && plnOpenRecsParcelAltIds.length == 1 && plnOpenRecsBothAltIds.length == 0, 'plnOpenRecsAltIds.length == 0 && plnOpenRecsParcelAltIds.length == 1 && plnOpenRecsBothAltIds.length == 0')){
                        conditionName = "Record " + plnOpenRecsParcelAltIds;
                        conditionComment = "The following record " + plnOpenRecsParcelAltIds + " is active for the parcel this case is associated with."
                    }
                    if($iTrc(plnOpenRecsAltIds.length == 0 && plnOpenRecsParcelAltIds.length == 0 && plnOpenRecsBothAltIds.length == 1, 'plnOpenRecsAltIds.length == 0 && plnOpenRecsParcelAltIds.length == 0 && plnOpenRecsBothAltIds.length == 1')){
                        conditionName = "Record " + plnOpenRecsBothAltIds;
                        conditionComment = "The following record " + plnOpenRecsBothAltIds + " is active for the address and parcel this case is associated with."
                    }

                    //else if more than one, we use 'records' and 'are'
                    if($iTrc(plnOpenRecsBothAltIds.length > 1, 'plnOpenRecsBothAltIds.length > 1')){
                        conditionName = "Records " + plnOpenRecsBothAltIds[0] + "," + plnOpenRecsBothAltIds[1] + ",...";
                        conditionComment += "The following records " + plnOpenRecsBothAltIds + " are active for the address and parcel this case is associated with.  ";
                    }

                    if($iTrc(plnOpenRecsAltIds.length > 1, 'plnOpenRecsAltIds.length > 1')){
                        if(conditionName == "")
                            conditionName = "Records " + plnOpenRecsAltIds[0] + "," + plnOpenRecsAltIds[1] + ",...";

                        conditionComment += "The following records " + plnOpenRecsAltIds + " are active for the address this case is associated with.  ";
                    }

                    if($iTrc(plnOpenRecsParcelAltIds.length > 1, 'plnOpenRecsParcelAltIds.length > 1')){
                        if(conditionName == "")
                            conditionName = "Records " + plnOpenRecsParcelAltIds[0] + "," + plnOpenRecsParcelAltIds[1] + ",...";

                        conditionComment += "The following records " + plnOpenRecsParcelAltIds + " are active for the parcel this case is associated with.  ";
                    }

                    conditionType = "Open Planning Record";

                    //Create new empty cap condition model and set the expected values.
                    var newCondModel = aa.capCondition.getNewConditionScriptModel().getOutput();
                    newCondModel.setCapID(capId);
                    newCondModel.setConditionGroup(conditionGroup);
                    newCondModel.setConditionType(conditionType);
                    newCondModel.setConditionDescription(conditionName);
                    newCondModel.setConditionComment(conditionComment);
                    newCondModel.setConditionStatus(condStatus);
                    newCondModel.setEffectDate(sysDate);
                    newCondModel.setIssuedDate(sysDate);
                    newCondModel.setIssuedByUser(systemUserObj);
                    newCondModel.setStatusByUser(systemUserObj);
                    newCondModel.setAuditID(currentUserID);
                    newCondModel.setAuditStatus(auditStatus);
                    newCondModel.setDisplayConditionNotice(displayNotice);
                    newCondModel.setImpactCode(impactCode);

                    aa.capCondition.createCapCondition(newCondModel);

                    //link each record as parent of the enforcement record.
                    for(eachCapId in plnOpenRecsCapIds) addParent(plnOpenRecsCapIds[eachCapId]);
                    for(eachCapId in plnOpenRecsParcelCapIds) addParent(plnOpenRecsParcelCapIds[eachCapId]);
                    for(eachCapId in plnOpenRecsBothCapIds) addParent(plnOpenRecsBothCapIds[eachCapId]);
                }

            }catch(err){
                showMessage = true;comment("Error on enfScrt174_openRecsWithSameAddress(). Please contact system administrator. Err: " + err);
            }
            logDebug("enfScrt174_openRecsWithSameAddress() ended.");
        };//END enfScrt174_openRecsWithSameAddress()

        //Script 58
        //ApplicationSubmitAfter(ASA)
        //Add Variance Application Fee
        var plnScrt58_addVariaceFee = root.plnScrt58_addVariaceFee = function (){
            logDebug("plnScrt58_addVariaceFee() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    singleFam = AInfo["Is this a Single family residential lot 1 acre or less?"],
                    securityRel = AInfo["Is this Security Related?"],
                    addrAttr = new Array(),
                    innerCity = null,
                    feeSched = 'PLN_VAR',
                    feeItem = 'PLN_VAR _01',
                    feeAmount = 0,
                    env = aa.env.getValue("From");

                showDebug = bs.constants.debug;

                loadAddressAttributes(addrAttr);
                innerCity = addrAttr["AddressAttribute.INNER_CITY"];

                if($iTrc((singleFam == "Yes" || securityRel == "Yes") && (innerCity == " " || innerCity == null), '(singleFam == "Yes" || securityRel == "Yes") && (innerCity == " " || innerCity == null)')){
                    feeAmount = 6160;
                }
                else if($iTrc((singleFam == "Yes" || securityRel == "Yes") && innerCity != " " && innerCity != null, '(singleFam == "Yes" || securityRel == "Yes") && innerCity != " " && innerCity != null')){
                    feeAmount = 3080;
                }
                else if($iTrc(singleFam == "No" && securityRel == "No" && (innerCity == " " || innerCity == null), 'singleFam == "No" && securityRel == "No" && (innerCity == " " || innerCity == null)')){
                    feeAmount = 8020;
                }
                else if($iTrc(singleFam == "No" && securityRel == "No" && innerCity != " " && innerCity != null, 'singleFam == "No" && securityRel == "No" && innerCity != " " && innerCity != null')){
                    feeAmount = 4010;
                }

                if($iTrc(feeAmount > 0, 'feeAmount > 0')){
                    //If environment is AA then we use addFee
                    if($iTrc(env == "AA", 'env == "AA"'))
                        addFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                    else//else it comes from ACA then we need to use update Fee incase use goes back and updates the options and amount needs to change.
                        updateFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                }

            }catch(err){
                showMessage = true; comment("Error on plnScrt58_addVariaceFee(). Please contact administrator. Err: " + err);
            }
            logDebug("plnScrt58_addVariaceFee() ended.");
        };//END plnScrt58_addVariaceFee()

        //Script 64
        //ApplicationSubmitAfter(ASA)
        //Add CUP Fee
        var plnScrt64_addCUPFee = root.plnScrt64_addCUPFee = function(){
            logDebug("plnScrt64_addCUPFee() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    appType = AInfo["Application Type"],
                    addrAttr = new Array(),
                    innerCity = null,
                    feeSched = 'PLN_CUP',
                    feeItem = 'PLN_CUP_01',
                    feeAmount = 0,
                    env = aa.env.getValue("From");

                showDebug = bs.constants.debug;

                if($iTrc(publicUser, 'publicUser')){
                    loadAddressAttributes(addrAttr);
                    innerCity = addrAttr["AddressAttribute.INNER_CITY"];

                    if($iTrc(appType == "Conditional Use Permit - New Use" && (innerCity == " " || innerCity == null), 'appType == "Conditional Use Permit - New Use" && (innerCity == " " || innerCity == null)')){
                        feeAmount = 8177;
                    }
                    else if($iTrc(appType == "Conditional Use Permit - New Use" && innerCity != " " && innerCity != null, 'appType == "Conditional Use Permit - New Use" && innerCity != " " && innerCity != null')){
                        feeAmount = 4089;
                    }
                    else if($iTrc(appType == "Conditional Use Permit - Amendment" && (innerCity == " " || innerCity == null), 'appType == "Conditional Use Permit - Amendment" && (innerCity == " " || innerCity == null)')){
                        feeAmount = 3271;
                    }
                    else if($iTrc(appType == "Conditional Use Permit - Amendment" && innerCity != " " && innerCity != null, 'appType == "Conditional Use Permit - Amendment" && innerCity != " " && innerCity != null')){
                        feeAmount = 1636;
                    }

                    if($iTrc(feeAmount > 0, 'feeAmount > 0')){
                        //If environment is AA then we use addFee
                        if($iTrc(env == "AA", 'env == "AA"'))
                            addFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                        else//else it comes from ACA then we need to use update Fee incase use goes back and updates the options and amount needs to change.
                            updateFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                    }

                    //if in ACA and user went back and chose something different than conditional use permit we need to update the fee to zero
                    if($iTrc(env != "AA" && !matches(appType, "Conditional Use Permit - Amendment", "Conditional Use Permit - New Use"), 'env != "AA" && !matches(appType, "Conditional Use Permit - Amendment", "Conditional Use Permit - New Use")'))
                        if($iTrc(feeExists(feeItem), 'feeExists(feeItem)')) updateFee(feeItem, feeSched, 'FINAL', 0, 'Y');
                }

            }catch(err){
                showMessage = true; comment("Error on plnScrt64_addCUPFee(). Please contact administrator. Err: " + err);
            }
            logDebug("plnScrt64_addCUPFee() ended.");
        };//END plnScrt64_addCUPFee()

        //Script 64
        //ApplicationSpecificInfoUpdateAfter(ASIUA)
        //Add CUP Fee
        var plnScrt64_addCUPFeeAA = root.plnScrt64_addCUPFeeAA = function(){
            logDebug("plnScrt64_addCUPFeeAA() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    appType = AInfo["Application Type"],
                    addrAttr = new Array(),
                    innerCity = null,
                    feeSched = 'PLN_CUP',
                    feeItem = 'PLN_CUP_01',
                    feeAmount = 0;

                showDebug = bs.constants.debug;

                loadAddressAttributes(addrAttr);
                innerCity = addrAttr["AddressAttribute.INNER_CITY"];

                if($iTrc(appType == "Conditional Use Permit - New Use" && (innerCity == " " || innerCity == null), 'appType == "Conditional Use Permit - New Use" && (innerCity == " " || innerCity == null)')){
                    feeAmount = 8177;
                }
                else if($iTrc(appType == "Conditional Use Permit - New Use" && innerCity != " " && innerCity != null, 'appType == "Conditional Use Permit - New Use" && innerCity != " " && innerCity != null')){
                    feeAmount = 4089;
                }
                else if($iTrc(appType == "Conditional Use Permit - Amendment" && (innerCity == " " || innerCity == null), 'appType == "Conditional Use Permit - Amendment" && (innerCity == " " || innerCity == null)')){
                    feeAmount = 3271;
                }
                else if($iTrc(appType == "Conditional Use Permit - Amendment" && innerCity != " " && innerCity != null, 'appType == "Conditional Use Permit - Amendment" && innerCity != " " && innerCity != null')){
                    feeAmount = 1636;
                }

                if($iTrc(feeAmount > 0, 'feeAmount > 0')){
                    if($iTrc(!feeExists(feeItem), '!feeExists(feeItem)'))
                        addFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                    else
                        updateFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                }

                //if in ACA and user went back and chose something different than conditional use permit we need to update the fee to zero
                if($iTrc(!matches(appType, "Conditional Use Permit - Amendment", "Conditional Use Permit - New Use"), '!matches(appType, "Conditional Use Permit - Amendment", "Conditional Use Permit - New Use")'))
                    if($iTrc(feeExists(feeItem), 'feeExists(feeItem)')) updateFee(feeItem, feeSched, 'FINAL', 0, 'Y');

            }catch(err){
                showMessage = true; comment("Error on plnScrt64_addCUPFeeAA(). Please contact administrator. Err: " + err);
            }
            logDebug("plnScrt64_addCUPFeeAA() ended.");
        };//END plnScrt64_addCUPFeeAA()

        //Script 68
        //ApplicationSubmitAfter(ASA)
        //Add Development Permit Application Fee
        var plnScrt68_addDevPermitFee = root.plnScrt68_addDevPermitFee = function(){
            logDebug("plnScrt68_addDevPermitFee() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    appType = AInfo["Application Type"],
                    addrAttr = new Array(),
                    innerCity = null,
                    feeSched = 'PLN_DEV_PMT',
                    feeItem = 'PLN_DP_01',
                    feeAmount = 0,
                    env = aa.env.getValue("From");

                showDebug = bs.constants.debug;

                if($iTrc(publicUser, 'publicUser')){
                    loadAddressAttributes(addrAttr);
                    innerCity = addrAttr["AddressAttribute.INNER_CITY"];

                    if($iTrc(appType == "Development Permit" && (innerCity == " " || innerCity == null), 'appType == "Development Permit" && (innerCity == " " || innerCity == null)')){
                        feeAmount = 6905;
                    }
                    else if($iTrc(appType == "Development Permit" && innerCity != " " && innerCity != null, 'appType == "Development Permit" && innerCity != " " && innerCity != null')){
                        feeAmount = 3453;
                    }
                    else if($iTrc(appType == "Amendment to Development Permit" && (innerCity == " " || innerCity == null), 'appType == "Amendment to Development Permit" && (innerCity == " " || innerCity == null)')){
                        feeAmount = 2726;
                    }
                    else if($iTrc(appType == "Amendment to Development Permit" && innerCity != " " && innerCity != null, 'appType == "Amendment to Development Permit" && innerCity != " " && innerCity != null')){
                        feeAmount = 1363;
                    }

                    if($iTrc(feeAmount > 0, 'feeAmount > 0')){
                        //If environment is AA then we use addFee
                        if($iTrc(env == "AA", 'env == "AA"'))
                            addFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                        else//else it comes from ACA then we need to use update Fee incase use goes back and updates the options and amount needs to change.
                            updateFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                    }

                    //if in ACA and user went back and chose something different than conditional use permit we need to update the fee to zero
                    if($iTrc(env != "AA" && !matches(appType, "Development Permit", "Amendment to Development Permit"), 'env != "AA" && !matches(appType, "Development Permit", "Amendment to Development Permit")'))
                        if($iTrc(feeExists(feeItem), 'feeExists(feeItem)')) updateFee(feeItem, feeSched, 'FINAL', 0, 'Y');
                }
            }catch(err){
                showMessage = true; comment("Error on plnScrt68_addDevPermitFee(). Please contact administrator. Err: " + err);
            }
            logDebug("plnScrt68_addDevPermitFee() ended.");
        };//END plnScrt68_addDevPermitFee()

        //Script 68
        //ApplicationSpecificInfoUpdateAfter(ASIUA)
        //Add Development Permit Application Fee
        var plnScrt68_addDevPermitFeeAA = root.plnScrt68_addDevPermitFeeAA = function(){
            logDebug("plnScrt68_addDevPermitFeeAA() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    appType = AInfo["Application Type"],
                    addrAttr = new Array(),
                    innerCity = null,
                    feeSched = 'PLN_DEV_PMT',
                    feeItem = 'PLN_DP_01',
                    feeAmount = 0;

                showDebug = bs.constants.debug;

                loadAddressAttributes(addrAttr);
                innerCity = addrAttr["AddressAttribute.INNER_CITY"];

                if($iTrc(appType == "Development Permit" && (innerCity == " " || innerCity == null), 'appType == "Development Permit" && (innerCity == " " || innerCity == null)')){
                    feeAmount = 6905;
                }
                else if($iTrc(appType == "Development Permit" && innerCity != " " && innerCity != null, 'appType == "Development Permit" && innerCity != " " && innerCity != null')){
                    feeAmount = 3453;
                }
                else if($iTrc(appType == "Amendment to Development Permit" && (innerCity == " " || innerCity == null), 'appType == "Amendment to Development Permit" && (innerCity == " " || innerCity == null)')){
                    feeAmount = 2726;
                }
                else if($iTrc(appType == "Amendment to Development Permit" && innerCity != " " && innerCity != null, 'appType == "Amendment to Development Permit" && innerCity != " " && innerCity != null')){
                    feeAmount = 1363;
                }

                if($iTrc(feeAmount > 0, 'feeAmount > 0')){
                    if($iTrc(!feeExists(feeItem), '!feeExists(feeItem)'))
                        addFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                    else
                        updateFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                }

                //if in ACA and user went back and chose something different than conditional use permit we need to update the fee to zero
                if($iTrc(!matches(appType, "Development Permit", "Amendment to Development Permit"), '!matches(appType, "Development Permit", "Amendment to Development Permit")'))
                    if($iTrc(feeExists(feeItem), 'feeExists(feeItem)')) updateFee(feeItem, feeSched, 'FINAL', 0, 'Y');
            }catch(err){
                showMessage = true; comment("Error on plnScrt68_addDevPermitFeeAA(). Please contact administrator. Err: " + err);
            }
            logDebug("plnScrt68_addDevPermitFeeAA() ended.");
        };//END plnScrt68_addDevPermitFeeAA()

        //Script 33
        //ApplicationSubmitAfter (ASA)
        //Fee to be based on the “Proposed Lots” custom field.
        var landScrt33_addFinalMapFee = root.landScrt33_addFinalMapFee = function (){
            logDebug("landScrt33_addFinalMapFee() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    propLots = AInfo["Proposed Lots"],
                    feeSched = 'PLN_FINAL_MAP',
                    feeItem = 'FNL_MAP_01',
                    feeAmount = 0;

                showDebug = bs.constants.debug;

                feeAmount = 6228 + parseFloat((1827*Math.ceil(parseInt(propLots)/50)));

                if($iTrc(feeAmount > 0, 'feeAmount > 0')){
                    //If environment is AA then we use addFee
                    if($iTrc(!publicUser, '!publicUser'))
                        addFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                    else//else it comes from ACA then we need to use update Fee incase use goes back and updates the options and amount needs to change.
                        updateFee(feeItem, feeSched, 'FINAL', feeAmount, 'Y');
                }
            }catch(err){
                showMessage = true; comment("Error on custom function landScrt33_addFinalMapFee(). Please contact administrator. Err: " + err);
            }
            logDebug("landScrt33_addFinalMapFee() ended.")
        };//END landScrt33_addFinalMapFee()

        //Script 63
        //WorkflowTaskUpdateAfter(WTUA)
        //Update Record date from workflow task status
        var landScrt63_updateRecordedDate = root.landScrt63_updateRecordedDate = function (){
            logDebug("landScrt63_updateRecordedDate() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug;

                if($iTrc(wfTask == "Closure" && wfStatus == "Recorded Parcel Merger", 'wfTask == "Closure" && wfStatus == "Recorded Parcel Merger"'))
                    editAppSpecific("Recorded Date", wfDateMMDDYYYY);

            }catch(err){
                showMessage = true; comment("Error on custom function landScrt63_updateRecordedDate(). Please contact administrator. Err: " + err);
            }
            logDebug("landScrt63_updateRecordedDate() ended.");
        };//END landScrt63_updateRecordedDate()

        //Script 157
        //InspectionScheduleBefore (ISB)
        //When the Initial Inspection is first scheduled, update the workflow to Inspection Scheduled
        //We need to call in ISB because in ISA the count will count the currently scheduled inspections
        var fireScrt157_updateWfInsp = root.fireScrt157_updateWfInsp = function(){
            logDebug("fireScrt157_updateWfInsp() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    totalInsps = $utils.accela.inspection.getTotalSchedRessultedInspections(capId);

                if($iTrc(totalInsps == 0, 'totalInsps == 0')){
                    if($iTrc(isTaskActive("Inspection"), 'isTaskActive("Inspection")')){
                        updateTask("Inspection", "Inspection Scheduled", "Updated via script 157.", "Updated via script 157.");
                    }
                    else{
                        activateTask("Inspection");
                        updateTask("Inspection", "Inspection Scheduled", "Updated via script 157.", "Updated via script 157.");
                    }
                }

            }catch(err){
                showMessage = true; comment("Error on custom function fireScrt157_updateWfInsp(). Please contact administrator. Err: " + err);
            }

            logDebug("fireScrt157_updateWfInsp() ended.");
        };//END

        //Script 158
        //InspectionResultSubmitAfter(IRSA)
        //When and inspection is resulted as Failed do the following:
        //  1.  Automatically assign and invoice the Re-Inspection Fee (FIRE_GEN_22)
        var fireScrt158_failedInspection = root.fireScrt158_failedInspection = function(){
            logDebug("fireScrt158_failedInspection() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    feeItem = 'FIRE_GEN_22',
                    feeSched = 'FIRE_GENERAL';

                if($iTrc(inspResult == "Failed", 'inspResult == "Failed"')){
                    addFee(feeItem, feeSched, 'FINAL', 1, 'Y');
                }

            }catch(err){
                showMessage = true; comment("Error on custom function fireScrt158_failedInspection(). Please contact administrator. Err: " + err);
            }
            logDebug("fireScrt158_failedInspection() ended.")
        };//END fireScrt158_failedInspection()

        //Script 158
        //InspectionScheduleBefore(ISB)
        //Prevent scheduling of additional inspections if there is a Fee balance and make the inspection a Pending inspection
        var fireScrt158_preventSched = root.fireScrt158_preventSched = function(){
            logDebug("fireScrt158_preventSched() started.")
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    feeBalance = $utils.accela.fees.getBalance("", "", null, capId),
                    showDebug = bs.constants.debug;

                if($iTrc(feeBalance > 0, 'feeBalance > 0')){
                    cancel = true;
                    showMessage = true;
                    comment("An inspection cannot be scheduled until all fees are paid");
                }

            }catch(err){
                showMessage = true; comment("Error on custom function fireScrt158_preventSched(). Please contact system admistrator. Err: " + err);
            }
            logDebug("fireScrt158_preventSched() ended.")
        };//END fireScrt158_preventSched()

        //Script 159
        //WorkflowTaskUpdateAfter(WTUA)
        //Update the Plan Review Hours field
        var fireSctr159_updatePlanReviewHours = root.fireSctr159_updatePlanReviewHours = function (){
            logDebug("fireSctr159_updatePlanReviewHours() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    totalWfHours = 0,
                    customField2Update = 'Plan Review Hours',
                    countHours = wfHours == 0.0 ? false : true; //if wfHours is not zero, then we need to udpate the total hours, set countHours to true

                showDebug = bs.constants.debug;

                //If countHours = true
                if($iTrc(countHours, 'countHours')){
                    logDebug("Counting total workflow hours");

                    //Get all tasks, including history
                    var wfTaskResult = aa.workflow.getWorkflowHistory(capId, null);
                    var taskArray = "";
                    if ($iTrc(wfTaskResult.getSuccess(), 'getTasks()')) {
                       taskArray = wfTaskResult.getOutput();
                    } else {//if error getting tasks then return
                       aa.print("**ERROR: Failed to get workflow object: " + wfTaskResult.getErrorMessage());
                       return false;
                    }

                    for (var i in taskArray) {
                        //For each task add the hours spent to countHours
                        var currTask = taskArray[i];
                        if($iTrc($utils.accela.matchARecordType(["Fire/Bldg and Ent Plan Review/NA/NA"], appTypeString), '$utils.accela.matchARecordType(["Fire/Bldg and Ent Plan Review/NA/NA"], appTypeString)')){
                            if(currTask.taskDescription == "Review")
                                totalWfHours += parseFloat(currTask.hoursSpent);
                        }
                        else{
                            if(currTask.taskDescription == "Plan Check")
                                totalWfHours += parseFloat(currTask.hoursSpent);
                        }
                    }

                    //update Administrative Time field with total hours.
                    editAppSpecific(customField2Update, totalWfHours);
                }
            }catch(err){
                showMessage = true; comment("Error on custom function fireSctr159_updatePlanReviewHours(). Please contact system administrator. Err: " + err);
            }
            logDebug("fireSctr159_updatePlanReviewHours() ended.");
        };//END fireSctr159_updatePlanReviewHours()

        var fireScrt162_plnCheckApprovalValidation = root.fireScrt162_plnCheckApprovalValidation = function (){
            logDebug("fireScrt162_plnCheckApprovalValidation() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    doWeCancel = false,
                    cancelMessageStart = "At least one of the following Data Fields must be checked: ",
                    cancelMessage = "",
                    inside = AInfo["Inside"],
                    outside = AInfo["Outside"],
                    exBuilding = AInfo["Existing Building"],
                    newConst = AInfo["New Construction"],
                    flamLiq = AInfo["Flammable Liquids"],
                    combLiq = AInfo["Combustible Liquids"],
                    lpg = AInfo["L.P.G."],
                    gases = AInfo["Gases"],
                    cryogens = AInfo["Cryogens"],
                    other = AInfo["Other"],
                    typeOfProd = AInfo["Type of Product in Tank"];

                    if($iTrc(wfTask == "Plan Check" && wfStatus == "Approved", 'wfTask == "Plan Check" && wfStatus == "Approved"')){
                        if($iTrc(inside != "CHECKED" && outside != "CHECKED", 'inside != "CHECKED" || outside != "CHECKED"')){
                            doWeCancel = true;
                            cancelMessage += cancelMessageStart + "Inside and Outside.<br/>"
                        }

                        if($iTrc(exBuilding != "CHECKED" && newConst != "CHECKED", 'exBuilding != "CHECKED" || newConst != "CHECKED"')){
                            doWeCancel = true;
                            cancelMessage  += cancelMessageStart + "Existing Building and New Construction.<br/>"
                        }

                        if($iTrc(flamLiq != "CHECKED" && combLiq != "CHECKED" && lpg != "CHECKED" && gases != "CHECKED" && cryogens != "CHECKED" && (other == "" || other == null),
                                 'flamLiq != "CHECKED" && combLiq != "CHECKED" && lpg != "CHECKED" && gases != "CHECKED" && cryogens != "CHECKED" && (other == "" || other == null)')){
                            doWeCancel = true;
                            cancelMessage += cancelMessageStart + "Flammable Liquids, Combustible Liquids, L.P.G., Gases, and Cryogens, or Other filled.<br/>"
                        }

                        if($iTrc(typeOfProd == null || typeOfProd == "", 'typeOfProd != null && typeOfProd != ""')){
                            doWeCancel = true;
                            cancelMessage += "Type of Product in Tank cannot be blank.<br/>";
                        }

                        if(doWeCancel){
                            cancel = true;
                            showMessage = true;
                            comment(cancelMessage);
                        }
                    }
            }catch(err){
                showMessage = true; comment("Error on custom function fireScrt162_plnCheckApprovalValidation(). Please contact system adminstrator. Err: " + err);
            }
            logDebug("fireScrt162_plnCheckApprovalValidation() ended.");
        };//END fireScrt162_plnCheckApprovalValidation()

        //Script 208
        //WorkflowTaskUpdateAfter(WTUA)
        //Automatically assign and invoice fees when the workflow is updated to Plan Check/Approved
        var fireScrt208_assessWfFees = root.fireScrt208_assessWfFees = function (){
            logDebug("fireScrt208_assessWfFees() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    appGroup = appTypeArray[0],
                    appType = appTypeArray[1],
                    feeQuantity = 0,
                    feeSched = "FIRE_GENERAL",
                    invoiceFee = "Y",
                    addFireGen13 = false;

                if($iTrc(appGroup == "Fire", 'appGroup == "Fire"')){
                    if($iTrc(wfTask == "Plan Check" && wfStatus == "Approved", 'wfTask == "Plan Check" && wfStatus == "Approved"')){
                        //FIRE SPRINKLER
                        if($iTrc(appType == "Fire Sprinkler", 'appType == "Fire Sprinkler"')){
                            var plnRevHours = parseFloat(AInfo["Plan Review Hours"]);
                            var noOfHeads = parseFloat(AInfo["Number of Sprinkler Heads"]);
                            var noOfStories = parseFloat(AInfo["Number of Stories"]);
                            addFireGen13 = true;

                            if($iTrc(!isNaN(plnRevHours) && plnRevHours > 0, '!isNaN(plnRevHours) && plnRevHours > 0'))
                                addFee("FIRE_GEN_01", feeSched, 'FINAL', plnRevHours, invoiceFee);

                            if($iTrc(!isNaN(noOfHeads) && noOfHeads > 0, '!isNaN(noOfHeads) && noOfHeads > 0'))
                                addFee("FIRE_GEN_04", feeSched, 'FINAL', noOfHeads, invoiceFee);

                            if($iTrc(AInfo["Dry-pipe System"] == "CHECKED" || AInfo["Pre-action System"] == "CHECKED" || AInfo["Combined dry-pipe and Pre-action System"] == "CHECKED" ||
                               AInfo["Deluge System"] == "CHECKED" || AInfo["Foam System"] == "CHECKED",
                               'AInfo["Dry-pipe System"] || AInfo["Pre-action System"] || AInfo["Combined dry-pipe and Pre-action System"] || AInfo["Deluge System"] || AInfo["Foam System"]'))
                                addFee("FIRE_GEN_05", feeSched, 'FINAL', 1, invoiceFee);

                            if($iTrc(!isNaN(noOfStories) && (noOfStories - 3) > 0, '!isNaN(noOfStories) && (noOfStories - 3) > 0'))
                                addFee("FIRE_GEN_06", feeSched, 'FINAL', (noOfStories - 3), invoiceFee);

                            addFee("FIRE_GEN_07", feeSched, 'FINAL', 1, invoiceFee);
                        }//END FIRE SPRINKLER
                        //FIRE SVC UNDERGROUND SYSTEM
                        else if($iTrc(appType == "Fire Svc Underground System", 'appType == "Fire Svc Underground System"')){
                            var plnRevHours = parseFloat(AInfo["Plan Review Hours"]);
                            var feetOfPipe = parseFloat(AInfo["Number of Feet of Piping"]);
                            var noOfHydrants = parseFloat(AInfo["Number of Hydrants"]);
                            addFireGen13 = true;

                            if($iTrc(!isNaN(plnRevHours) && plnRevHours > 0, '!isNaN(plnRevHours) && plnRevHours > 0'))
                                addFee("FIRE_GEN_01", feeSched, 'FINAL', plnRevHours, invoiceFee);

                            if($iTrc(!isNaN(feetOfPipe) && feetOfPipe > 0, '!isNaN(feetOfPipe) && feetOfPipe > 0'))
                                addFee("FIRE_GEN_08", feeSched, 'FINAL', feetOfPipe, invoiceFee);

                            if($iTrc(!isNaN(noOfHydrants) && noOfHydrants > 0, '!isNaN(noOfHydrants) && noOfHydrants > 0'))
                                addFee("FIRE_GEN_09", feeSched, 'FINAL', noOfHydrants, invoiceFee);
                        }//END FIRE SVC UNDERGROUND SYSTEM
                        //ALARM SYSTEM
                        else if($iTrc(appType == "Alarm System", 'appType == "Alarm System"')){
                            var plnRevHours = parseFloat(AInfo["Plan Review Hours"]);
                            var noOfDevices = parseFloat(AInfo["Number of Devices"]);
                            var specFeatures = AInfo["Special Features"];
                            addFireGen13 = true;

                            if($iTrc(!isNaN(plnRevHours) && plnRevHours > 0, '!isNaN(plnRevHours) && plnRevHours > 0'))
                                addFee("FIRE_GEN_01", feeSched, 'FINAL', plnRevHours, invoiceFee);

                            if($iTrc(!isNaN(noOfDevices) && noOfDevices > 0, '!isNaN(noOfDevices) && noOfDevices > 0'))
                                addFee("FIRE_GEN_10", feeSched, 'FINAL', noOfDevices, invoiceFee);

                            if($iTrc(specFeatures != null, 'specFeatures != null'))
                                addFee("FIRE_GEN_11", feeSched, 'FINAL', 1, invoiceFee);

                        }//END ALARM SYSTEM
                        //ABOVE GROUND TANK
                        else if($iTrc(appType == "Above Ground HazMat Tank", 'appType == "Above Ground HazMat Tank"')){
                            var plnRevHours = parseFloat(AInfo["Plan Review Hours"]);
                            var noOfTanks = parseFloat(AInfo["Number of Tanks"]);
                            addFireGen13 = true;

                            if($iTrc(!isNaN(plnRevHours) && plnRevHours > 0, '!isNaN(plnRevHours) && plnRevHours > 0'))
                                addFee("FIRE_GEN_01", feeSched, 'FINAL', plnRevHours, invoiceFee);

                            if($iTrc(!isNaN(noOfTanks) && noOfTanks > 0, '!isNaN(noOfTanks) && noOfTanks > 0'))
                                addFee("FIRE_GEN_12", feeSched, 'FINAL', noOfTanks, invoiceFee);
                        }//END ABOVE GROUND TANK
                        //PHOTO LUMINESCENT PLAN REVIEW
                        else if($iTrc(appType == "Photo Luminescent Plan Review", 'appType == "Photo Luminescent Plan Review"')){
                            var plnRevHours = parseFloat(AInfo["Plan Review Hours"]);
                            addFireGen13 = true;

                            if($iTrc(!isNaN(plnRevHours) && plnRevHours > 0, '!isNaN(plnRevHours) && plnRevHours > 0'))
                                addFee("FIRE_GEN_01", feeSched, 'FINAL', plnRevHours, invoiceFee);

                        }//END PHOTO LUMINESCENT PLAN REVIEW
                        //MONITORING OR PANEL CHANGE-OUT
                        else if($iTrc(appType == "Monitoring or Panel Change-Out", 'appType == "Monitoring or Panel Change-Out"')){
                            var plnRevHours = parseFloat(AInfo["Plan Review Hours"]);
                            var permitType = AInfo["Permit Type"];
                            addFireGen13 = true;

                            if($iTrc(!isNaN(plnRevHours) && plnRevHours > 0 && permitType == "Change-Out", '!isNaN(plnRevHours) && plnRevHours > 0 && permitType == "Change-Out"'))
                                addFee("FIRE_GEN_01", feeSched, 'FINAL', plnRevHours, invoiceFee);
                        }//END MONITORING OR PANEL CHANGE-OUT
                        //SUPPRESSION SYSTEM
                        else if($iTrc(appType == "Suppression System", 'appType == "Suppression System"')){
                            var plnRevHours = parseFloat(AInfo["Plan Review Hours"]);
                            var noOfDevices = parseFloat(AInfo["Number of Devices"]);
                            addFireGen13 = true;

                            if($iTrc(!isNaN(plnRevHours) && plnRevHours > 0, '!isNaN(plnRevHours) && plnRevHours > 0'))
                                addFee("FIRE_GEN_01", feeSched, 'FINAL', plnRevHours, invoiceFee);

                            if($iTrc(!isNaN(noOfDevices) && noOfDevices > 0, '!isNaN(noOfDevices) && noOfDevices > 0'))
                                addFee("FIRE_GEN_10", feeSched, 'FINAL', noOfDevices, invoiceFee);

                            addFee("FIRE_GEN_11", feeSched, 'FINAL', 1, invoiceFee);
                        }//END SUPPRESSION SYSTEM
                    }
                    if($iTrc(wfTask == "Review" && wfStatus == "Approved", 'wfTask == "Review" && wfStatus == "Approved"')){
                        //BUILDING AND ENTITLEMENT PLAN REVIEW
                        if($iTrc(appType == "Bldg and Ent Plan Review", 'appType == "Bldg and Ent Plan Review"')){
                            var plnRevHours = parseFloat(AInfo["Plan Review Hours"]);
                            addFireGen13 = true;

                            if($iTrc(!isNaN(plnRevHours) && plnRevHours > 0, '!isNaN(plnRevHours) && plnRevHours > 0'))
                                addFee("FIRE_GEN_01", feeSched, 'FINAL', plnRevHours, invoiceFee);
                        }//END BUILDING AND ENTITLEMENT PLAN REVIEW
                    }


                    if($iTrc(addFireGen13, 'addFireGen13'))
                        addFee("FIRE_GEN_13", feeSched, 'FINAL', 1, invoiceFee);
                }
            }
            catch(err){
                showMessage = true; comment("Error on custom function fireScrt208_assessWfFees(). Please contact system administrator. Err: " + err);
            }
            logDebug("fireScrt208_assessWfFees() ended.");
        };//END fireScrt208_assessWfFees()

        //Script 160
        //PaymentReceiveAfter(PRA)
        //When the Active task is Permit Issuance and all fees are paid, update the workflow to Permit Issued.
        var fireScrt160_updatePermitIssuance = root.fireScrt160_updatePermitIssuance = function (){
            logDebug("fireScrt160_updatePermitIssuance() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    perIssTask = "Permit Issuance",
                    perIssTaskStatus = appTypeArray[1] == "Fire Sprinkler" ? "Issued" : "Issue Permit",
                    feeBalance = $utils.accela.fees.getBalance("", "", null, capId);

                if($iTrc(!isTaskStatus(perIssTask, perIssTaskStatus), 'permit is Issued')){
                    if($iTrc(feeBalance <= 0, 'feeBalance <= 0')){
                        if($iTrc(isTaskActive(perIssTask), 'isTaskActive(perIssTask)')){
                            closeTask(perIssTask, perIssTaskStatus, "Updated via script 160", "Updated via script 160");
                            //Need to add contion here from script 163, because condition is added when user manually updates to permit issued.
                            addPlanPickUpReqdCondition();
                        }
                        else{
                            activateTask(perIssTask);
                            closeTask(perIssTask, perIssTaskStatus, "Updated via script 160", "Updated via script 160");
                            //Need to add contion here from script 163, because condition is added when user manually updates to permit issued.
                            addPlanPickUpReqdCondition();
                        }
                        
                        
                        //bs.utils.accela.reports.popup('Certificate Of Completion', { module: 'Building', parameters: { ID: capId.getCustomID() } });
                    }
                }
            }
            catch(err){
                showMessge = true; comment("Error on custom function fireScrt160_updatePermitIssuance(). Please contact system administrator. Err: " + err);
            }
            logDebug("fireScrt160_updatePermitIssuance() ended.");
        };//END fireScrt160_updatePermitIssuance()

        //Script 205
        //ApplicationSubmitAfter(ASA)
        //Assess application fees.
        var fireScrt205_assessAppFees = root.fireScrt205_assessAppFees = function (){
            logDebug("fireScrt205_assessAppFees() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    appGroup = appTypeArray[0],
                    appType = appTypeArray[1],
                    feeSched = "FIRE_GENERAL",
                    invoiceFee = "Y";

                    if($iTrc(appGroup == "Fire", 'appGroup == "Fire"')){
                        if($iTrc(appType == "5 Year Permit", 'appType == "5 Year Permit"')){
                            var fireDptConns = parseFloat(AInfo["Fire Department Connections"]);
                            var risers = parseFloat(AInfo["Risers"]);
                            var firePumpTest = parseFloat(AInfo["Fire Pump Test"]);
                            var standPipe = parseFloat(AInfo["Standpipe"]);
                            var dryPipeVal = parseFloat(AInfo["Drypipe Valve Trip Test"]);

                            //If in ACA, we run update fee in case user goes back and changes quantities.
                            if($iTrc(publicUser, 'publicUser')){
                                if($iTrc(!isNaN(fireDptConns) && fireDptConns > 0, '!isNaN(fireDptConns) && fireDptConns > 0'))
                                    updateFee("FIRE_GEN_15", feeSched, 'FINAL', fireDptConns, invoiceFee);

                                if($iTrc(!isNaN(risers) && risers > 0, '!isNaN(risers) && risers > 0'))
                                    updateFee("FIRE_GEN_16", feeSched, 'FINAL', risers, invoiceFee);

                                if($iTrc(!isNaN(firePumpTest) && firePumpTest > 0, '!isNaN(firePumpTest) && firePumpTest > 0'))
                                    updateFee("FIRE_GEN_17", feeSched, 'FINAL', firePumpTest, invoiceFee);

                                if($iTrc(!isNaN(standPipe) && standPipe > 0, '!isNaN(standPipe) && standPipe > 0'))
                                    updateFee("FIRE_GEN_18", feeSched, 'FINAL', standPipe, invoiceFee);

                                if($iTrc(!isNaN(dryPipeVal) && dryPipeVal > 0, '!isNaN(dryPipeVal) && dryPipeVal > 0'))
                                    updateFee("FIRE_GEN_19", feeSched, 'FINAL', dryPipeVal, invoiceFee);
                            }
                            else{//In AA we use AddFee
                                if($iTrc(!isNaN(fireDptConns) && fireDptConns > 0, '!isNaN(fireDptConns) && fireDptConns > 0'))
                                    addFee("FIRE_GEN_15", feeSched, 'FINAL', fireDptConns, invoiceFee);

                                if($iTrc(!isNaN(risers) && risers > 0, '!isNaN(risers) && risers > 0'))
                                    addFee("FIRE_GEN_16", feeSched, 'FINAL', risers, invoiceFee);

                                if($iTrc(!isNaN(firePumpTest) && firePumpTest > 0, '!isNaN(firePumpTest) && firePumpTest > 0'))
                                    addFee("FIRE_GEN_17", feeSched, 'FINAL', firePumpTest, invoiceFee);

                                if($iTrc(!isNaN(standPipe) && standPipe > 0, '!isNaN(standPipe) && standPipe > 0'))
                                    addFee("FIRE_GEN_18", feeSched, 'FINAL', standPipe, invoiceFee);

                                if($iTrc(!isNaN(dryPipeVal) && dryPipeVal > 0, '!isNaN(dryPipeVal) && dryPipeVal > 0'))
                                    addFee("FIRE_GEN_19", feeSched, 'FINAL', dryPipeVal, invoiceFee);
                            }
                        }
                        else if($iTrc(appType == "Fire Sprinkler", 'appType == "Fire Sprinkler"')){
                            var twentyOrLessHeads = AInfo["Are there 20 sprinkler heads or less?"];

                            //ACA: in case user in ACA changes the field, we need to update to zero.
                            if($iTrc(publicUser, 'publicUser')){
                                if($iTrc(twentyOrLessHeads == "Yes", 'twentyOrLessHeads == "Yes"')){
                                    updateFee("FIRE_GEN_04", feeSched, 'FINAL', 1, invoiceFee);
                                    updateFee("FIRE_GEN_13", feeSched, 'FINAL', 1, invoiceFee);
                                }
                                else{
                                    if($iTrc(feeExists("FIRE_GEN_04"), 'feeExists("FIRE_GEN_04")')) updateFee("FIRE_GEN_04", feeSched, 'FINAL', 0, invoiceFee);
                                    if($iTrc(feeExists("FIRE_GEN_13"), 'feeExists("FIRE_GEN_13")')) updateFee("FIRE_GEN_13", feeSched, 'FINAL', 0, invoiceFee);
                                }
                            }//else in AA we just add the fee.
                            else{
                                if($iTrc(twentyOrLessHeads == "Yes", 'twentyOrLessHeads == "Yes"')){
                                    addFee("FIRE_GEN_04", feeSched, 'FINAL', 1, invoiceFee);
                                    addFee("FIRE_GEN_13", feeSched, 'FINAL', 1, invoiceFee);
                                }
                            }
                        }
                        else if($iTrc(appType == "Monitoring or Panel Change-Out", 'appType == "Monitoring or Panel Change-Out"')){
                            var permitType = AInfo["Permit Type"];

                            //If in ACA
                            if($iTrc(publicUser, 'publicUser')){
                                //Permit Type is monitoring we add fees
                                if($iTrc(permitType == "Monitoring", 'permitType == "Monitoring"')){
                                    updateFee("FIRE_GEN_13", feeSched, 'FINAL', 1, invoiceFee);
                                    updateFee("FIRE_GEN_23", feeSched, 'FINAL', 1, invoiceFee);
                                }//else if not monitoring and
                                else{
                                    if($iTrc(feeExists("FIRE_GEN_13"), 'feeExists("FIRE_GEN_13")')) updateFee("FIRE_GEN_13", feeSched, 'FINAL', 0, invoiceFee);
                                    if($iTrc(feeExists("FIRE_GEN_23"), 'feeExists("FIRE_GEN_23")')) updateFee("FIRE_GEN_23", feeSched, 'FINAL', 0, invoiceFee);
                                }
                            }
                            else
                                if($iTrc(permitType == "Monitoring", 'permitType == "Monitoring"')){
                                    addFee("FIRE_GEN_13", feeSched, 'FINAL', 1, invoiceFee);
                                    addFee("FIRE_GEN_23", feeSched, 'FINAL', 1, invoiceFee);
                                }
                        }
                    }
            }
            catch(err){
                showMessage = true; comment("Error on custom function fireScrt205_assessAppFees(). Please contact system administrator. Err: " + err);
            }
            logDebug("fireScrt205_assessAppFees() ended.");
        };//END fireScrt205_assessAppFees()

        //Script 163
        //WorkflowTaskUpdateAfter(WTUA)
        //When the record status is updated to Issued, and the workflow history has a task/status of Plan Check/Approved add a Hold Condition to the permit record
        var fireScrt163_issuedAddHoldCond = root.fireScrt163_issuedAddHoldCond = function (){
            logDebug("fireScrt163_issuedAddHoldCond() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    planCheckApproved = $utils.accela.workflow.getStatusHistoryCount(capId, "Plan Check", "Approved"),
                    conditionGroup = "Fire",
                    conditionType = "Plan Pickup Required",
                    conditionName = "Permit Issued, Pending Plan Pickup",
                    conditionComment = "Plans to be picked up prior to proceeding with permit activity",
                    //dispConditionComment = "Plans to be picked up prior to proceeding with permit activity",
                    //resConditionComment = "Plans to be picked up prior to proceeding with permit activity",
                    impactCode = "Hold",
                    condStatus = "Applied",
                    auditStatus = "A",
                    displayNotice = "Y";

                if($iTrc(wfTask == "Permit Issuance" && matches(wfStatus, "Issue Permit", "Issued"), 'wfTask == "Permit Issuance" && matches(wfStatus, "Issue Permit", "Issued")')){
                    if($iTrc(planCheckApproved > 0, 'planCheckApproved > 0')){
                        var adminUserID = "ADMIN";
                        var adminUserObj = aa.person.getUser(adminUserID).getOutput();

                        //Create new empty cap condition model and set the expected values.
                        var newCondModel = aa.capCondition.getNewConditionScriptModel().getOutput();
                        newCondModel.setCapID(capId);
                        newCondModel.setConditionGroup(conditionGroup);
                        newCondModel.setConditionType(conditionType);
                        newCondModel.setConditionDescription(conditionName);
                        newCondModel.setConditionComment(conditionComment);
                        newCondModel.setConditionStatus(condStatus);
                        newCondModel.setEffectDate(sysDate);
                        newCondModel.setIssuedDate(sysDate);
                        newCondModel.setIssuedByUser(adminUserObj);
                        newCondModel.setStatusByUser(adminUserObj);
                        newCondModel.setAuditID(adminUserID);
                        newCondModel.setAuditStatus(auditStatus);
                        newCondModel.setDisplayConditionNotice(displayNotice);
                        newCondModel.setImpactCode(impactCode);

                        aa.capCondition.createCapCondition(newCondModel);
                    }
                }

            }
            catch(err){
                showMessage = true; comment("Error on custom function fireScrt163_issuedAddHoldCond(). Please contact administrator. Err: " + err);
            }
            logDebug("fireScrt163_issuedAddHoldCond() ended.");
        };//END fireScrt163_issuedAddHoldCond()

        //Script 105
        //ApplicationSubmitAfter(ASA)
        //Set the Application Expiration Date custom field
        var bldScrt105_updateExpDateASA = root.bldScrt105_updateExpDateASA = function (){
            logDebug("bldScrt105_updateExpDateASA() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    field2Update = "Application Expiration Date"
                    ;

                    editAppSpecific(field2Update, dateAdd(null, 180));

            }
            catch(err){
                showMessage = true; comment("Error on custom function bldScrt105_updateExpDateASA(). Please contact system administrator. Err: " + err);
            }
            logDebug("bldScrt105_updateExpDateASA() ended.");
        };//END bldScrt105_updateExpDateASA()

        //Script 105
        //WorkflowTaskUpdateAfter(WTUA)
        //Set the Application Expiration Date custom field
        var bldScrt105_updateExpDateWTUA = root.bldScrt105_updateExpDateWTUA = function (){
            logDebug("bldScrt105_updateExpDateWTUA() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    field2Update = "Application Expiration Date",
                    appGroup = appTypeArray[0],
                    appType = appTypeArray[1]
                    ;

                    if($iTrc(wfTask == "Application Submittal" && matches(wfStatus, "Add'l Info Requested", "Additional Info Requested"), "wfTask == 'Application Submittal' && matches(wfStatus, Add'l Info Requested, Additional Info Requested)"))
                        editAppSpecific(field2Update, dateAdd(wfDateMMDDYYYY, 180));

                    if($iTrc(wfTask == "Plans Coordination" && matches(wfStatus, "Ready to Use", "Plans Approved"), 'wfTask == "Plans Coordination" && matches(wfStatus, "Ready to Use", "Plans Approved")'))
                        editAppSpecific(field2Update, dateAdd(wfDateMMDDYYYY, 180));

                    if($iTrc(appGroup == "Building" && appType == "Residential" && wfTask == "Plans Coordination" && wfStatus == "Approved", 'appGroup == "Building" && appType == "Residential" && wfTask == "Plans Coordination" && wfStatus == "Approved"'))
                        editAppSpecific(field2Update, dateAdd(wfDateMMDDYYYY, 180));
            }
            catch(err){
                showMessage = true; comment("Error on custom function bldScrt105_updateExpDateWTUA(). Please contact system administrator. Err: " + err);
            }
            logDebug("bldScrt105_updateExpDateWTUA() ended.");
        };//END bldScrt105_updateExpDateWTUA()

        //Script 112
        //FeeAssessBefore(FAB)
        //When the Change of Occupancy Fee is added, assign the fee amount based on if there is information in the Inner City field from the Address GIS fields
        var bldScrt112_setChangeOfOccupFeeAmt = root.bldScrt112_setChangeOfOccupFeeAmt = function (){
            logDebug("bldScrt112_setChangeOfOccupFeeAmt() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    addrAttr = new Array(),
                    innerCity = null,
                    feeItem = "BLD_M_INS_16",
                    feeSched = "BLD_MISC_INSP",
                    feeAmt = 0
                    ;

                loadAddressAttributes(addrAttr);
                innerCity = addrAttr["AddressAttribute.INNER_CITY"];

                if($iTrc(FeeItemsList.contains(feeItem), 'FeeItemsList.contains("BLD_M_INS_16")')){
                    if($iTrc(innerCity == " " || innerCity == null || innerCity == "", 'innerCity == " " || innerCity == null || innerCity == ""'))
                        feeAmt = 654.12;
                    else
                        feeAmt = 400;

                    updateFee(feeItem, feeSched, "FINAL", feeAmt, "Y");
                }
            }
            catch(err){
                showMessage = true; comment("Error on custom function bldScrt112_setChangeOfOccupFeeAmt(). Please contact administrator. Err: " + err);
            }
            logDebug("bldScrt112_setChangeOfOccupFeeAmt() ended.");
        };//END bldScrt112_setChangeOfOccupFeeAmt()

        //Script 109
        //ApplicationSubmitAfter(ASA)
        //If data exists in the Pre-Inspection Record Number custom field, the system will check for a matching record number, and if found, will relate the two records
        var bldScrt109_linkPreInspRecord = root.bldScrt109_linkPreInspRecord = function (){
            logDebug("bldScrt109_linkPreInspRecord() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    altId = capId.getCustomID(),
                    preInspNum = AInfo["Pre-Inspection Number"];
                    ;

                if($iTrc(preInspNum != null && preInspNum != "" && preInspNum != undefined, 'preInspNum != null && preInspNum != "" && preInspNum != undefined')){
                    var preInspCapIdResult = aa.cap.getCapID(preInspNum);

                    if($iTrc(preInspCapIdResult.getSuccess(), 'preInspCapIdResult.getSuccess()')){
                        var preInspCapId = preInspCapIdResult.getOutput();
                        var preInspCap = aa.cap.getCap(preInspCapId).getOutput();
                        var preInspTypeString = preInspCap.getCapType().toString();
                        var preInspAInfo = new Array();
                        loadAppSpecific(preInspAInfo, preInspCapId);

                        if($iTrc(preInspTypeString == "Building/Miscellaneous Inspection/NA/NA" && preInspAInfo["Inspection Type"] == "Pre-Inspection",
                                 'preInspTypeString == "Building/Miscellaneous Inspection/NA/NA" && preInspAInfo["Inspection Type"] == "Pre-Inspection"')){
                            var linkResult = aa.cap.createAppHierarchy(capId, preInspCapId);
                            if ($iTrc(linkResult.getSuccess(), 'linkResult.getSuccess()'))
                                logDebug("Successfully linked " + preInspNum + " as child to Parent Application : " + altId);
                            else
                                logDebug( "**ERROR: linking to parent application parent cap id (" + altId + "): " + linkResult.getErrorMessage());
                        }
                    }
                    else
                        logDebug("WARNING: The Pre-Inspection Number, " + preInspNum + ", does not exist in the sytem.");
                }
            }
            catch(err){
                showMessage = true; comment("Error on custom function bldScrt109_linkPreInspRecord(). Please contact system administrator. Err: " + err);
            }
            logDebug("bldScrt109_linkPreInspRecord() ended.");
        };//END bldScrt109_linkPreInspRecord()

        //Script 116
        //InspectionResultSubmitAfter(IRSA)
        //When the inspection type of B Final (Building) Inspection is resulted as Passed, workflow status will be updated to Inspection/Final Inspection Complete
        var bldScrt116_updateInspWfTask = root.bldScrt116_updateInspWfTask = function(){
            logDebug("bldScrt116_updateInspWfTask() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug;

                if($iTrc(inspType == "B FINAL (BUILDING)" && inspResult == "Passed", 'inspType == "B FINAL (BUILDING)" && inspResult == "Passed"')){
                    if($iTrc(isTaskActive("Inspection"), 'isTaskActive("Inspection")')){
                        closeTask("Inspection", "Final Inspection Complete", "Updated via script 116.", "Updated via script 116.");
                    }
                    else{
                        activateTask("Inspection");
                        closeTask("Inspection", "Final Inspection Complete", "Updated via script 116.", "Updated via script 116.");
                    }
                }
            }
            catch(err){
                showMessage = true; comment("Error on custom function bldScrt116_updateInspWfTask(). Please contact system administrator. Err: " + err);
            }
            logDebug("bldScrt116_updateInspWfTask() ended.");
        };//END bldScrt116_updateInspWfTask();

        //Script 117
        //InspectionResultSubmitAfter(IRSA)
        //When result = Amendment Required, update workflow Inspection/Amended. Update comments from insp comments. Assign task to record user.
        var bldScrt117_updateInspAmendWfTask = root.bldScrt117_updateInspAmendWfTask = function (){
            logDebug("bldScrt117_updateInspAmendWfTask() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    assignedCapUser = null,
                    permitIssTask = "Permit Issuance",
                    thisInspComment = inspObj.getInspection().getResultComment();

                if($iTrc(inspResult == "Amendment Required", 'inspResult == "Amendment Required"')){
                    if($iTrc(isTaskActive("Inspection"), 'isTaskActive("Inspection")')){
                        closeTask("Inspection", "Amended", thisInspComment, thisInspComment);
                    }
                    else{
                        activateTask("Inspection");
                        closeTask("Inspection", "Amended", thisInspComment, thisInspComment);
                    }

                    assignedCapUser = getAssignedCapUser();

                    if($iTrc(assignedCapUser && assignedCapUser != "" && assignedCapUser != null && assignedCapUser != undefined,
                             'assignedCapUser && assignedCapUser != "" && assignedCapUser != null && assignedCapUser != undefined')){
                        if($iTrc(isTaskActive(permitIssTask), 'isTaskActive("' + permitIssTask + '")'))
                            assignTask(permitIssTask, assignedCapUser);
                        else{
                            activateTask(permitIssTask);
                            assignTask(permitIssTask, assignedCapUser);
                        }
                    }
                }
            }
            catch(err){
                showMessage = true; comment("Error on custom function bldScrt117_updateInspAmendWfTask(). Please contact system administrator. Err: " + err);
            }
            logDebug("bldScrt117_updateInspAmendWfTask() ended.");
        };//END bldScrt117_updateInspAmendWfTask()

        //Script 365
        //ApplicationSubmitAfter(ASA)
        //Automatically create the Initial Inspection on the day the Enforcement record is initiated
        var enfScrt365_createInitialInsp = root.enfScrt365_createInitialInsp = function (){
            logDebug("enfScrt365_createInitialInsp() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    showDebug = bs.constants.debug,
                    inspectionType = "Initial Inspection",
                    env = aa.env.getValue("From"),
                    assignedUser = getAssignedCapUser()
                    ;

                //if a user was assigned to the record then assign the inspection to this user
                if($iTrc(assignedUser != null, 'assignedUser != null')){
                    scheduleInspection(inspectionType, 0, assignedUser);
                }
                else//else don't assign it
                    scheduleInspection(inspectionType, 0);
            }
            catch(err){
                showMessage = true; comment("Error on custom function enfScrt365_createInitialInsp(). Please contact system administrator. Err: " + err);
            }
            logDebug("enfScrt365_createInitialInsp() ended.");
        };//END enfScrt365_createInitialInsp()

        //Script 98
        //ApplicationSubmitAfter(ASA)
        //Open enforcement records with same address
        var bldScrt98_openEnfRecsWithSameAddress = root.bldScrt98_openEnfRecsWithSameAddress = function(){
            logDebug("bldScrt98_openEnfRecsWithSameAddress() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    conditionGroup = "Building",
                    conditionType = "Enforcement Record Open",
                    conditionName = "",
                    conditionComment = "",
                    //dispConditionComment = "",
                    //resConditionComment = "",
                    impactCode = "Notice",
                    condStatus = "Applied",
                    auditStatus = "A",
                    displayNotice = "Y",
                    sameAddrAltId = "",
                    sameAddrCapId = "",
                    capIdsArray = capIdsGetByAddr(),
                    enfOpenRecsAltIds = new Array(),
                    enfOpenRecsCapIds = new Array()
                    ;

                showDebug = bs.constants.debug;

                //For each record with same address
                for(eachCapId in capIdsArray){
                    sameAddrCapId = capIdsArray[eachCapId];
                    sameAddrAltId = capIdsArray[eachCapId].getCustomID();

                    var sameAddrCap = aa.cap.getCap(sameAddrCapId).getOutput();
                    var sameAddrAppTypeString = sameAddrCap.getCapType().toString();
                    var sameAddrAppTypeArray = sameAddrAppTypeString.split("/");
                    var sameAddrAppType = sameAddrAppTypeArray[0];

                    //if application type is of Enforcement
                    if($iTrc(sameAddrAppType == "Enforcement", 'sameAddrAppType == "Enforcement"')){
                        //check if any workflow tasks are active
                        if(activeTasksCheckByCapId(sameAddrCapId)){
                            //push the record id in an array to use later in the code
                            enfOpenRecsAltIds.push(sameAddrAltId);
                            enfOpenRecsAltIds.push(sameAddrCapId);
                            
                        }
                    }
                }

                if($iTrc(enfOpenRecsAltIds.length > 0, 'enfOpenRecsAltIds.length > 0')){
                    //If there is only one open record then we use 'record' and 'is'
                    if($iTrc(enfOpenRecsAltIds.length == 1, 'enfOpenRecsAltIds.length == 1')){
                        conditionName = "Record " + enfOpenRecsAltIds;
                        conditionComment = "The following record " + enfOpenRecsAltIds + " is active for the address this case is associated with."
                    }

                    //else if more than one, we use 'records' and 'are'
                    if($iTrc(enfOpenRecsAltIds.length > 1, 'enfOpenRecsAltIds.length > 1')){
                        if(conditionName == "")
                            conditionName = "Records " + enfOpenRecsAltIds[0] + "," + enfOpenRecsAltIds[1] + ",...";

                        conditionComment += "The following records " + enfOpenRecsAltIds + " are active for the address this case is associated with.  ";
                    }

                    var adminUserID = "ADMIN";
                    var adminUserObj = aa.person.getUser(adminUserID).getOutput();
                    
                    //Create new empty cap condition model and set the expected values.
                    var newCondModel = aa.capCondition.getNewConditionScriptModel().getOutput();
                    newCondModel.setCapID(capId);
                    newCondModel.setConditionGroup(conditionGroup);
                    newCondModel.setConditionType(conditionType);
                    newCondModel.setConditionDescription(conditionName);
                    newCondModel.setConditionComment(conditionComment);
                    newCondModel.setConditionStatus(condStatus);
                    newCondModel.setEffectDate(sysDate);
                    newCondModel.setIssuedDate(sysDate);
                    newCondModel.setIssuedByUser(adminUserObj);
                    newCondModel.setStatusByUser(adminUserObj);
                    newCondModel.setAuditID(adminUserID);
                    newCondModel.setAuditStatus(auditStatus);
                    newCondModel.setDisplayConditionNotice(displayNotice);
                    newCondModel.setImpactCode(impactCode);

                    aa.capCondition.createCapCondition(newCondModel);

                    //link each record as parent of the enforcement record.
                    for(eachCapId in enfOpenRecsCapIds) addParent(enfOpenRecsCapIds[eachCapId]);
                }

            }catch(err){
                showMessage = true;comment("Error on bldScrt98_openEnfRecsWithSameAddress(). Please contact system administrator. Err: " + err);
            }
            logDebug("bldScrt98_openEnfRecsWithSameAddress() ended.");
        };//END bldScrt98_openEnfRecsWithSameAddress()
        
        //Script 206
        //ApplicationSubmitBefore(ASB)
        //If a record is initiated for a district outside of the Fresno jurisdiction, prevent the application from saving
        var fireScrt206_checkFireDistrict = root.fireScrt206_checkFireDistrict = function (){
            logDebug("fireScrt206_checkFireDistrict() started.");
            try{
                var $iTrc = bs.utils.debug.ifTracer,
                    $utils = bs.utils,
                    addrAttrs = new Array(),
                    showDebug = bs.constants.debug,
                    fireDist = getGISInfo("FRESNO", "Addresses", "FIRE_DISTRICT");;

                //loadAddressAttributes(addrAttrs);
                //fireDist = addrAttrs["AddressAttribute.FIRE DISTRICT"];
                
                if($iTrc(fireDist && !matches(fireDist.toUpperCase(), "FIG GARDEN","NORTH CENTRAL","STATION 15 CONTRACT AREA","CITY OF FRESNO"),
                         'fireDist && !matches(fireDist.toUpperCase(), "FIG GARDEN","NORTH CENTRAL","STATION 15 CONTRACT AREA","CITY OF FRESNO")')){
                    cancel = true;
                    showMessage = true;
                    comment("The address selected for this permit is outside of the Fresno Fire Department's jurisdiction.");
                }
                    
            }catch(err){
                showMessage = true;comment("Error on fireScrt206_checkFireDistrict(). Please contact system administrator. Err: " + err);
            }
            logDebug("fireScrt206_checkFireDistrict() ended.");
        };//END fireScrt206_checkFireDistrict()

    }).call(emse);

    var utils = root.utils = {};
    (function () {
        var root = this;

        var accela = root.accela = {};
        (function () {
            var root = this;

            //needs enhancments to new way - probalbly just delete it
            var loadAccelaGlobals = root.loadAccelaGlobals = function (capID) {
                var capIdArr = String(capID).split("-");
                aa.env.setValue("PermitId1", capIdArr[0]);
                aa.env.setValue("PermitId2", capIdArr[1]);
                aa.env.setValue("PermitId3", capIdArr[2]);
                with (scriptRoot) {
                    eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
                }

                function getScriptText(vScriptName) {
                    vScriptName = vScriptName.toUpperCase();
                    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
                    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
                    return emseScript.getScriptText() + "";
                }

            }

            var displayEnvVariables = root.displayEnvVariables = function () {
                var params = aa.env.getParamValues(),
                    keys = params.keys(),
                    key = null;

                while (keys.hasMoreElements()) {
                    key = keys.nextElement();
                    logDebug(key + " = " + aa.env.getValue(key));
                }

            }

            var getStdChoiceVals = root.getStdChoiceVals = function (strControlName, options) {
                var arrChoices = [],
                    bizDomScriptArray,
                    bizDomScriptResult = aa.bizDomain.getBizDomain(strControlName);

                var settings = {    //default settings (for backwards compatibility)
                    rtnVal: true,
                    rtnDesc: false,
                };
                for (var attr in options) { settings[attr] = options[attr]; }


                if (bizDomScriptResult.getSuccess()) {
                    bizDomScriptArray = bizDomScriptResult.getOutput().toArray();
                    for (var i in bizDomScriptArray) {
                        if (settings.rtnVal && !settings.rtnDesc) { //val only
                            arrChoices.push(bizDomScriptArray[i].getBizdomainValue().toString());
                        } else if (!settings.rtnVal && settings.rtnDesc) {  // desc omnly
                            arrChoices.push(bizDomScriptArray[i].getDescription().toString());
                        } else { //both val & desc
                            arrChoices.push({ val: bizDomScriptArray[i].getBizdomainValue().toString(), desc: bizDomScriptArray[i].getDescription().toString() });
                        }
                    }
                }
                return arrChoices;
            }

            var parseDocumentModelArray = root.parseDocumentModelArray = function (documentModelArray) {
                var idxStart = 0,
                    idxEnd = 0,
                    scratch,
                    docs = [];

                idxStart = documentModelArray.indexOf("documentNo=", idxStart);
                idxEnd = documentModelArray.indexOf(",,", idxStart < 0 ? 0 : idxStart);
                while (idxStart > -1 && idxEnd > -1) {
                    if(idxEnd == -1) {
                        scratch = documentModelArray.substring(idxStart);
                    } else {
                        scratch = documentModelArray.substring(idxStart, idxEnd);
                    }
                    docs.push(convertScratchToObject());
                    idxStart = documentModelArray.indexOf("documentNo=", idxStart+1);
                    idxEnd = documentModelArray.indexOf("documentNo=", idxStart < 0 ? 0 : idxStart);
                }

                function convertScratchToObject() {
                    var i;

                    i = scratch.indexOf('documentNo=' + 11);
                    var documentNo = scratch.substring(i, scratch.indexOf(',', i));
                    return { documentNo: documentNo };
                }

            }

            /**
             * Looks for record type (case insensitive/wildcards) match against an array of possiblities - (group/type/subtype/category)
             * Used primarily in event;~!~!~!~.js files to determine if valTypeString matches one of the appTypeStringArray items
             * @param {String Array} appTypeStringArray
             * @param {String} valTypeString
             * @return {Bool} true - matched one appTypeString
             */
            var matchARecordType = root.matchARecordType = function (appTypeStringArray, valTypeString) {
                // matchARecordType('[Licenses/Contractor/Contractor/Renewal'], 'licences/*/*/renewal')  would return true
                var appTypeArray,
                    valTypeArray = valTypeString.split("/"),
                    idx,
                    key;

                if (valTypeArray.length != 4) { return false; } //invalid
                for (idx in appTypeStringArray) {
                    appTypeArray = appTypeStringArray[idx].split('/');
                    if (appTypeArray.length != 4) { break; } //invalid

                    for (key in appTypeArray) {
                        if (appTypeArray[key].toUpperCase() != valTypeArray[key].toUpperCase() && appTypeArray[key] != '*') {
                            break;
                        } else if (key == appTypeArray.length-1) {
                            return true; //its a match (all 4 elements)
                        }
                    }
                }
                return false;
            }

            /* get custom fields for a contact */
            var getContactASI = root.getContactASI = function (conType, conASI) {
                var fieldValue = null;
                var conAppCon = getContactByType4ACA(conType);
                if (conAppCon) {
                    var genTemplateObj = conAppCon.getTemplate();
                    if (genTemplateObj) {
                        var formsResult = genTemplateObj.getTemplateForms().toArray();
                        if (formsResult) {
                            var asiResult = formsResult[0];
                            var subGroups = asiResult.getSubgroups();
                            for (var i = 0; i < subGroups.size() ; i++) {
                                var subGroup = subGroups.get(i);
                                var asiFields = subGroup.getFields();
                                for (var fieldIndex = 0; fieldIndex < asiFields.size() ; fieldIndex++) {
                                    var field = asiFields.get(fieldIndex);
                                    if (field.getFieldName() == conASI) {
                                        fieldValue = field.defaultValue;
                                    }

                                }
                            }
                        }
                    }
                }

                return fieldValue;
            }

            /* assign a department to a record. */
            var assignCap2Dept = root.assignCap2Dept = function (strDeptName){
                var itemCap = capId
                if (arguments.length > 1)
                    itemCap = arguments[1]; // use cap ID specified in args
                var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
                if (!cdScriptObjResult.getSuccess()) {
                    logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
                    return false;
                }
                var cdScriptObj = cdScriptObjResult.getOutput();
                if (!cdScriptObj) {
                    logDebug("**ERROR: No cap detail script object");
                    return false;
                }
                cd = cdScriptObj.getCapDetailModel();
                dpt = getDeptFromDeptName(strDeptName);
                if (!dpt) {
                    logDebug("**ERROR retrieving department model for " + strDeptName);
                    return false;
                }

                cd.setAsgnDept(dpt);
                cdWrite = aa.cap.editCapDetail(cd)
                if (cdWrite.getSuccess()) {
                    logDebug("Assigned CAP to department " + strDeptName)
                } else {
                    logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage());
                    return false;
                }
            }

            /* get department model string from the department name
             * e.g. 'Code Enf Area 2' returns 'FRESNO/CODE/AREA2/NA/NA/NA/NA'
             */
            var getDeptFromDeptName = root.getDeptFromDeptName = function(strDeptName){
                var dpts = aa.people.getDepartmentList(null).getOutput();
                for(var thisDpt in dpts){
                    var currDpt = dpts[thisDpt];
                    var currDptName = currDpt.getDeptName();

                    if(strDeptName.equals(currDptName)) return currDpt.deptKey;

                }

                return null;
            }

            var aca = root.aca = {};
            (function () {
                var root = this;

                /**
                 * Get docs associated to temp aca record (before ASA event) - NOT for use on regular record
                 * getDocumentList(capId,"","") ---> returns all attachments associated within temp cap
                 * getDocumentList(capId,"Fires","") ---> returns all attacments associated within temp cap that are in specified group
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @group {string} optional (for filtering)
                 * @category {string} optional (for filtering)
                 * @return {array of aa.ads.ads.DocumentModel}
                 */
                var getDocumentList = root.getDocumentList = function (capId, group, category) {
                    var idx,
                        docList = [],          //aa.ads.ads.DocumentModel
                        docFilteredList = [];  //aa.ads.ads.DocumentModel

                    docListResult = aa.document.getDocumentListByEntity(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3(), "TMP_CAP");
                    if (docListResult.getSuccess()) {
                        docList = docListResult.getOutput().toArray();
                    }
                    if (!group && !category) { return docList; } //non-filtered

                    docFilteredList = docList.filter(function (itm, idx) {
                        return (itm.docGroup == group) && (itm.docCategory == category);
                    });
                    return docFilteredList;
                };

            }).call(aca);

            var asi = root.asi = {};
            (function () {
                var root = this;

            }).call(asi);

            var attachments = root.attachments = {};
            (function () {
                var root = this;

                // var getDocumentList = root.getDocumentList = function (capId, userID, group, category) {
                //    var idx,
                //        docList = [],          //aa.ads.ads.DocumentModel
                //        docFilteredList = [];  //aa.ads.ads.DocumentModel

                //    docListResult = aa.document.getCapDocumentList(capId, userID);
                //    if (docListResult.getSuccess()) {
                //        docList = docListResult.getOutput().toArray();
                //    }
                //    if (!group && !category) { return docList; } //non-filtered
                //    docFilteredList = docList.filter(function (itm, idx) {
                //        return (itm.docGroup == group || !group) && (itm.docCategory == category || !category);
                //    });
                //    return docFilteredList;



                //     docs = aa.document.getDocumentListByEntity(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3(), "TMP_CAP").getOutput().toArray();
                //     docsFiltered = docs.filter(function (itm, idx) {
                //         return (itm.docGroup == docGrp || !docGrp) && (itm.docCategory == docCat || !docCat);
                //     });
                //}

            }).call(attachments);

            var cap = root.cap = {};
            (function () {
                var root = this;

                /**
                 *  Returns aa.emse.dom.CapScriptModel
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return Return aa.emse.dom.CapScriptModel
                 */
                var getCap = root.getCap = function (capId) {
                    return aa.cap.getCap(capId).getOutput();
                };

                /**
                 *  Returns aa.emse.dom.CapDetailScriptModel
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return Return aa.emse.dom.CapDetailScriptModel
                 */
                var getCapDetail = root.getCapDetail = function (capId) {
                    return aa.cap.getCapDetail(capId).getOutput();
                };

            }).call(cap);

            var email = root.email = {};
            (function () {
                var root = this;

                var emailContacts = root.emailContacts = function (contactType, optionsEmail) {
                    var settings = {
                        from: bs.constants.defaultEmailSender,
                        subj: '',
                        body: '',
                        files: []
                    };

                    for (var attr in optionsEmail) { settings[attr] = optionsEmail[attr]; }

                    var emailAddr,
                        arrFiles = [],
                        emailResult,
                        capContactResult = aa.people.getCapContactByCapID(capId);

                    if (capContactResult.getSuccess()) {
                        var Contacts = capContactResult.getOutput();
                        for (yy in Contacts) {
                            if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()) || contactType.length == 0) {
                                emailAddr = Contacts[yy].getEmail();
                                if (emailAddr != null) {
                                    if (settings.files.length === 0) {
                                        emailResult = aa.sendMail(settings.from, bs.constants.emailEmailRedirectTo.length > 0 ? bs.constants.emailEmailRedirectTo : emailAddr, "", settings.subj, bs.constants.emailEmailRedirectTo.length > 0 ? emailAddr + "<br /><br />" + settings.body : settings.body);
                                    } else {
                                        logDebug("utils.email.emailContacts(): Sending email with attachments.");
                                        emailResult = aa.sendEmailWithAttachedFiles(settings.from, bs.constants.emailEmailRedirectTo.length > 0 ? bs.constants.emailEmailRedirectTo : emailAddr, null, settings.subj, bs.constants.emailEmailRedirectTo.length > 0 ? emailAddr + "<br /><br />" + settings.body : settings.body, settings.files);
                                    }
                                    logDebug(emailResult.getSuccess() ? "Email sent to " + emailAddr + "." : "System failed send report to " + emailAddr + " because mail server is broken or report file size is great than 5M.")
                                }
                            }
                        }
                    }

                };

                var emailLicensedPros = root.emailLicensedPros = function (capID, optionsEmail) {
                    var settings = {
                        from: bs.constants.defaultEmailSender,
                        subj: '',
                        body: '',
                        files: []
                    };
                    for (var attr in optionsEmail) { settings[attr] = optionsEmail[attr]; }

                    var arrPros,
                        idxPro,
                        emailAddr,
                        emailResult;

                    arrPros = getLicenseProfessional(capID);

                    if (arrPros && arrPros.length > 0) {
                        for (idxPro in arrPros) {
                            emailAddr = arrPros[idxPro].getEmail();
                            if (emailAddr != null) {

                                if (settings.files.length === 0) {
                                    emailResult = aa.sendMail(settings.from, bs.constants.emailEmailRedirectTo.length > 0 ? bs.constants.emailEmailRedirectTo : emailAddr, "", settings.subj, bs.constants.emailEmailRedirectTo.length > 0 ? emailAddr + "<br /><br />" + settings.body : settings.body);
                                } else {
                                    logDebug("utils.email.emailLicensedPros():  sending email with attachments.");
                                    emailResult = aa.sendEmailWithAttachedFiles(settings.from, bs.constants.emailEmailRedirectTo.length > 0 ? bs.constants.emailEmailRedirectTo : emailAddr, null, settings.subj, settings.body, settings.files);
                                }
                                logDebug(emailResult.getSuccess() ? "A copy of this report has been sent to " + emailAddr + "." : "System failed send report to " + emailAddr + " because mail server is broken or report file size is great than 5M.")
                            }
                        }
                    }

                };

                var emailPeople = root.emailPeople = function (optionsEmail) {
                    var settings = {
                        from: bs.constants.defaultEmailSender,
                        to: [],
                        subj: '',
                        body: '',
                        files: []
                    },
                        personSettings = {};

                    for (var attr in optionsEmail) { settings[attr] = optionsEmail[attr]; }

                    //make copy of people email setting for person email settings
                    for (var attr in settings) { personSettings[attr] = settings[attr]; }

                    for (var person in optionsEmail.to) {
                        personSettings.to = optionsEmail.to;
                        emailPerson(personSettings);
                    }
                };

                var emailPerson = root.emailPerson = function (optionsEmail) {
                    var settings = {
                        from: bs.constants.defaultEmailSender,
                        to: '',
                        subj: '',
                        body: '',
                        files: []
                    };
                    for (var attr in optionsEmail) { settings[attr] = optionsEmail[attr]; }

                    var emailResult;
                    if (settings.files.length === 0) {
                        emailResult = aa.sendMail(settings.from, bs.constants.emailEmailRedirectTo.length > 0 ? bs.constants.emailEmailRedirectTo : settings.to, "", settings.subj, bs.constants.emailEmailRedirectTo.length > 0 ? settings.to + "<br /><br />" + settings.body : settings.body);
                    } else {
                        logDebug("utils.email.emailPerson(): Sending email with attachments.");
                        emailResult = aa.sendEmailWithAttachedFiles(settings.from, bs.constants.emailEmailRedirectTo.length > 0 ? bs.constants.emailEmailRedirectTo : settings.to, null, settings.subj, bs.constants.emailEmailRedirectTo.length > 0 ? settings.to + "<br /><br />" + settings.body : settings.body, settings.files);
                    }
                    logDebug(emailResult.getSuccess() ? "Email sent to " + settings.to + "." : "System failed send report to " + settings.to + " because mail server is broken or report file size is great than 5M.")
                };

            }).call(email);

            var fees = root.fees = {};
            (function () {
                var root = this;

                /**
                 * Searches payment fee items and returns the unpaid balance of a fee item - Sums fee items if more than one exists.
                 * Replaces accela global function when you need to exclude voided fees from counting
                 * getBalance("","",null, capId) ---> returns sum of all fee balances for the cap
                 * getBalance('PLN_GEN_600', null, true, capId) ---> returns sum of all invoiced fee balances in the specified schedule for the cap
                 * @feestr {string} optional (for filtering)
                 * @feeSch {string} optional (for filtering)
                 * @invoicedOnly {bool} default = true (for filtering)
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return {Number} sum of balance (fee amount - amount paid)
                 */
                var getBalance = root.getBalance = function (feestr, feeSch, invoicedOnly, capId) {
                    var amtFee = 0,
                       amtPaid = 0,
                       ff;

                    invoicedOnly = (invoicedOnly == undefined || invoicedOnly == null) ? false : invoicedOnly;

                    var feeResult = aa.fee.getFeeItems(capId, feestr, null);
                    if (feeResult.getSuccess()) {
                        var feeObjArr = feeResult.getOutput();
                    }
                    else {
                        logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
                        return 999999;
                    }

                    for (ff in feeObjArr)
                        if ((!feestr || feestr.equals(feeObjArr[ff].getFeeCod())) && (!feeSch || feeSch.equals(feeObjArr[ff].getF4FeeItemModel().getFeeSchudle()))) {
                            if (!(matches(feeObjArr[ff].feeitemStatus, "VOIDED", "CREDITED"))) {  //if fee is voided or credited - exclude
                                if (!invoicedOnly || feeObjArr[ff].feeitemStatus == "INVOICED") {
                                    amtFee += feeObjArr[ff].getFee();
                                    var pfResult = aa.finance.getPaymentFeeItems(capId, null);
                                    if (pfResult.getSuccess()) {
                                        var pfObj = pfResult.getOutput();
                                        for (ij in pfObj) {
                                            if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()) {
                                                amtPaid += pfObj[ij].getFeeAllocation()
                                            }
                                        }
                                        logDebug("feestr=" + feestr + " - " + "status=" + feeObjArr[ff].feeitemStatus + " - " + "amtFee=" + amtFee + " - " + "amtPaid=" + amtPaid);
                                    }
                                }
                                else {
                                    logDebug("feestr=" + feestr + ' ---- NOT  Invoiced');
                                }
                            }
                            else {
                                logDebug("feestr=" + feestr + ' ---- Voided/Credited');
                            }
                        }
                    return amtFee - amtPaid;
                };

                /**
                 * Searches payment fee items and returns the amount of a fee item
                 * Sums fee items if more than one exists.  Optional second parameter fee schedule
                 * getAmount("","",null, capId) ---> returns amount of all fees for the cap
                 * getAmount('PLN_GEN_600', null, true, capId) ---> returns sum of all invoiced fees in the specified schedule for the cap
                 * @feestr {string} optional (for filtering)
                 * @feeSch {string} optional (for filtering)
                 * @invoicedOnly {bool} default = true (for filtering)
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return {Number} sum of fee amount
                 */
                var getAmount = root.getAmount = function (feestr, feeSch, invoicedOnly, capId) {
                    var amtFee = 0,
                        ff;

                    invoicedOnly = invoicedOnly == undefined ? false : invoicedOnly;

                    var feeResult = aa.fee.getFeeItems(capId, feestr, null);
                    if (feeResult.getSuccess()) {
                        var feeObjArr = feeResult.getOutput();
                    }
                    else {
                        logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
                        return 999999;
                    }

                    for (ff in feeObjArr)
                        if ((!feestr || feestr.equals(feeObjArr[ff].getFeeCod())) && (!feeSch || feeSch.equals(feeObjArr[ff].getF4FeeItemModel().getFeeSchudle()))) {
                            if (!(matches(feeObjArr[ff].feeitemStatus, "VOIDED", "CREDITED"))) {  //if fee is voided or credited - exclude
                                if (!invoicedOnly || feeObjArr[ff].feeitemStatus == "INVOICED") {
                                    amtFee += feeObjArr[ff].getFee();
                                }
                                else {
                                    logDebug("feestr=" + feestr + ' ---- NOT  Invoiced');
                                }
                            }
                            else {
                                logDebug("feestr=" + feestr + ' ---- Voided/Credited');
                            }
                        }
                    return amtFee;
                };

            }).call(fees);

            var inspection = root.inspection = {};
            (function () {
                var root = this;

                /**
                 *  Returns array of aa.emse.dom.InspectionScriptModel (Not Sorted)
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return Return array of aa.emse.dom.InspectionScriptModel
                 */
                var getInspections = root.getInspections = function (capId) {
                    return aa.inspection.getInspections(capId).getOutput();
                };

                /**
                 *  Returns aa.emse.dom.InspectionScriptModel
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return Return obj of aa.emse.dom.InspectionScriptModel
                 */
                var getInspection = root.getInspection = function (capId, inspectionId) {
                    return aa.inspection.getInspection(capId, inspectionId).getOutput();
                };

                /**
                 * Returns the total of scheduled or resulted inspections.  Excludes pending
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return Return count of scheduled and resulted inspections
                 */
                 var getTotalSchedRessultedInspections = root.getTotalSchedRessultedInspections = function (itemCapId) {
                     var inspResultObj = aa.inspection.getInspections(itemCapId);
                     if (inspResultObj.getSuccess()) {
                         inspList = inspResultObj.getOutput();
                         var j = 0;
                         for (i in inspList) {
                             if (!inspList[i].getInspectionStatus().equals("Pending")) {
                                 j++;
                             }
                         }
                         return j;
                     }
                     return 0;
                 }


            }).call(inspection);

            var people = root.people = {};
            (function () {
                var root = this;

                /**
                 *  Returns array of aa.emse.dom.CapOwnerScriptModel (Not Sorted)
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return Return array of aa.emse.dom.CapOwnerScriptModel
                 */
                var getOwners = root.getOwners = function (capId) {
                    return aa.owner.getOwnerByCapId(capId).getOutput();
                };

                /**
                 *  Returns array of aa.emse.dom.CapContactScriptModel  (Not Sorted)
                 * @capId {com.accela.aa.aamain.cap.CapIDModel}
                 * @return Return array of aa.emse.dom.CapContactScriptModel
                 */
                var getContacts = root.getContacts = function (capId) {
                    return aa.people.getCapContactByCapID(capId).getOutput();
                };

                /**
                  *  Returns array of aa.emse.dom.LicenseProfessionalScriptModel (Not Sorted)
                  * @capId {com.accela.aa.aamain.cap.CapIDModel}
                  * @return Return array of aa.emse.dom.LicenseProfessionalScriptModel
                  */
                var getLicensedPros = root.getLicensedPros = function (capId, primaryOnly) {
                    var pros = [],
                        idx;

                    pros = aa.licenseProfessional.getLicenseProf(capId).getOutput();
                    if (pros) {
                        if (primaryOnly) {
                            if(pros.length == 1) {  //only 1 - assume its a primary
                                return pros;
                            }
                            for (idx in pros) {
                                if (pros[idx].printFlag == 'Y') {
                                    return pros.splice(idx, idx)
                                }
                            }
                        } else {
                            return pros;
                        }
                    }
                    return [];
                };

            }).call(people);

            var reports = root.reports = {};
            (function () {
                var root = this;

                var writeToFile = root.writeToFile = function (reportName, options) {
                    var settings = {
                        capID: '',
                        module: '',
                        parameters: {}
                    };
                    for (var attr in options) { settings[attr] = options[attr]; }

                    var rpt,
                        rptModel,
                        rptResult,
                        rptFile,
                        filename,
                        idx,
                        params,
                        repResultScriptModel;

                    rptModel = aa.reportManager.getReportInfoModelByName(reportName);

                    rpt = rptModel.getOutput();
                    //set report options - capid
                    if (settings.capID != '') {
                        rpt.setCapId(settings.capID.toString());
                    }
                    //set report options - module
                    if (settings.module != '') {
                        rpt.setModule(settings.module);
                    }
                    //set report options - params
                    idx = 0;
                    for (var param in settings.parameters) {
                        if (idx == 0) {
                            params = aa.util.newHashMap();
                        }
                        params.put(param, settings.parameters[param]);
                        logDebug('report param: ' + settings.parameters[param].key + "-" + settings.parameters[param].toString());
                        idx = idx + 1;
                    }
                    if (idx > 0) {
                        rpt.setReportParameters(params);
                    }

                    //run report & return output filename
                    rptResult = aa.reportManager.getReportResult(rpt);
                    if (rptResult.getSuccess()) {

                        //Add this because storeReportToDisk() only returns file extensions for rdf & rtf
                        repResultScriptModel = rptResult.getOutput();
                        if (repResultScriptModel.getName().toString().indexOf(".xls") < 0 && repResultScriptModel.getFormat().toString().indexOf('xls') >= 0) {
                            repResultScriptModel.setName(repResultScriptModel.getName() + '.xls');
                        }
                        logDebug(repResultScriptModel.getName());

                        rptFile = aa.reportManager.storeReportToDisk(repResultScriptModel);

                        filename = rptFile.getOutput();
                        return filename;
                    } else {
                        //have yet to get a helpful error msg returned from report mgr
                        logDebug('ERROR WRITING REPORT TO FILE: ');// + rptResult.;
                    }
                    return null;
                };

                var popup = root.popup = function (reportName, options) {
                    var settings = {
                        parameters: {}
                    };
                    for (var attr in options) { settings[attr] = options[attr]; }

                    var rpt,
                        rptModel,
                        params,
                        rptMsg,
                        permit;

                    rptModel = aa.reportManager.getReportModelByName(reportName);
                    rptModel = rptModel.getOutput();

                    //check permissions
                    permit = aa.reportManager.hasPermission(reportName, currentUserID);
                    if (!permit.getOutput().booleanValue()) {
                        logDebug("utils.reports.popup(): Unable to run report - " + currentUserID + " does not have permission to run report " + reportName);
                        return;
                    }

                    //set report options - params
                    params = aa.util.newHashMap();
                    for (var param in settings.parameters) {
                        params.put(param, settings.parameters[param]);
                    }

                    //run report
                    rptMsg = aa.reportManager.runReport(params, rptModel);
                    //display report
                    showMessage = true;
                    showDebug = false;
                    message = rptMsg.getOutput();
                };

            }).call(reports);

            var workflow = root.workflow = {};
            (function () {
                var root = this;

                var getTaskItemsCount = root.getTaskItemsCount = function (capId, wfTask, arrTaskStatuses) {
                    var len = 0,
                        idx;

                    for (idx in arrTaskStatuses) {
                        try {
                            len += aa.workflow.getTaskItems(capId, wfTask, "", null, arrTaskStatuses[idx], null).getOutput().length;
                        } catch (ex) { }
                    }
                    return len;
                };

                var getStatusHistoryCount = root.getStatusHistoryCount = function (capId, wfTask, wfTaskStatus) {
                    var len = 0,
                        wfObj = aa.workflow.getHistory(capId).getOutput();

                    for (var x = 0; x < wfObj.length; x++) {
                        if (wfObj[x].disposition == wfTaskStatus && wfObj[x].getTaskDescription() == wfTask) {
                            len += 1;
                        }
                    }
                    return len;
                };

                var isParentTaskActive = root.isTaskActiveByCapId = function (id, wfstr) // optional process name
                {
                    var useProcess = false;
                    var processName = "";
                    if (arguments.length == 3) {
                        processName = arguments[2]; // subprocess
                        useProcess = true;
                    }

                    var workflowResult = aa.workflow.getTaskItems(id, wfstr, processName, null, null, "Y");
                    if (workflowResult.getSuccess())
                        wfObj = workflowResult.getOutput();
                    else {
                        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
                        return false;
                    }

                    for (i in wfObj) {
                        fTask = wfObj[i];
                        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
                            if (fTask.getActiveFlag().equals("Y"))
                                return true;
                            else
                                return false;
                    }
                };

                var activateTaskByCapId = root.activateTaskByCapId = function (id, wfstr) // optional process name
                {
                    var useProcess = false;
                    var processName = "";
                    if (arguments.length == 3) {
                        processName = arguments[2]; // subprocess
                        useProcess = true;
                    }

                    var workflowResult = aa.workflow.getTaskItems(id, wfstr, processName, null, null, null);
                    if (workflowResult.getSuccess())
                        var wfObj = workflowResult.getOutput();
                    else {
                        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
                        return false;
                    }

                    for (i in wfObj) {
                        var fTask = wfObj[i];
                        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
                            var stepnumber = fTask.getStepNumber();
                            var processID = fTask.getProcessID();

                            if (useProcess) {
                                aa.workflow.adjustTask(id, stepnumber, processID, "Y", "N", null, null)
                            } else {
                                aa.workflow.adjustTask(id, stepnumber, "Y", "N", null, null)
                            }
                            logMessage("Activating Workflow Task: " + wfstr);
                            logDebug("Activating Workflow Task: " + wfstr);
                        }
                    }
                };

            }).call(workflow);

        }).call(accela);

        var date = root.date = {};
        (function () {
            var root = this;

            var isDate = root.isDate = function (sDate) {
                var dte = new Date(sDate);
                if (dte.toString() == "NaN" || dte.toString() == "Invalid Date") {
                    return false;
                } else {
                    return true;
                }
            };

            var dateDiff = root.dateDiff = function (date1, date2) {
                var timeDiff = date1.getTime() - date2.getTime(); //store the getTime diff - or +
                return (timeDiff / (24 * 60 * 60 * 1000)); //Convert values to -/+ days and return value
            };

            var dateAdd = root.dateAdd = function (interval, number, date) {
                var rtnDate = new Date(date.toString());
                switch (interval) {
                    //date portion
                    case 'd': //add days
                        rtnDate.setDate(rtnDate.getDate() + number)
                        break;
                    case 'm': //add months
                        rtnDate.setMonth(rtnDate.getMonth() + number)
                        break;
                    case 'y': //add years
                        rtnDate.setYear(rtnDate.getFullYear() + number)
                        break;
                        //time portion
                    case 'h': //add hours
                        rtnDate.setHours(rtnDate.getHours() + number)
                        break;
                    case 'n': //add minutes
                        rtnDate.setMinutes(rtnDate.getMinutes() + number)
                        break;
                    case 's': //add seconds
                        rtnDate.setSeconds(rtnDate.getSeconds() + number)
                        break;
                }
                return rtnDate;
            };

            var weekdayAdd = root.weekdayAdd = function (number, date) {
                var rtnDate = new Date(date.toString());
                var i = 0;
                while (i < number) {
                    rtnDate.setDate(rtnDate.getDate() + 1);
                    if (rtnDate.getDay() > 0 && rtnDate.getDay() < 6) {
                        i++;
                    }
                }
                return rtnDate;
            };

            var formatToAcellaDateStr = root.formatToAcellaDateStr = function (date) {
                var yyyy = date.getFullYear().toString(),
                    mm = (date.getMonth() + 1).toString(),
                    dd = date.getDate().toString();

                // CONVERT mm AND dd INTO chars
                var mmChars = mm.split(''),
                    ddChars = dd.split('');

                // CONCAT THE STRINGS IN YYYY-MM-DD FORMAT
                return datestring = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
            };

            var formatToMMDDYYYY = root.formatToMMDDYYYY = function (date) {
                var yyyy = date.getFullYear().toString(),
                    mm = (date.getMonth() + 1).toString(),
                    dd = date.getDate().toString();

                // CONVERT mm AND dd INTO chars
                var mmChars = mm.split(''),
                    ddChars = dd.split('');

                // CONCAT THE STRINGS IN YYYY-MM-DD FORMAT
                return datestring = (mmChars[1] ? mm : "0" + mmChars[0]) + '/' + (ddChars[1] ? dd : "0" + ddChars[0]) + '/' + yyyy;
            };

            var formatToMMDDYYYYHHMMSS = root.formatToMMDDYYYYHHMMSS = function (date) {
                var yyyy = date.getFullYear().toString(),
                    mm = (date.getMonth() + 1).toString(),
                    dd = date.getDate().toString(),
                    hh = date.getHours().toString(),
                    mi = date.getMinutes().toString(),
                    ss = date.getSeconds().toString();

                // CONVERT mm AND dd INTO chars
                var mmChars = mm.split(''),
                    ddChars = dd.split(''),
                    hhChars = hh.split(''),
                    miChars = mi.split(''),
                    ssChars = ss.split('');

                // CONCAT THE STRINGS IN YYYY-MM-DD FORMAT
                return datestring = (mmChars[1] ? mm : "0" + mmChars[0]) + '/' + (ddChars[1] ? dd : "0" + ddChars[0]) + '/' + yyyy + ' ' + (hhChars[1] ? hh : "0" + hhChars[0]) + ':' + (miChars[1] ? mi : "0" + miChars[0]) + ':' + (ssChars[1] ? ss : "0" + ssChars[0]);
            };

            var convertAccelaDateObjToJavascriptDate = root.convertAccelaDateObjToJavascriptDate = function (jDte) {
                //input = yyyy-mm-dd + time - strip out time & split on dashes
                timelessDtArr = jDte.toString().split(" ")[0].split("-");

                var yyyy = timelessDtArr[0].toString(),
                mm = timelessDtArr[1].toString(),
                dd = timelessDtArr[2].toString();

                var dte = new Date(mm + "/" + dd + "/" + yyyy);
                return dte;
            };

        }).call(date);

        var debug = root.debug = {};
        (function () {
            var root = this;

            var assert = root.assert = function (cond, msg) {
                if (cond) {
                    logDebug(msg);
                }
                return cond;
            };

            var ifTracer = root.ifTracer = function (cond, msg) {
                cond = cond ? true : false;
                logDebug((cond).toString().toUpperCase() + ': ' + msg)
                return cond;
            };

            var printObjProps = root.printObjProps = function (obj) {
                var idx;

                if (obj.getClass != null) {
                    aa.print("************* " + obj.getClass() + " *************");
                }
                for (idx in obj) {
                    if (typeof (obj[idx]) == "function") {
                        try {
                            aa.print(idx + ":  " + obj[idx]());
                        } catch (ex) { }
                    } else {
                        aa.print(idx + ":  " + obj[idx]);
                    }
                }
                aa.print("***********************************************");
            };

            var printClassDiagram = root.printClassDiagram = function (capId) {
                var $utils = bs.utils,
                    idx,
                    arr;

                aa.print('----------------> capId');
                printObjProps(capId);
                aa.print('----------------> capDetail');
                printObjProps(aa.cap.getCapDetail(capId).getOutput());  //also known as capDetail in custom_globals
                aa.print('----------------> cap');
                printObjProps(aa.cap.getCap(capId).getOutput());
                aa.print('----------------> accela date');
                printObjProps(aa.date.parseDate($utils.date.formatToMMDDYYYY(new Date())));
                aa.print('----------------> owner(s)');
                arr = $utils.accela.people.getOwners(capId);
                for (idx in arr) {
                    printObjProps(arr[idx]);
                }
                aa.print('----------------> contact(s)');;
                arr = $utils.accela.people.getContacts(capId);
                for (idx in arr) {
                    printObjProps(arr[idx]);
                }
                aa.print('----------------> licensed pro(s)');;
                arr = $utils.accela.people.getLicensedPros(capId);
                for (idx in arr) {
                    printObjProps(arr[idx]);
                }
                aa.print('----------------> primary licensed pro(s)');;
                arr = $utils.accela.people.getLicensedPros(capId, true);
                for (idx in arr) {
                    printObjProps(arr[idx]);
                }

                aa.print('----------------> Inspection)');;
                arr = aa.inspection.getInspection(capId, iNumber).getOutput();
                for (idx in arr) {
                    printObjProps(arr[idx]);
                }


                aa.print('----------------> getParcelandAttribute() (parcels))');;
                arr = aa.parcel.getParcelandAttribute(capId, null).getOutput();
                for (idx in arr) {
                    printObjProps(arr[idx]);
                }


            };

        }).call(debug);

    }).call(utils);

}).call(bs);