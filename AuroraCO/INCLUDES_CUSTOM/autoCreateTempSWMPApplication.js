
/**
 * check wfTaskName, workflowStatusArray and ASIfield value, if matched<br/>a temporary record is created and data copied from current record to new record
 * @param wfTaskName
 * @param workflowStatusArray
 * @param asiFieldName to check if it's values matches 'yes'
 * @param appTypeStr 4 levels application type to create
 * @returns {Boolean}
 */
function autoCreateTempSWMPApplication(wfTaskName, workflowStatusArray, asiFieldName, appTypeStr, emailTemplate) {

    logDebug('autoCreateTempSWMPApplication() started');
    if (wfTask == wfTaskName) {

        var statusMatch = false;

        for (s in workflowStatusArray) {
            if (wfStatus == workflowStatusArray[s]) {
                statusMatch = true;
                break;
            }
        }//for all status options

        if (!statusMatch) {
            return false;
        }
        logDebug('autoCreateTempSWMPApplication() wf status & task match');

        useAppSpecificGroupName = false;
        //var asiFieldValue = getAppSpecific(asiFieldName);
		var thisTSIArr = [];
	    loadTaskSpecific(thisTSIArr);
		var tsiValue = thisTSIArr[asiFieldName]

        if (tsiValue == null || !tsiValue.equalsIgnoreCase("yes")) {
            return false;
        }

        var cTypeArray = appTypeStr.split("/");
        var ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
        ctm.setGroup(cTypeArray[0]);
        ctm.setType(cTypeArray[1]);
        ctm.setSubType(cTypeArray[2]);
        ctm.setCategory(cTypeArray[3]);
        createChildResult = aa.cap.createSimplePartialRecord(ctm, cap.getSpecialText(), "INCOMPLETE EST");

        if (createChildResult.getSuccess()) {
            createChildResult = createChildResult.getOutput();

            //createAppHierarchy and copy data
            var appHierarchy = aa.cap.createAppHierarchy(capId, createChildResult);
            copyRecordDetailsLocal(capId, createChildResult);
            copyAddresses(capId, createChildResult);
            copyParcels(capId, createChildResult);
   //         copyOwner(capId, createChildResult);
            logDebug('calling copyContacts2()');
            copyContacts2(capId, createChildResult, { contactType: 'Project Owner' });
            copyContacts2(capId, createChildResult, { contactType: 'Applicant' });
            copyContacts2(capId, createChildResult, { contactType: 'Developer' });
            copyASITableByTName("POND TYPES", capId, createChildResult);
            //copyContactsByType(capId, createChildResult, "Applicant");
           // copyContacts(capId, createChildResult);
          //  removeContactsFromCapByType(createChildResult, "Outside Agency");

            var projectOwner = getContactByType("Project Owner", capId);
            if (projectOwner && projectOwner.getEmail() != null && projectOwner.getEmail() != "") {
				//Get ACA Url
	            acaURL = lookup("ACA_CONFIGS", "ACA_SITE");
	            acaURL = acaURL.substr(0, acaURL.toUpperCase().indexOf("/ADMIN"));
				
                var files = new Array();
                var eParams = aa.util.newHashtable();
                addParameter(eParams, "$$altID$$", createChildResult.getCustomID());
                addParameter(eParams, "$$appTypeString$$", cap.getCapType().getAlias());
                addParameter(eParams, "$$recordStatus$$", cap.getCapStatus());
                addParameter(eParams, "$$balance$$", feeBalance(""));
                addParameter(eParams, "$$wfTask$$", wfTask);
                addParameter(eParams, "$$wfStatus$$", wfStatus);
                addParameter(eParams, "$$wfDate$$", wfDate);
                if (wfComment != null && typeof wfComment !== 'undefined') {
                    addParameter(eParams, "$$wfComment$$", wfComment);
                }
                addParameter(eParams, "$$wfStaffUserID$$", wfStaffUserID);
                addParameter(eParams, "$$wfHours$$", wfHours);
				
				addParameter(eParams, "$$acaDocDownloadUrl$$", acaURL);


            //  var sent = aa.document.sendEmailByTemplateName("", projectOwner.getEmail(), "", emailTemplate, eParams, files);         
            logDebug('autoCreateTempSWMPApplication() sending email to ' + projectOwner.getEmail());
            var sent = sendNotification("noreply@auroragov.org", projectOwner.getEmail(), "", emailTemplate, eParams, files);
            if (!sent) {
                    logDebug("**WARN sending email failed, error:" + sent.getErrorMessage());
                    return false;
                }
            } else {
                logDebug("**WARN Project Owner not found or has no email, capId=" + capId);
            }
        } else {
            logDebug("**ERROR create record failed, error:" + createChildResult.getErrorMessage());
            return false;
        }
    } else {
        return false;
    }
    return true;
}
