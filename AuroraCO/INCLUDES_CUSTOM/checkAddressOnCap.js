function checkAddressOnCap(){
	// if all address required fields are empty , then no address provided
	if (!isBlankOrNull(AddressHouseNumber) || !isBlankOrNull(AddressStreetName) || !isBlankOrNull(AddressValidatedNumber)){
		return true;
	}	
	return false ;
}