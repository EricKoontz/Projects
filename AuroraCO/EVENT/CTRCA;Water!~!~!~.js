/* Title :  Add APO Data that is not provided (ApplicationSubmitAfter,ConvertToRealCapAfter)

Purpose :  If the record has data for Address or Owner or Parcel then using whichever of the 3 that are provided return any of the data
that was not provided and add it to the record. Example – If the user provides the address but not parcel or owner
information use the address data to check external APO and add the Parcel and Owner information if it is available. The
same situation should happen for the other elements if the other data(User provides Parcel or User provides Owner).
NOTE – We cannot use standard APO external APO functionality that is returned because the customer does not
necessarily want Address, Parcel and Owner components in the page flow in ACA and the data is not returned unless
those components are in the page flow so this is why we are requesting this script.

Author :   Israa Ismail

Functional Area : Records
 
Notes : 
	-For the event ApplicationSubmitAfter use the variable !publicUser as used in this sample,else (in convertToRealCapAfter) remove it.

Sample Call : addNotProvidedAPOData()

*/


if (!publicUser) addNotProvidedAPOData();
