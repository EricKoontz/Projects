// Begin script to copy Owner Applicant information to the Owners ASIT.
include("SAVE_OWNER_APPLICANT_TO_OWNER_TABLE");
// End script to copy Owner Applicant information to the Owners ASIT.

envParams = aa.util.newHashMap();
envParams.put("CapId", capId);

aa.runAsyncScript("GISADDRESSVERIFICATIONASYNC", envParams);