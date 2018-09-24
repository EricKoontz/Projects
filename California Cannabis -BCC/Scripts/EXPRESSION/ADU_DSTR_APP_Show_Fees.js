var servProvCode = expression.getValue("$$servProvCode$$").value;
var vCDFA = expression.getValue("ASI::APPLICATION INFORMATION::Cultivator License");
var vDollar = expression.getValue("ASI::FEE ASSESSMENT::Max dollar value as determined by CDTFA in assessing excise tax");
var totalRowCount = expression.getTotalRowCount();
var vFeeCode;
var vFeeAmt;
var aa = expression.getScriptRoot();

if (vDollar.value != null && vDollar.value != "") {
	if (vCDFA.value == "Yes") {
		if (vDollar.value == "Up to 2 million") {
			vFeeCode = "ADU_DSTR_052";
		}
		if (vDollar.value == "Greater than 2 million to 8 million") {
			vFeeCode = "ADU_DSTR_053";
		}
	} else {
		if (vDollar.value == "Up to 2 million") {
			vFeeCode = "ADU_DSTR_050";
		}
		if (vDollar.value == "Greater than 2 million to 8 million") {
			vFeeCode = "ADU_DSTR_051";
		}
	}

	vFeeAmt = getRefFeeCalcFormula(vFeeCode, "ADU_DSTR_FEE");

	if (vFeeAmt != null) {
		vFeeAmt = parseFloat(vFeeAmt);
		vFeeAmt = formatCurrency(vFeeAmt);
		vDollar.message = "Based on your selection, your license fee will be: " + vFeeAmt;
		expression.setReturn(vDollar);
	}
} else {
	vDollar.message = "";
	expression.setReturn(vDollar);
}

/////////////////////////////////// Functions //////////////////////////////////////////////////////
function getRefFeeCalcFormula(feeCode, fsched) {
	var arrFeesResult = aa.finance.getFeeItemList(null, fsched, null);
	var arrFees;
	var fCode;
	var vFeeFormula;
	var xx;
	if (arrFeesResult.getSuccess()) {
		arrFees = arrFeesResult.getOutput();
		for (xx in arrFees) {
			fCode = arrFees[xx].getFeeCod();
			if (fCode.equals(feeCode)) {
				vFeeFormula = arrFees[xx].getFormula();
				return vFeeFormula;
			}
		}
	} else {
		return null;
	}
}

function formatCurrency(num) {
	num = num.toString().replace(/\$|\,/g, '');
	if (isNaN(num))
		num = "0";
	sign = (num == (num = Math.abs(num)));
	num = Math.floor(num * 100 + 0.50000000001);
	cents = num % 100;
	num = Math.floor(num / 100).toString();
	if (cents < 10)
		cents = "0" + cents;
	for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
		num = num.substring(0, num.length - (4 * i + 3)) + ',' +
			num.substring(num.length - (4 * i + 3));
	return (((sign) ? '' : '-') + '$' + num + '.' + cents);
}
