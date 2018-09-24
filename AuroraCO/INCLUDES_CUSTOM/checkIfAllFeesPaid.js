
function checkIfAllFeesPaid() {
	try {
		if (wfTask == "Signatures" && wfStatus == "Routed for Signatures") {
			// check balance & fees of status New
			if (balanceDue > 0) {
				throw "Route for Signatures requires all fees to be paid";
			}else {
				// check fees status
				var fees = loadFees();
				for ( var i in fees) {
					var feeStatus = fees[i].status;
					if (feeStatus == "NEW") {
						throw "Route for Signatures requires all fees to be paid";
					}

				}

			}
		}
		
	} catch (e) {
		cancel = true;
		showMessage = true;
		comment(e);
	}
}