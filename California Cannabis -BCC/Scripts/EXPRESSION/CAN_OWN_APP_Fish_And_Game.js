var servProvCode = expression.getValue("$$servProvCode$$").value;
var vFishAndGame = expression.getValue("ASI::OWNER INFORMATION::Disciplined due to Fish And Game violations for unauthorized activities");
var vFishAndGameComments = expression.getValue("ASI::OWNER INFORMATION::Comments to Fish and Game Answer");

var totalRowCount = expression.getTotalRowCount();

if ((vFishAndGame.value != null && (vFishAndGame.value.equalsIgnoreCase('YES') || vFishAndGame.value.equalsIgnoreCase('Y') || vFishAndGame.value.equalsIgnoreCase('CHECKED') || vFishAndGame.value.equalsIgnoreCase('SELECTED') || vFishAndGame.value.equalsIgnoreCase('TRUE') || vFishAndGame.value.equalsIgnoreCase('ON')))) {

	vFishAndGameComments.required = true;
	vFishAndGameComments.hidden = false;
	expression.setReturn(vFishAndGameComments);
} else {
	vFishAndGameComments.required = false;
	vFishAndGameComments.hidden = true;
	expression.setReturn(vFishAndGameComments);
}
