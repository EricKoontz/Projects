
function pageLoad() {
	if ($('#ctl00_PlaceHolderMain_BreadCrumpToolBar').length > 0) {
		sessionStorage.isAmendment = $('#ctl00_PlaceHolderMain_BreadCrumpToolBar:contains("Submit Contact Information")').length > 0;
		sessionStorage.isRenewal = $('#ctl00_PlaceHolderMain_BreadCrumpToolBar:contains("Renewal")').length > 0;
	}

	//console.log("I am an amendment : " + sessionStorage.isAmendment);

	if (sessionStorage.isAmendment == "true" || sessionStorage.isRenewal == "true" ) {
		$('a[id^="ctl00_PlaceHolderMain_Contact3_"][id*="Edit_btnRemove"]').hide();
		$('div[id^="ctl00_PlaceHolderMain_Contact3_"][id*="Edit_ucContactAddressList_pnlContactAdressList"]').hide();
		$('#ctl00_phPopup_ucContactInfo_contactAddressList_pnlContactAdressList').hide();
	}
	
	if (sessionStorage.isRenewal == "true" ) {
		// user story 2799
		$('[id^=BCC_Add_New_Contacts').hide();
		$('[id^="ctl00_PlaceHolderMain_Contact"][id*="Edit_ucContactAddressList_lblContactAddressListInstruction"]').hide();
	}

	var getUrlParameter = function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	};

	/*
	Defect 2693.  Since we are re-using the application contact amendment record and page flow,
	We need a way to change the ACA language specifically for the point of contact in order to remove the Track and
	Trace language which is not applicable for Event applications.

	This script will determine if we are amending a CEO application, and update the html accordingly.
	 */
	var newLanguage = "<span style='color: red; line-height: 115%; font-family:Tahoma,sans-serif; font-size: 9pt; mso-fareast-font-family: Calibri; mso-fareast-theme-font: minor-latin; mso-ansi-language: EN-US; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;'>*</span>The &quot;Select from Account&quot; button will add you as the primary contact person for this application. If you would like to designate someone else as the primary contact person, please click the &quot;add new&quot; button.";
	var CEORecordFilter = "CEO14_APP_AMD";
	var CEO_PCP_Label = "Primary Contact Person";

	if ($('[id^=ctl00_PlaceHolderMain_lbl]:contains(' + CEO_PCP_Label + ')').length > 0) {
		if (getUrlParameter('FilterName') && getUrlParameter('FilterName').indexOf(CEORecordFilter) >= 0) {
			$('div[id^=ctl00_PlaceHolderMain_lbl][id*=_sub_label').html(newLanguage);
		}
	}

};
