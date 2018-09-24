var servProvCode = expression.getValue("$$servProvCode$$").value;
var vSellersStatus = expression.getValue("ASI::APPLICATION INFORMATION::Status for Seller’s Permit");
var vSellersNumber = expression.getValue("ASI::APPLICATION INFORMATION::Seller’s Permit Number");

var totalRowCount = expression.getTotalRowCount();

if (vSellersStatus.value == "Yes, I have a Seller's Permit") {
	vSellersNumber.required = true;
	vSellersNumber.hidden = false;
	expression.setReturn(vSellersNumber);
} else {
	vSellersNumber.required = false;
	vSellersNumber.hidden = true;
	expression.setReturn(vSellersNumber);
}
