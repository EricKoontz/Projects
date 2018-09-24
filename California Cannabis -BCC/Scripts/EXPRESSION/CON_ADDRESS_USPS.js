// Get AA script root
var aa = expression.getScriptRoot();

// Get expression fields
var vUserID = expression.getValue("$$userID$$").value;
var vUserGroup = expression.getValue("$$userGroup$$").value;
var vGAUserID = expression.getValue("$$gaUserID$$").value;
var vAddrType = expression.getValue("CONTACTADDR::addressType");
var vStreetNbr = expression.getValue("CONTACTADDR::houseNumberStart");
var vPrefix = expression.getValue("CONTACTADDR::streetPrefix");
var vStreetName = expression.getValue("CONTACTADDR::streetName");
var vStreetType = expression.getValue("CONTACTADDR::streetSuffix");
var vDirection = expression.getValue("CONTACTADDR::streetSuffixDirection");
var vUnitNbr = expression.getValue("CONTACTADDR::unitStart");
var vUnitType = expression.getValue("CONTACTADDR::unitType");
var vCity = expression.getValue("CONTACTADDR::city");
var vState = expression.getValue("CONTACTADDR::state");
var vZip = expression.getValue("CONTACTADDR::zip");
var vForm = expression.getValue("CONTACTADDR::FORM");
var vAddrLine1 = expression.getValue("CONTACTADDR::addressLine1");
var vAddrLine2 = expression.getValue("CONTACTADDR::addressLine2");
var vAddrValidated = expression.getValue("CONTACTADDR::validateFlag");

// Get USPS connection information
var URL = lookup("Address Verification Interface Settings", "USPS Endpoint");
var USPSUser = lookup("Address Verification Interface Settings", "USPS UserID");
var Parms = "API=Verify&XML=<AddressValidateRequest%20USERID=%22" + USPSUser + "%22><Address ID=%220%22><Address1></Address1><Address2></Address2><City></City><State></State><Zip5></Zip5><Zip4></Zip4></Address></AddressValidateRequest>";

// Set override user groups
var bypassBlock = ("LicensesAccelaAdmin" == String(vUserGroup) || "LicensesAgencyAdmin" == String(vUserGroup) || "Licenses Super User" == String(vUserGroup));

// Build single address line
var addPart;
var addressInALine = vStreetNbr.value;
addPart = vDirection.value;
if (addPart && addPart != "" && addPart != null) {
	addressInALine += " " + addPart;
}
addPart = vStreetName.value;
if (addPart && addPart != "" && addPart != null) {
	addressInALine += " " + addPart.trim();
}
addPart = vStreetType.value;
if (addPart && addPart != "" && addPart != null) {
	addressInALine += " " + addPart;
}

var publicUser = false;
if ("" + vGAUserID == "") {
	publicUser = true;
}

var message = "";

// Update Parms variable with address information
if (vAddrType.value == "Premise") {
	if ((vUnitNbr.value != null && vUnitNbr.value != "")) {
		Parms = replaceNode(Parms, "Address1", vUnitNbr.value);
	}
	Parms = replaceNode(Parms, "Address2", addressInALine);
	Parms = replaceNode(Parms, "City", vCity.value);
	Parms = replaceNode(Parms, "State", vState.value);
	Parms = replaceNode(Parms, "Zip5", vZip.value);

	// Submit address info to USPS for verification
	var rootNode = aa.util.httpPost(URL, Parms).getOutput();

	// Error trap a failed web service call
	ans = getNode(rootNode, "Error");
	if (ans.length > 0) {
		if (publicUser) {
			vForm.message = "The address you entered is not valid according to the US Postal Service. </BR> " + getNode(ans, "Description") + "</BR> Please contact the Bureau at 833-768-5880 if you believe you are receiving this message in error.";
		} else {
			expression.addMessage("The address you entered is not valid according to the US Postal Service. </BR>" + getNode(ans, "Description") + " </BR>Please contact the Bureau at 833-768-5880 if you believe you are receiving this message in error.");
		}
		if (!bypassBlock) {
			vForm.blockSubmit = true;
		}
		expression.setReturn(vForm);
<<<<<<< .mine
	} 
	// No WS call error. Begin processing response
	else {	
		// If the expression's street type was not provided, parse response for street type and add it to addressInALine for comparison
		// DMH - removed 3/23 per Tosh
		//if (vStreetType.value == "" || vStreetType.value == null) {
		//	var vWSStreetType = parseStreetType(getNode(rootNode, "Address2"));			
		//	if (vWSStreetType != null && vWSStreetType != "") {
		//		addressInALine += " " + vWSStreetType;
		//		// Save street type back to expression
		//		vStreetType.value = vWSStreetType;
		//		expression.setReturn(vStreetType);
		//	}
	//	}
||||||| .r1208
	}
	else {
=======
	} 
	// No WS call error. Begin processing response
	else {	
		// If the expression's street type was not provided, parse response for street type and add it to addressInALine for comparison
		if (vStreetType.value == "" || vStreetType.value == null) {
			var vWSStreetType = parseStreetType(getNode(rootNode, "Address2"));			
			if (vWSStreetType != null && vWSStreetType != "") {
				addressInALine += " " + vWSStreetType;
				// Save street type back to expression
				vStreetType.value = vWSStreetType;
				expression.setReturn(vStreetType);
			}
		}
>>>>>>> .r1275
		
		var addressLine1 = "" + getNode(rootNode, "Address2");
		var state = "" + getNode(rootNode, "State");
		// Check is address is a match
		if (addressLine1 == addressInALine && state == ("" + vState.value)) {
			newZip = "" + getNode(rootNode, "Zip5");
			newZip = newZip.trim();
			zip4 = "" + getNode(rootNode, "Zip4");
			zip4 = zip4.trim();
			if (publicUser) {
				if (zip4 && zip4 != "") {
					newZip = newZip + "-" + zip4;
				}
			} else {
				newZip = newZip + zip4;
			}
			// Update expression address fields City and Zip
			vZip.value = newZip;
			expression.setReturn(vZip);
			vCity.value = getNode(rootNode, "City");
			expression.setReturn(vCity);
			
			// Update expression address line 1 and 2 for display purposes.
			vAddrLine1.value = addressInALine; ;
			expression.setReturn(vAddrLine1);
			vAddrLine2.value = vUnitNbr.value + ((vUnitType.value != "" && vUnitType.value != null) ? " " + vUnitType.value : "");
			expression.setReturn(vAddrLine2);
			
			// Update address validated flag - not working, doesn't ever save back to address
			/*
			vAddrValidated.value = "Y";
			expression.setReturn(vAddrValidated);
			*/
			
			expression.addMessage(vUserGroup + "Address has validated with USPS");	
			
			vForm.blockSubmit = false;
			expression.setReturn(vForm);
		} else {
			whichError = "";
			if (addressLine1 == addressInALine)
				whichError = "Invalid state";
			else
				whichError = "Invalid street address";
			if (publicUser) {
				vForm.message = "The address you entered is not valid according to the US Postal Service. " + whichError + ". Please contact the Bureau at 833-768-5880 if you believe you are receiving this message in error.";

			} else {
				expression.addMessage("The address you entered is not valid according to the US Postal Service. " + whichError + ". Please contact the Bureau at 833-768-5880 if you believe you are receiving this message in error.");
			}
			if (!bypassBlock) {
				vForm.blockSubmit = true;
			}
			expression.setReturn(vForm);
		}
	}
}
//////////////////// Functions Below ///////////////////////
function lookup(stdChoice, stdValue) {

	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);
	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		var strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
	}
	return strControl;
}

