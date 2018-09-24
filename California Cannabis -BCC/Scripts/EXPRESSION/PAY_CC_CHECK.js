var toPrecision = function (value) {
	var multiplier = 10000;
	return Math.round(value * multiplier) / multiplier;
}
function addDate(iDate, nDays) {
	if (isNaN(nDays)) {
		throw ("Day is a invalid number!");
	}
	return expression.addDate(iDate, parseInt(nDays));
}

function diffDate(iDate1, iDate2) {
	return expression.diffDate(iDate1, iDate2);
}

function parseDate(dateString) {
	return expression.parseDate(dateString);
}

function formatDate(dateString, pattern) {
	if (dateString == null || dateString == '') {
		return '';
	}
	return expression.formatDate(dateString, pattern);
}

var servProvCode = expression.getValue("$$servProvCode$$").value;
var vMethod = expression.getValue("PAY::method");
var vCheckNbr = expression.getValue("PAY::checkNbr");
var vReference = expression.getValue("PAY::reference");
var vCCAuthCode = expression.getValue("PAY::ccAuthCode");
var vComment = expression.getValue("PAY::comment");




var totalRowCount = expression.getTotalRowCount();

if (vMethod.value != null && vMethod.value.equals(String("Cash"))) {

        vComment.required = false;
	vComment.hidden = false;
      	expression.setReturn(vComment);

}

if (vMethod.value != null && vMethod.value.equals(String("Check"))) {
	vCheckNbr.required = true;
	vCheckNbr.hidden = false;
	expression.setReturn(vCheckNbr);
        
        vReference.required = false;
	vReference.hidden = false;
	expression.setReturn(vReference);

        vComment.required = true;
	vComment.hidden = false;
       vComment.message = "Enter Check Received Date/Postmarked Date";  
	expression.setReturn(vComment);

	vCCAuthCode.required = false;
	vCCAuthCode.hidden = true;
	expression.setReturn(vCCAuthCode);
}
else if (vMethod.value != null && (vMethod.value == "Credit Card" || vMethod.value == "AMEX")) {
	vCheckNbr.required = false;
	vCheckNbr.hidden = true;
	expression.setReturn(vCheckNbr);

	vCCAuthCode.required = true;
	vCCAuthCode.hidden = false;
	expression.setReturn(vCCAuthCode);

        vReference.required = false;
	vReference.hidden = true;
	expression.setReturn(vReference);

        vComment.required = false;
	vComment.hidden = false;
        expression.setReturn(vComment);
}
else {
	vCheckNbr.required = false;
	vCheckNbr.hidden = true;
	expression.setReturn(vCheckNbr);

	vCCAuthCode.required = false;
	vCCAuthCode.hidden = true;
	expression.setReturn(vCCAuthCode);	

        vReference.required = false;
	vReference.hidden = true;
	expression.setReturn(vReference);

        vComment.required = false;
	vComment.hidden = false;
        expression.setReturn(vComment);
}
