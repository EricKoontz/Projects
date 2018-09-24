
/**
 * * If paid in full, Create a parent license, copy the ASI's, and email the applicant
 * @param emailTemplate
 * @returns {void} 
 */

function createParentLicenseOnPRA(emailTemplate) {
    if (balanceDue == 0) {
        // Create a parent license, and copy ASI's
        var newLicId = createParent(appTypeArray[0], appTypeArray[1], "License", appTypeArray[3], null, capId);
        if (newLicId != null) {
            copyASIFields(capId, newLicId);
            // Set expiration date
            var expDate = calcExpDate(new Date());
            var expResult = aa.expiration.getLicensesByCapID(newLicId).getOutput();
            expResult.setExpDate(expDate);
            expResult.setExpStatus("Active");
            aa.expiration.editB1Expiration(expResult.getB1Expiration());

            // Send Email
            sendEmail(emailTemplate);
        }
    }
}