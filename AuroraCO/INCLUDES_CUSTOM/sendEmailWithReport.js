function sendEmailWithReport(ownerEmail, applicantEmail, emailTemplateName, reportName, rptParams, emailParams) {

	var report = aa.reportManager.getReportInfoModelByName(reportName);
	if (report == null) {
		logDebug("**WARN getReportInfoModelByName() returned NULL, reportType=" + reportName);
		return false;
	}
	if (report.getSuccess()) {
		var reportFiles = new Array();

		report = report.getOutput();
		report.setModule(cap.getCapModel().getModuleName());
		report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
		report.setReportParameters(rptParams);

		var hasPerm = aa.reportManager.hasPermission(reportName, aa.getAuditID());
		if (hasPerm.getSuccess() && hasPerm.getOutput().booleanValue()) {
			var reportResult = aa.reportManager.getReportResult(report);
			if (reportResult.getSuccess()) {
				reportResult = reportResult.getOutput();
				var reportFile = aa.reportManager.storeReportToDisk(reportResult);
				if (reportFile.getSuccess()) {
					reportFile = reportFile.getOutput();
					reportFiles.push(reportFile);
				} else {
					logDebug("**WARN storeReportToDisk() failed: " + reportFile.getErrorMessage());
				}
			}//report result OK
		}//has permission

		var altIDScriptModel = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
		var sent = aa.document.sendEmailAndSaveAsDocument("", ownerEmail, applicantEmail, emailTemplateName, emailParams, altIDScriptModel, reportFiles);
		if (!sent.getSuccess()) {
			logDebug("**WARN send email failed, Error: " + sent.getErrorMessage());
		}
	} else {//report OK
		logDebug("**WARN getReportInfoModelByName() failed: " + report.getErrorMessage());
	}
}
