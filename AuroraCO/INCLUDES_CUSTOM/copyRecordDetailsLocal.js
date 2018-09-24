
/**
 * copy record details from capIdFrom to capIdTo
 * @param capIdFrom copy from
 * @param capIdTo copy to
 * @returns {Boolean}
 */
function copyRecordDetailsLocal(capIdFrom, capIdTo) {
	aa.cap.copyCapDetailInfo(capIdFrom, capIdTo);
	aa.cap.copyCapWorkDesInfo(capIdFrom, capIdTo);
	return true;
}