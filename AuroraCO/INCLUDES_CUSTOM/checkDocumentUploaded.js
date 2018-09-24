
//documentModelArray contains only uploaded docs, not already uploaded
var docs = null;//to load it once

function checkDocumentUploaded(documentType) {
	var lastIndex = documentType.lastIndexOf(".");
	if (lastIndex <= 0) {
		return false;
	}
	documentType = documentType.substring(lastIndex + 1);
	if (docs == null) {
		//documentModelArray contains only uploaded docs, not already uploaded
		docs = aa.document.getCapDocumentList(capId, aa.getAuditID()).getOutput();
	}
	for (d in docs) {
		if (documentType == docs[d].getDocCategory().toString()) {
			return true;
		}
	}
	return false;
}