/* 186 - ENF WO UNIT PRICE 
 * Update Unit Price in Custom List WORK ORDER for Work Order record.
 * When the Work Item is selected, cross reference the Item name to the Standard Choice FNO_WO_UNIT_PRICE and assign the Value Desc referenced in the Standard Choice as the Unit Price for the Work Item.
 */
var toPrecision=function(value){
  var multiplier=10000;
  return Math.round(value*multiplier)/multiplier;
}
function addDate(iDate, nDays){ 
    if(isNaN(nDays)){
        throw("Day is a invalid number!");
    }
    return expression.addDate(iDate,parseInt(nDays));
}

function diffDate(iDate1,iDate2){
    return expression.diffDate(iDate1,iDate2);
}

function parseDate(dateString){
    return expression.parseDate(dateString);
}

function formatDate(dateString,pattern){ 
    if(dateString==null||dateString==''){
        return '';
    }
    return expression.formatDate(dateString,pattern);
}

var aa = expression.getScriptRoot();

function lookupCustom(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        var strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        ;//logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else {
        ;//logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
}

var servProvCode=expression.getValue("$$servProvCode$$").value;
var variable0=expression.getValue("ASIT::WORK ORDER::Work Items");
var variable1=expression.getValue("ASIT::WORK ORDER::Unit Price");
var asitForm = expression.getValue("ASIT::WORK ORDER::FORM");
var workItem = variable0.value;
var unitPrice = "";

var totalRowCount = expression.getTotalRowCount();
try{
    for(var rowIndex=0; rowIndex<totalRowCount; rowIndex++){
        
        variable1=expression.getValue(rowIndex, "ASIT::WORK ORDER::Unit Price");
        variable0=expression.getValue(rowIndex, "ASIT::WORK ORDER::Work Items");
		workItem = variable0.value;
		
		unitPrice = lookupCustom("FNO_WO_UNIT_PRICE", workItem);
		
		//If Unit Price is blank then update with value from Standard Choice.
        if(variable1.value== ""){
           variable1.value=toPrecision(unitPrice);
           expression.setReturn(rowIndex,variable1);
        }
    }
}
catch(err){
	asitForm.message = err;
	expression.setReturn(asitForm)
}