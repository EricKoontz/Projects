/*
Title : Applicatoin Submittal Required Fees (WorkflowTaskUpdateBefore) 

Purpose : If workflow task = "Application Submittal" and workflow status = "Accepted" and there are no Fees on the record then block
the workflow from moving forward and display the error message “Fees must be added and Invoiced to Accept the
Application Submittal"

Author: Yazan Barghouth 
 
Functional Area : Records

Sample Call:
	checkApplicatoinSubmittalRequiredFees("Application Submittal", [ "Accepted" ]);
*/

checkApplicatoinSubmittalRequiredFees("Application Submittal", [ "Accepted" ]);