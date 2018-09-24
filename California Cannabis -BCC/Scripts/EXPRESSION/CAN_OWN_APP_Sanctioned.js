var servProvCode = expression.getValue("$$servProvCode$$").value;
var vSanctioned = expression.getValue("ASI::OWNER INFORMATION::Sanctioned, suspended and/or Revoked");
var vSanctionedComments = expression.getValue("ASI::OWNER INFORMATION::Sanctioned, suspended and/or Revoked comments");

var totalRowCount = expression.getTotalRowCount();

if ((vSanctioned.value != null && (vSanctioned.value.equalsIgnoreCase('YES') || vSanctioned.value.equalsIgnoreCase('Y') || vSanctioned.value.equalsIgnoreCase('CHECKED') || vSanctioned.value.equalsIgnoreCase('SELECTED') || vSanctioned.value.equalsIgnoreCase('TRUE') || vSanctioned.value.equalsIgnoreCase('ON')))) {

	vSanctionedComments.required = true;
	vSanctionedComments.hidden = false;
	expression.setReturn(vSanctionedComments);
} else {
	vSanctionedComments.required = false;
	vSanctionedComments.hidden = true;
	expression.setReturn(vSanctionedComments);
}
