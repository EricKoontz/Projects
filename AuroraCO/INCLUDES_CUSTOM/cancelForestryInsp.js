function cancelForestryInsp(){
	try {
		var treeInvList=loadASITable("TREE INFORMATION",capId);
		if (treeInvList != "undefined") {
			cancelInspections(treeInvList);
		}
		
	}catch(e){
		aa.debug("****Error in Canceling Inspection",e);
	}
}