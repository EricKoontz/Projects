// Begin script to limit Business, Owner Applicant, Primary Contact Person, and Agent of Service contacts to one.
var vOwnerApplicant = getContactObj(capId, "Owner Applicant");
if (vSelectedContactType == "Owner Applicant" && vOwnerApplicant != false) {
	showMessage = true;
	comment("Only one Owner Applicant contact is allowed.");
	cancel = true;
}
var vBusiness = getContactObj(capId, "Business");
if (vSelectedContactType == "Business" && vBusiness != false) {
	showMessage = true;
	comment("Only one Business contact is allowed.");
	cancel = true;
} 
var vPrimaryContactPerson = getContactObj(capId, "Primary Contact Person");
if (vSelectedContactType == "Primary Contact Person" && vPrimaryContactPerson != false) {
	showMessage = true;
	comment("Only one Primary Contact Person is allowed.");
	cancel = true;
}
var vAgentOfService = getContactObj(capId, "Agent of Service");
if (vSelectedContactType == "Agent of Service" && vAgentOfService != false) {
	showMessage = true;
	comment("Only one Agent of Service is allowed.");
	cancel = true;
}  
// End script to limit Business, Owner Applicant, Primary Contact Person, and Agent of Service contacts to one.