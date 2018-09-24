var servProvCode = expression.getValue("$$servProvCode$$").value;
var v20Employees = expression.getValue("ASI::APPLICATION INFORMATION::20 or more employees?");
var vLaborAgree = expression.getValue("ASI::APPLICATION INFORMATION::Attest they will abide to the Labor Peace Agreement");

var totalRowCount = expression.getTotalRowCount();

if ((v20Employees.value != null && (v20Employees.value.equalsIgnoreCase('YES') || v20Employees.value.equalsIgnoreCase('Y') || v20Employees.value.equalsIgnoreCase('CHECKED') || v20Employees.value.equalsIgnoreCase('SELECTED') || v20Employees.value.equalsIgnoreCase('TRUE') || v20Employees.value.equalsIgnoreCase('ON')))) {

	vLaborAgree.required = true;
	vLaborAgree.hidden = false;
	expression.setReturn(vLaborAgree);
} else {
	vLaborAgree.required = false;
	vLaborAgree.hidden = true;
	expression.setReturn(vLaborAgree);
}
