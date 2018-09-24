// Begin script to copy Owner Applicant information to the Owners ASIT.
include("SAVE_OWNER_APPLICANT_TO_OWNER_TABLE");
// End script to copy Owner Applicant information to the Owners ASIT.

// Begin script to copy Business contact information (Business Name and Address) to record
include("SAVE_BUSINESS_INFO_TO_RECORD");
// End script to copy Business contact information (Business Name and Address) to record

/*
envParams = aa.util.newHashMap();
envParams.put("CapId", capId);

aa.runAsyncScript("GISADDRESSVERIFICATIONASYNC", envParams);
*/