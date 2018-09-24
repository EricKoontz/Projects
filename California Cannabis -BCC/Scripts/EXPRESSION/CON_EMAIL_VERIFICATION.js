var servProvCode = expression.getValue("$$servProvCode$$").value;
var vEmail = expression.getValue("CONTACT::contactsModel*email");
var thisForm = expression.getValue("CONTACT::FORM");
var vEmailValue;

vEmailValue = vEmail.value;
	
//If email value is missing either an "@" or "." value then it should be considered invalid. 
if ((vEmailValue != null && vEmailValue != "") && (vEmailValue.indexOf("@") == -1 || vEmailValue.indexOf(".") == -1)) {
	vEmail.message = "Must be a valid email address";
	expression.setReturn(vEmail);	

	thisForm.blockSubmit = true;
	expression.setReturn(thisForm);	
}