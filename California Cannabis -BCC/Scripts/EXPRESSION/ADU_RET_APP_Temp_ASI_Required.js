var servProvCode = expression.getValue("$$servProvCode$$").value;
var vTempRequest = expression.getValue("ASI::APPLICATION OPTIONS::Are you requesting a temporary license?");
var v20orMoreEmp = expression.getValue("ASI::APPLICATION INFORMATION::20 or more employees?");
var vSovereign = expression.getValue("ASI::APPLICATION INFORMATION::Are they Sovereign Entity");
var vNoProhibLocation = expression.getValue("ASI::APPLICATION INFORMATION::Attest no prohibited location Within specified requirement");
var vLaborAgreement = expression.getValue("ASI::APPLICATION INFORMATION::Attest they will abide to the Labor Peace Agreement");
var vCEQA = expression.getValue("ASI::APPLICATION INFORMATION::CEQA");
var vSellers = expression.getValue("ASI::APPLICATION INFORMATION::Seller's Permit in process");
var vSellersNum = expression.getValue("ASI::APPLICATION INFORMATION::Seller's Permit Number");
var vSellersStatus = expression.getValue("ASI::APPLICATION INFORMATION::Status for Seller's Permit");
var vMaxDollar = expression.getValue("ASI::FEE ASSESSMENT::Max dollar value as determined by CDTFA in assessing excise tax");
var vID1=expression.getValue("$$capID1$$");
var vID2=expression.getValue("$$capID2$$");
var vID3=expression.getValue("$$capID3$$");
var totalRowCount = expression.getTotalRowCount();
var thisForm = expression.getValue("ASI::FORM");
var aa = expression.getScriptRoot();

vID1 = vID1.value + "";
vID2 = vID2.value + "";
vID3 = vID3.value + "";

var vCapId = aa.cap.getCapID(vID1,vID2,vID3).getOutput();

//check to see if a temporary license has already been issued
var vIssued = false;
var vWFTaskHistory = aa.workflow.getWorkflowHistory(vCapId, 'Issuance', null).getOutput();
var vTaskModel;
var vTaskStatus;
var x = 0;
for (x in vWFTaskHistory) {
	vTaskModel = vWFTaskHistory[x];
	vTaskStatus = vTaskModel.getDisposition();
	if (vTaskStatus == 'Temporarily Issued') {
		vIssued = true;
		break;
	}
}

//Set ASI fields to required if not selecting temporary, or temporary has already been issued.
if (vTempRequest.value == null || vTempRequest.value == "" || vTempRequest.value == "No" || vIssued == true) {

	v20orMoreEmp.required = true;
	expression.setReturn(v20orMoreEmp);

	vSovereign.required = true;
	expression.setReturn(vSovereign);

	vNoProhibLocation.required = true;
	expression.setReturn(vNoProhibLocation);

	vLaborAgreement.required = true;
	expression.setReturn(vLaborAgreement);

	vCEQA.required = true;
	expression.setReturn(vCEQA);

	vSellers.required = true;
	expression.setReturn(vSellers);

	vSellersNum.required = true;
	expression.setReturn(vSellersNum);

	vSellersStatus.required = true;
	expression.setReturn(vSellersStatus);

	vMaxDollar.required = true;
	expression.setReturn(vMaxDollar);
} else {
	v20orMoreEmp.required = false;
	expression.setReturn(v20orMoreEmp);

	vSovereign.required = false;
	expression.setReturn(vSovereign);

	vNoProhibLocation.required = false;
	expression.setReturn(vNoProhibLocation);

	vLaborAgreement.required = false;
	expression.setReturn(vLaborAgreement);

	vCEQA.required = false;
	expression.setReturn(vCEQA);

	vSellers.required = false;
	expression.setReturn(vSellers);

	vSellersNum.required = false;
	expression.setReturn(vSellersNum);

	vSellersStatus.required = false;
	expression.setReturn(vSellersStatus);

	vMaxDollar.required = false;
	expression.setReturn(vMaxDollar);
}
