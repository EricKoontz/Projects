/**
 * Copies all important information from one Cap to another Cap
 * 
 * @requires copyAppSpecificInfoForLic(CapIDModel, CapIDModel),
 *           copyAddressForLic(CapIDModel, CapIDModel),
 *           copyAppSpecificTableForLic(CapIDModel, CapIDModel),
 *           copyParcelForLic(CapIDModel, CapIDModel),
 *           copyPeopleForLic(CapIDModel, CapIDModel),
 *           copyLicenseProfessionalForLic(CapIDModel, CapIDModel),
 *           copyOwnerForLic(CapIDModel, CapIDModel),
 *           copyCapConditionForLic(CapIDModel, CapIDModel),
 *           copyAdditionalInfoForLic(CapIDModel, CapIDModel),
 *           copyEducation(CapIDModel, CapIDModel),
 *           copyContEducation(CapIDModel, CapIDModel),
 *           copyExamination(CapIDModel, CapIDModel),
 *           copyRenewCapDocument(CapIDModel, CapIDModel)
 * @example copyKeyInfo(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyKeyInfo(srcCapId, targetCapId) {
	copyAppSpecificInfoForLic(srcCapId, targetCapId);
	copyAddressForLic(srcCapId, targetCapId);
	copyAppSpecificTableForLic(srcCapId, targetCapId);
	copyParcelForLic(srcCapId, targetCapId);
	copyPeopleForLic(srcCapId, targetCapId);
	copyLicenseProfessionalForLic(srcCapId, targetCapId);
	copyOwnerForLic(srcCapId, targetCapId);
	copyCapConditionForLic(srcCapId, targetCapId);
	copyAdditionalInfoForLic(srcCapId, targetCapId);
	if (vEventName == "ConvertToRealCapAfter") {
		copyEducation(srcCapId, targetCapId);
		copyContEducation(srcCapId, targetCapId);
		copyExamination(srcCapId, targetCapId);
		var currentUserID = aa.env.getValue("CurrentUserID");
		copyRenewCapDocument(srcCapId, targetCapId, currentUserID);
	}
}
