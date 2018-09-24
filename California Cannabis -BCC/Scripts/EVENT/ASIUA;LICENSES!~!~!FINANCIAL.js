if (parentCapId) {
	if (appMatch("Licenses/Adult Use Cannabis/*/*", parentCapId) || appMatch("Licenses/Medical Cannabis/*/*", parentCapId)) {
		logDebug("executing COMMERCIAL_CHECK_FOR_CONTACT_WITH_LAB_FIN");
		include("COMMERCIAL_CHECK_FOR_CONTACT_WITH_LAB_FIN");
	}

	if (appMatch("Licenses/Cannabis/*/*", parentCapId)) {
		logDebug("executing LAB_CHECK_FOR_CONTACT_WITH_RETAILER_FIN");
		include("LAB_CHECK_FOR_CONTACT_WITH_RETAILER_FIN");
	}

}
