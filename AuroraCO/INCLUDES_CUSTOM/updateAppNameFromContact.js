/**
 * If Contact type on record = Qualified Professional, populate the Legal Entity Name (Application Name field) with
concatinated FirstName+LastName or Organization Name
 */
function updateAppNameFromContact() {
	var contactType = "Qualified Professional";
	var contacts = aa.people.getCapContactByCapID(capId);
	if (contacts.getSuccess()) {
		contacts = contacts.getOutput();
		var newAppName = null;
		for (c in contacts) {
			conModel = contacts[c].getCapContactModel();
			if (conModel.getContactType() == contactType) {
				if ((conModel.getFirstName() == null || conModel.getFirstName().trim() == "") && (conModel.getLastName() == null || conModel.getLastName().trim() == "")) {
					newAppName = conModel.getBusinessName();
					break;
				} else {
					newAppName = conModel.getFirstName().trim() + " " + conModel.getLastName().trim()
					break;
				}
			}//Qualified Professional
		}//for all contacts

		if (newAppName != null) {
			editAppName(newAppName);
		}
	}//get contacts success
}
