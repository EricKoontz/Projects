function getIncompleteCapId()  {
    	var s_id1 = aa.env.getValue("PermitId1");
   	var s_id2 = aa.env.getValue("PermitId2");
    	var s_id3 = aa.env.getValue("PermitId3");

    	var result = aa.cap.getCapIDModel(s_id1, s_id2, s_id3);
    	if(result.getSuccess()) {
    		return result.getOutput();
	}  
    	else { logDebug("ERROR: Failed to get capId: " + result.getErrorMessage()); return null; }
}