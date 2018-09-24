var servProvCode = expression.getValue("$$servProvCode$$").value;
var vSSN = expression.getValue("REFCONTACT::maskedSsn");
var vBirthDate = expression.getValue("REFCONTACT::birthDate");

var totalRowCount = expression.getTotalRowCount();

if (vSSN.value != null && !vSSN.value.equals(String('')) && vSSN.value != null && !vSSN.value.equals("")) {

	vBirthDate.required = true;
	expression.setReturn(vBirthDate);

	vBirthDate.hidden = false;
	expression.setReturn(vBirthDate);
} else {
	vBirthDate.required = false;
	expression.setReturn(vBirthDate);
	vBirthDate.hidden = true;
	expression.setReturn(vBirthDate);
}
