//Start Allow user to see renewal license after submit 
aa.cap.updateAccessByACA(capId, "Y");
//End Allow user to see renewal license after submit

// Begin script to copy contacts from license to renewal for public users
include("COPY_CONTACTS_TO_RENEWAL");
// End script to copy contacts from license to renewal for public users
