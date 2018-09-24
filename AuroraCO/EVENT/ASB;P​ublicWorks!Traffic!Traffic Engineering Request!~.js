/* Title :  Require Address, Cross Street or Parcel on Record submission (ApplicationSubmitBefore)

Purpose :  If the user does not provide an Address, Address Cross Street(Also address fields) or a parcel then display an error
message to the user that "You must supply an address, intersection or a parcel before proceeding" and stop the user from
moving forward.

Author :   Israa Ismail

Functional Area : Records 

Notes : 
	-If no Address and no Parcel entered,then stop moving forward.
	-If Address available but the fields "CrossStreetNameStart" & "CrossStreetNameEnd" are empty (or the Address RefID is not available)
	 and No Parcel Entered as well then stop moving forward.
*/

checkIfAddressParcelExistOnCap();
