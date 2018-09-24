function checkIfAddressParcelExistOnCap(){
	try{
		var addressP =checkAddressOnCap();
		var ParcelP= checkParcelOnCap();
			
		if (addressP==false && ParcelP==false){
			throw "You must supply an address, intersection or a parcel before proceeding" ;
		}	
		
	}catch(e){
		cancel = true;
		showMessage = true;
		comment(e);
	}
}