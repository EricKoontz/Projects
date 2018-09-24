var servProvCode = expression.getValue("$$servProvCode$$").value;
var vAddrType = expression.getValue("CONTACTADDR::addressType");
var vAddrLine1 = expression.getValue("CONTACTADDR::addressLine1");
var vAddrLine2 = expression.getValue("CONTACTADDR::addressLine2");
var vStreetNbr = expression.getValue("CONTACTADDR::houseNumberStart");
var vPrefix = expression.getValue("CONTACTADDR::streetPrefix");
var vStreetName = expression.getValue("CONTACTADDR::streetName");
var vStreetType = expression.getValue("CONTACTADDR::streetSuffix");
var vDirection = expression.getValue("CONTACTADDR::streetSuffixDirection");
var vUnitNbr = expression.getValue("CONTACTADDR::unitStart");
var vUnitType = expression.getValue("CONTACTADDR::unitType");
var vState = expression.getValue("CONTACTADDR::state");

if (vAddrType.value == "Premise") {
	//Show specific address field. This will be used to create the transactional address on the record.
	//Future interface with USPS may require data in this format for verification.
	vStreetNbr.hidden = false;
	vStreetNbr.required = true;
	expression.setReturn(vStreetNbr);
	
	vPrefix.hidden = true;
	expression.setReturn(vPrefix);
	
	vStreetName.hidden = false;
	vStreetName.required = true;
	expression.setReturn(vStreetName);
	
	vStreetType.hidden = false;
	//vStreetType.required = true;
	expression.setReturn(vStreetType);
	
	vDirection.hidden = false;
	expression.setReturn(vDirection);
	
	vUnitNbr.hidden = false;
	expression.setReturn(vUnitNbr);
	
	vUnitType.hidden = false;
	expression.setReturn(vUnitType);	
	
	//Hide Address Line 1 and 2
	vAddrLine1.hidden = true;
	vAddrLine1.required = false;
	expression.setReturn(vAddrLine1);
	
	vAddrLine2.hidden = true;
	vAddrLine2.required = false;
	expression.setReturn(vAddrLine2);
	
// DMH - USPS interface now does this.
	//Onsubmit copy specific fields to Address Line 1
	//This will make the display more like the other contact address types.
	//	  	    vAddrLine1.value = vStreetNbr.value + " "  + ((vDirection.value != "" && vDirection.value != null) ? vDirection.value : vStreetName.value) + " " + vStreetType.value;
	//expression.setReturn(vAddrLine1);
	
	//vAddrLine2.value = vUnitNbr.value + ((vUnitType.value != "" && vUnitType.value != null) ? " " + vUnitType.value : "");
	//expression.setReturn(vAddrLine2);
	
	vState.value = "CA";
	vState.readOnly = true;
	expression.setReturn(vState);	
}
else {
	//Hide specific address field.
	//Future interface with USPS may require data in this format for verification.
	vStreetNbr.hidden = true;
	vStreetNbr.required = false;
	expression.setReturn(vStreetNbr);
	
	vPrefix.hidden = true;
	expression.setReturn(vPrefix);
	
	vStreetName.hidden = true;
	vStreetName.required = false;
	expression.setReturn(vStreetName);
	
	vStreetType.hidden = true;
	vStreetType.required = false;
	expression.setReturn(vStreetType);
	
	vDirection.hidden = true;
	expression.setReturn(vDirection);
	
	vUnitNbr.hidden = true;
	expression.setReturn(vUnitNbr);
	
	vUnitType.hidden = true;
	expression.setReturn(vUnitType);	
	
	//Show Address Line 1 and 2
	vAddrLine1.hidden = false;
	vAddrLine1.required = true;
	expression.setReturn(vAddrLine1)
	
	vAddrLine2.hidden = false;
	vAddrLine2.required = false;
	expression.setReturn(vAddrLine2)
	
	vAddrType.value == "Mailing";
	vState.readOnly = false;
	expression.setReturn(vState);
}