try {
	// Begin Code needed to call master script functions ---------------------------------------------------
	function getScriptText(vScriptName, servProvCode, useProductScripts) {
		if (!servProvCode)
			servProvCode = aa.getServiceProviderCode();
		vScriptName = vScriptName.toUpperCase();
		var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
		try {
			if (useProductScripts) {
				var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
			} else {
				var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
			}
			return emseScript.getScriptText() + "";
		} catch (err) {
			return "";
		}
	}
	var SCRIPT_VERSION = 3.0;
	aa.env.setValue("CurrentUserID", "ADMIN");
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));
	eval(getScriptText("INCLUDES_CUSTOM", null, true));

	//Get Records
	var vCapList = aa.cap.getByAppType("Licenses", null, null, "License").getOutput();
	var vCap;
	var capId;
	var x = 0;
	var y = 0;
	var vAddress;
	var vAddressArray;

	var vUpdateCount = 0;
	var vNoUpdateCount = 0;
	var vNoAddressCount = 0;
	var vRecCount = 0;
	
	var geoCodeURL = lookup("Address Verification Interface Settings", "ArcGIS Endpoint");
	var findAddressCandidateResource = "/arcgis/rest/services/Location/comp_parcels_streets_poi/GeocodeServer/findAddressCandidates";
	var queryResource = "/arcgis/rest/services/Boundaries/County_NAD83/MapServer/0/query";
	var queryParams = "geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outFields=County&f=json&geometry=%%XCOORD%%,%%YCOORD%%";
	var Parms = "outFields=city&state=CA&Street=%%STREET%%&f=json&maxLocations=1&City=%%CITY%%&outFields=city&Zip=%%ZIP%%";

	aa.print("Total records to be processed: " + (vCapList.length));
	
	x = 0;
	for (x in vCapList) {
		
		vCap = vCapList[x];
		capId = vCap.getCapID();

		//if (capId.getCustomID() != "M10-0000002-LIC" && capId.getCustomID() != "M9-0000004-LIC" && capId.getCustomID() != "M12-0000008-LIC") {
		//	continue;
		//}

		aa.print("Processing: " + capId.getCustomID());
		vRecCount++;

		//get address
		vAddressArray = aa.address.getAddressByCapId(capId).getOutput();
		
		y = 0;
		
		if (vAddressArray.length == 0) {
			vNoAddressCount++;
			aa.print("No address: " + capId.getCustomID());
		}
		
		for (y in vAddressArray) {
			vAddress = vAddressArray[y];

			//aa.print("Address: " + vAddress);

			//get county information
			addr1 = "" + vAddress.getHouseNumberStart();
			if (vAddress.getStreetSuffixdirection()) {
				addr1 += " " + vAddress.getStreetSuffixdirection();
			}
			if (vAddress.getStreetName()) {
				addr1 += " " + vAddress.getStreetName();
			}
			if (vAddress.getStreetSuffix()) {
				addr1 += " " + vAddress.getStreetSuffix();
			}
			if (vAddress.getStreetPrefix()) {
				addr1 += " " + vAddress.getStreetPrefix();
			}

			//aa.print("addr1: " + addr1);

			queryParams = "geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outFields=County&f=json&geometry=%%XCOORD%%,%%YCOORD%%";
			Parms = "outFields=city&state=CA&Street=%%STREET%%&f=json&maxLocations=1&City=%%CITY%%&outFields=city&Zip=%%ZIP%%";
			Parms = Parms.replace("%%STREET%%", addr1);
			Parms = Parms.replace("%%CITY%%", "" + vAddress.getCity());
			Parms = Parms.replace("%%ZIP%%", "" + vAddress.getZip());

			postResult = aa.util.httpPost(geoCodeURL + findAddressCandidateResource, Parms);
			if (postResult.getSuccess()) {
				//aa.print("Post 1 Successful");
				jsonOutput = postResult.getOutput();
				jsonObject = JSON.parse(jsonOutput);
				jsonCandidates = jsonObject.candidates;
				if (jsonCandidates.length > 0) {
					//aa.print("We have candidates");
					firstAddress = jsonCandidates[0];
					Xcoord = firstAddress.location.x;
					Ycoord = firstAddress.location.y;
					cityName = "" + firstAddress.attributes["City"]; // Set City
					vAddress.setCity(cityName.toUpperCase());
					queryParams = queryParams.replace("%%XCOORD%%", "" + Xcoord);
					queryParams = queryParams.replace("%%YCOORD%%", "" + Ycoord);
					QPostResult = aa.util.httpPost(geoCodeURL + queryResource, queryParams);
					if (QPostResult.getSuccess()) {
						//aa.print("Post 2 Successful");
						QJsonOutput = QPostResult.getOutput();
						QJsonObject = JSON.parse(QJsonOutput);
						features = QJsonObject.features;
						firstFeature = features[0];
						countyName = "" + firstFeature.attributes["County"];
						countyNameStr = (String(countyName)).toUpperCase();
						vAddress.setCounty(countyNameStr); // Set County
						editResult = aa.address.editAddress(vAddress); // save address
						if (editResult.getSuccess()) {
							aa.print("Successfully edited address on cap");
							vUpdateCount++;

						} else {
							aa.print("Error editing cap address " + editResult.getErrorMessage());
							vNoUpdateCount++;
							aa.print(capId.getCustomID());
							aa.print(vAddress);
						}
					} else {
						aa.print("Error calling query resource " + QPostResult.getErrorMessage())
						vNoUpdateCount++;
						aa.print(capId.getCustomID());
						aa.print(vAddress);
					}

				} else {
					aa.print("No address candidates found");
					vNoUpdateCount++;					
					aa.print(capId.getCustomID());
					aa.print(vAddress);
				}
			} else {
				aa.print("Error calling findAddressCandidates resource " + postResult.getErrorMessage())
				vNoUpdateCount++;
				aa.print(capId.getCustomID());
				aa.print(vAddress);
			}

		}
		//break; // quit after updating one.
	}
	aa.print("Total records processed: " + vRecCount);
	aa.print("Update Count: " + vUpdateCount);
	aa.print("No Update Count: " + vNoUpdateCount);
	aa.print("No Address Count: " + vNoAddressCount);
} catch (err) {
	aa.sendMail("noreply@accela.com", "ewylam@etechconsultingllc.com", "", "Script Error from BCC: " + err.message, err.lineNumber + " : " + err.stack + "\r\n" + debug);
}
