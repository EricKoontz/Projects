/* Title :  Check for Duplicate Forestry Request Record (ApplicationSubmitAfter,ConverToRealCapAfter) */

//Purpose :   If there is an active record (record type Forestry/Request/*/* with record status of “Wait List” or “Assigned” or “Submitted” or
//				“Working”) with the same address or parcel as the current record and has a matching value in the Custom Field “Source of
//				Request” then get the value in Record Detail and append to existing record detail on the current record value “- Possible
//				duplicate” of record + Record ID. Example: If entered value of Record Detail was “Request to trim tree due to storm and
//				broken branches” and if there is an Activate Forestry/Request/*/* with record ID 17-00067-FTR then Record Detail will be
//				“Request to trim tree due to storm and broken branches - Possible duplicate 17-00067-FTR”

//Author :   Israa Ismail

//Functional Area : Records 

//Sample Call : checkForDuplicateForestryReqRecord()
//Notes : publicUser filter would be changed according to the active event ,for CTRCA : publicUser , ASA : !publicUser

checkForDuplicateForestryReqRecord();