
/**
 * create parent record, copy data from child, and create/update refLicense using Contact, then associate it to parent record
 * @param workFlowTask
 * @param workflowStatusArray
 * @param contactType contact to use in LP create/update
 * @param addressType address to use in LP create/update
 * @param licenseType LP type to create/update
 * @param seqType sequence type
 * @param seqName sequence name
 * @param maskName mask name
 * @returns {Boolean}
 */
function createParentLicenseRecord(workFlowTask, workflowStatusArray, contactType, addressType, licenseType, seqType, seqName, maskName) {
	if (wfTask == workFlowTask) {

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

		//create parent app:
		var appName = cap.getSpecialText();
		var createdApp = aa.cap.createApp("Licenses", "Professional", "License", "NA", appName);
		if (!createdApp.getSuccess()) {
			logDebug("**ERROR creating app failed, error: " + createdApp.getErrorMEssage());
			return false;
		}
		createdApp = createdApp.getOutput();

		//add as parent:
		var related = aa.cap.createAppHierarchy(createdApp, capId);
		if (!related.getSuccess()) {
			logDebug("**ERROR createAppHierarchy failed, error: " + related.getErrorMEssage());
			return false;
		}

		//copy data:
		copyContacts(capId, createdApp);
		copyAppSpecific(createdApp);

		var licenseNbr = null;
		var contact = getContactByType(contactType, capId);
		aa.print(contactType + " " + contact);

		//contact required exist on child (current) record
		if (contact) {
			//Calculate Expiration Date = date of issuance + 3 years...
			var expirationDate = dateAddMonths(wfDateMMDDYYYY, 36);
			expDateArray = expirationDate.split("/");
			if (expDateArray[0] == "02") {
				expirationDate = leftPadding(expDateArray[0]) + "/28/" + expDateArray[2];
			} else {
				expirationDate = leftPadding(expDateArray[0]) + "/" + leftPadding(new Date(expDateArray[2], expDateArray[0], 0).getDate()) + "/" + expDateArray[2];
			}

			var licensesByName = aa.licenseScript.getRefLicensesProfByName(aa.serviceProvider, contact.getFirstName(), contact.getMiddleName(), contact.getLastName());

			if (licensesByName.getSuccess()) {
				licensesByName = licensesByName.getOutput();

				if (licensesByName != null && licensesByName.length > 0) {
					licenseNbr = licensesByName[0].getStateLicense();
				}
			}

			if (licenseNbr == null) {
				licenseNbr = getNextSequence(seqType, seqName, maskName);
			}

			//this edits or adds Ref-LP
			createRefLP4Lookup(licenseNbr, licenseType, contactType, addressType);
			var theRefLP = aa.licenseScript.getRefLicensesProfByLicNbr(aa.serviceProvider, licenseNbr).getOutput();

			if (theRefLP != null && theRefLP.length > 0) {
				theRefLP = theRefLP[0];
				aa.licenseScript.associateLpWithCap(createdApp, theRefLP);
				theRefLP.setLicenseExpirationDate(aa.date.parseDate(expirationDate));
				var editRefResult = aa.licenseScript.editRefLicenseProf(theRefLP);

				rB1ExpResult = aa.expiration.getLicensesByCapID(rNewLicId).getOutput();
				rB1ExpResult.setExpDate(aa.date.parseDate(expirationDate));
				aa.expiration.editB1Expiration(rB1ExpResult.getB1Expiration());
			}
		} else {//contact required exist on child (current) record
			logDebug("**WARN contact of type : " + contactType + " not found on record");
		}
	} else {
		return false;
	}
	return true;
}

/**
returns next value of mask/sequence provided
* @param seqType from system Sequence generator (type of seq/mask)
*/