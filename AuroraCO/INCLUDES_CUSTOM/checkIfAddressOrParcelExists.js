function checkIfAddressOrParcelExists(){
try{
	if (!(checkAddressOnCap() || checkParcelOnCap())){
		throw "Address or Parcel is required" ;
	}
}catch(e){
	cancel = true;
	showMessage = true;
	comment(e);
}
}