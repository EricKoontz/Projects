
function checkScheduledInspSameDate(beingScheduledType, beingScheduledDate) {
	var inspections = aa.inspection.getInspections(capId);
	if (inspections.getSuccess()) {
		inspections = inspections.getOutput();
		for (i in inspections) {
			var thisInspection = inspections[i];
			if (String(beingScheduledType).equals(thisInspection.getInspectionType()) && thisInspection.getInspectionStatus().equals("Scheduled")) {
				var paramDate = aa.date.parseDate(beingScheduledDate);
				var insDate = thisInspection.getScheduledDate();
				if (paramDate.getYear() == insDate.getYear() && paramDate.getMonth() == insDate.getMonth() && paramDate.getDayOfMonth() == insDate.getDayOfMonth()) {
					cancel = true;
					showMessage = true;
					comment("Inspection with this skill set already scheduled");
					return true;
				}//same date
			}//same type
		}//for all inspections
	}//success
	return false;
}