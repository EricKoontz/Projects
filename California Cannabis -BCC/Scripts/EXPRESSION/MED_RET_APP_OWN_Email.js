var servProvCode = expression.getValue("$$servProvCode$$").value;
var vEmail = expression.getValue("ASIT::LIST OF OWNERS::Email Address");
var thisForm = expression.getValue("ASIT::LIST OF OWNERS::FORM");
var vEmailValue;

var totalRowCount = expression.getTotalRowCount();
for (var rowIndex = 0; rowIndex < totalRowCount; rowIndex++) {
	vEmail = expression.getValue(rowIndex, "ASIT::LIST OF OWNERS::Email Address");
	vEmailValue = vEmail.value;
	
	//If email value is missing either an "@" or "." value then it should be considered invalid. 
	if (vEmailValue.indexOf("@") == -1 || vEmailValue.indexOf(".") == -1) {
		vEmail.message = "Must be a valid email address";
		expression.setReturn(rowIndex, vEmail);	

		thisForm.blockSubmit = true;
		expression.setReturn(rowIndex, thisForm);	
	}
}