function unescape(s) {
	s = String(s);
	var n = s.length;
	var result = "";

	for (var k = 0; k < n; k++) {
		var c = s[k];
		if (c == '%') {
			if (k <= (n - 6)) {
				if (s[k + 1] == 'u') {
					if (("0123456789abcdef").indexOf(s[k + 2]) > -1 &&
						("0123456789abcdef").indexOf(s[k + 3]) > -1 &&
						("0123456789abcdef").indexOf(s[k + 4]) > -1 &&
						("0123456789abcdef").indexOf(s[k + 5]) > -1) {
						c = String.fromCharCode(parseInt(s.substring(k + 2, k + 7), 16));
						k = k + 5;
					} else {
						if (k <= (n - 3) &&
							("0123456789abcdef").indexOf(s[k + 1]) > -1 &&
							("0123456789abcdef").indexOf(s[k + 2]) > -1) {
							c = String.fromCharCode(parseInt(("00" + s.substring(k + 1, k + 3)), 16));
							k = k + 2;
						}
					}
				} else {
					if (k <= (n - 3) &&
						("0123456789abcdef").indexOf(s[k + 1]) > -1 &&
						("0123456789abcdef").indexOf(s[k + 2]) > -1) {
						c = String.fromCharCode(parseInt(("00" + s.substring(k + 1, k + 3)), 16));
						k = k + 2;
					}
				}
			} else if (("0123456789abcdef").indexOf(s[k + 1]) > -1 &&
				("0123456789abcdef").indexOf(s[k + 2]) > -1) {
				c = String.fromCharCode(parseInt(("00" + s.substring(k + 1, k + 3)), 16));
				k = k + 2;
			}
		}
		result = result + c;
	}
	return result;
}

function replaceNode(fString, fName, fContents) {

	var fValue = "";
	var startTag = "<" + fName + ">";
	var endTag = "</" + fName + ">";

	startPos = fString.indexOf(startTag) + startTag.length;
	endPos = fString.indexOf(endTag);
	// make sure startPos and endPos are valid before using them
	if (startPos > 0 && startPos <= endPos) {
		fValue = fString.substring(0, startPos) + fContents + fString.substring(endPos);
		return unescape(fValue);
	}
}

function getNode(fString, fName) {
	var fValue = "";
	var startTag = "<" + fName + ">";
	var endTag = "</" + fName + ">";

	startPos = fString.indexOf(startTag) + startTag.length;
	endPos = fString.indexOf(endTag);
	// make sure startPos and endPos are valid before using them
	if (startPos > 0 && startPos < endPos)
		fValue = fString.substring(startPos, endPos);

	return unescape(fValue);
}

function parseStreetType(vAddressLine) {
	var stdChoice = "STREET SUFFIXES";
	var bizDomScriptResult;
	var bizDomScriptObj;
	var bizDomScriptObjArry;
	var bizDomScriptModel;
	var bizDomValue;
	var x = 0;
	var vReturn = "";

	bizDomScriptResult = aa.bizDomain.getBizDomain(stdChoice);
	if (bizDomScriptResult.getSuccess()) {
		bizDomScriptObj = bizDomScriptResult.getOutput();
		bizDomScriptObjArry = bizDomScriptObj.toArray();
		for (x in bizDomScriptObjArry) {
			bizDomScriptModel = bizDomScriptObjArry[x];
			bizDomValue = bizDomScriptModel.getBizdomainValue();
			// Check to see if bizDomValue exists in vAddressLine
			if (vAddressLine.indexOf(" " + bizDomValue) != -1) {
				vReturn = bizDomValue;
			}
		}
	}
	return vReturn;
}