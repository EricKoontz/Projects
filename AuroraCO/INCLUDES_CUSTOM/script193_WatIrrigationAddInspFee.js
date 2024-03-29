/*Script 193
 * Record Types: Water/Water/Lawn Irrigation/Permit
 * Event: 		WorkflowTaskUpdateAfter (WTUA)
 * 
 * Desc:			
 * Note: Record type changed to Water/Water/Lawn Irrigation/Permit 
 * When the WfTask = “Fee Processing” and the wfStatus = “Ready to Pay” 
 * Action: Then create the Inspection fee and generate an invoice email and with link 
 * to the invoice report and email it to the owner and applicant contacts. 
 * and cc: any other Contacts on the record in addition to Applicant – 
 * NOTE ; Template will be provided by Aurora. 
 *  If the custom field "Type of Project" has a value of "Commercial" then add the
Commercial Inspection Fee. 
    If the custom field "Type of Project" has a value of "Residential" then add the Residential
Inspection Fee. Fees: Commercial - $138.00 Single Family – $30.75
 * 
*/       
function script193_WatIrrigationAddInspFee() {
    
	logDebug("script193_WatIrrigationAddInspFee() started.");
	try{
            
		var emailTemplate = 'WAT_IRRIGATION PLAN REVIEW INVOICED #193',
			  toContactTypes = 'Applicant',
			  ccContactTypes = 'All',
			  emailparams = aa.util.newHashtable(),
			  reportname = ""
			  reportparams = aa.util.newHashtable(),
			  applicant = getContactByType("Applicant", capId);

		//email params
	   if(ifTracer(applicant, 'found applicant, will send ContactFullName')) {
			logDebug("applicant.contactName - " + applicant.contactName);
			emailparams.put("$$ContactFullName$$", applicant.contactName);
	   }
	   
	   //report params
		reportparams.put("DEPARTMENT", "Administrator");

		//create fee
		if(AInfo['Type of Property'] == 'Single Family Residential') {
			addFee('WAT_IP_01', 'WAT_IP', 'FINAL', 1, "Y");                
		} else {
			addFee('WAT_IP_02', 'WAT_IP', 'FINAL', 1, "Y");                
		}

		//send email
		emailContactsWithCCs(toContactTypes, emailTemplate, emailparams, reportname, reportparams, "N", "", ccContactTypes);
}
catch(err){
		showMessage = true;
		comment("Error on custom function script193_WatIrrigationAddInspFee(). Please contact administrator. Err: " + err);
		logDebug("Error on custom function script193_WatIrrigationAddInspFee(). Please contact administrator. Err: " + err);
	}
	logDebug("script193_WatIrrigationAddInspFee() ended."); 
}   //END script193_WatIrrigationAddInspFee();
