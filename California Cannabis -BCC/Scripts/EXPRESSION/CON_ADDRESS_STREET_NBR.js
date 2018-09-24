var servProvCode=expression.getValue("$$servProvCode$$").value;
var vHouseNbr=expression.getValue("CONTACTADDR::houseNumberStart");
var vForm=expression.getValue("CONTACTADDR::FORM");

var totalRowCount = expression.getTotalRowCount();

if (isNaN(vHouseNbr.value)){
	vForm.blockSubmit = true;
	vForm.message = "Street Number must be a number"
	expression.setReturn(vForm);

	vHouseNbr.message = "Street Number must be a number";
	expression.setReturn(vHouseNbr);
}