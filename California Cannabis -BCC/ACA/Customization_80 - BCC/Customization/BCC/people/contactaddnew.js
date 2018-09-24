function pageLoad() { 
	if ($('#ctl00_PlaceHolderMain_BreadCrumpToolBar').length > 0){
		sessionStorage.isAmendment = $('#ctl00_PlaceHolderMain_BreadCrumpToolBar:contains("Submit Contact Information")').length > 0;
		sessionStorage.isRenewal = $('#ctl00_PlaceHolderMain_BreadCrumpToolBar:contains("Renewal")').length > 0;		
    }

	//console.log("I am an amendment : " + sessionStorage.isAmendment);

	if (sessionStorage.isAmendment == "true" || sessionStorage.isRenewal == "true" ) {
		$('a[id^="ctl00_PlaceHolderMain_Contact3_"][id*="Edit_btnRemove"]').hide();
		$('div[id^="ctl00_PlaceHolderMain_Contact3_"][id*="Edit_ucContactAddressList_pnlContactAdressList"]').hide();
		$('#ctl00_phPopup_ucContactInfo_contactAddressList_pnlContactAdressList').hide();
	}
};
