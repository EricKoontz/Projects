/* user story 2790.   Hide the owner submittal text if not an application */

if ($('a#ctl00_PlaceHolderMain_addressList_ctl00_agenciesList_ctl00_capsList_ctl00_hlCAPDetail:contains("-APP")').length > 0) {
	/* do nothing*/
} else {
	$('#BCC_OWNER_RECEIPT_TEXT').hide();
}
