/**
returns next value of mask/sequence provided
* @param seqType from system Sequence generator (type of seq/mask)
*/
function getNextSequence(seqType, seqName, maskName) {
	try {
		var agencySeqBiz = aa.proxyInvoker.newInstance("com.accela.sg.AgencySeqNextBusiness").getOutput();
		var params = aa.proxyInvoker.newInstance("com.accela.domain.AgencyMaskDefCriteria").getOutput();

		params.setAgencyID(aa.getServiceProviderCode());
		params.setMaskName(maskName);
		params.setRecStatus("A");
		params.setSeqType(seqType);
		params.setSeqName(seqName);

		var seq = agencySeqBiz.getNextMaskedSeq("ADMIN", params, null, null);

		return seq;
	} catch (err) {
		aa.print("error " + err);
		return null;
	}
}