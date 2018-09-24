function cancelInspections(treeInvList) {
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess()) {
		inspList = inspResultObj.getOutput();
		for (xx in inspList) {
			var isMatch = false;
			var inspId = inspList[xx].getIdNumber();
			var act = inspList[xx].getInspection().getActivity();
			var unitNbr = act.getUnitNBR();
			for (row in treeInvList) {
				var treeId = treeInvList[row]["Tree ID"].fieldValue;
				if (unitNbr != null) {
					if (unitNbr.equals(treeId)) {
						isMatch = true;
						break;
					}

				}

			}
			if (!isMatch){
				var res=aa.inspection.cancelInspection(capId, inspId);
				if (res.getSuccess()){
					aa.debug("Inspection Canceled" , inspId);
				}
			}
				

		}
	}
}
