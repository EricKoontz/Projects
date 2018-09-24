/*
Title : Send Permit issuance email (WorkflowTaskUpdateAfter)
Purpose : If workflow Permit Issuance has a status of Issued then send a permit issuance email with the attached permit report and
send it to the applicant contact
(Need Email Template plus Report Name from Client).

Author: Haitham Eleisah

Functional Area : Records

Sample Call:
checkWorkFlowStatusAndSendEmail("Tree Trim Intake","Issued","MESSAGE_NOTICE_PUBLIC WORKS", "REPORT_NAME", rptParams);
 */
//Based on report fill report parameters here
var rptParams = aa.util.newHashtable();
rptParams.put("altID", cap.getCapModel().getAltID());

checkWorkFlowStatusAndSendEmail("Tree Trim Intake", "Issued", "FT PERMIT ISSUED #160", "WorkFlowTasksOverdue", rptParams);
