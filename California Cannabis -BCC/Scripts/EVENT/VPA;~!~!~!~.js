
/*
// disabling 6/27 JHS.   Error on addFee.

var voidPaymentNumbers = aa.env.getValue("VoidPaymentNbrArray");
var cb = aa.proxyInvoker.newInstance("com.accela.aa.finance.cashier.CashierBusiness").getOutput();
var pm = aa.proxyInvoker.newInstance("com.accela.aa.finance.cashier.PaymentModel").getOutput();
var recordList = [];

for (var i = 0; i < voidPaymentNumbers.length; i++) {
	var voidPaymentNbr = voidPaymentNumbers[i];
	pm.setPaymentSeqNbr(voidPaymentNbr);
	var pl = cb.getPaymentsByPaymentModel(aa.getServiceProviderCode(), pm)
		if (pl) {
			pl = pl.toArray();
			for (var j = 0; j < pl.length; j++) {
				recordList.push(pl[j].getCapID().toString());
				}
			}
	}

	var recListUnique = recordList.filter(function (x, i, a) {
			return a.indexOf(x) == i;
		});

	// User Story 270 - add NSF Fee and Condition based on void

	var reason = aa.env.getValue("Reason");

	for (i in recListUnique) {
		if (reason.equals("Dishonored Check")) {
			capId = aa.cap.getCapID(recListUnique[i]).getOutput();
			addFee("NSF_CHECK", "MISC_FEES", "FINAL", 1, "Y",capId);
			addStdCondition("License Conditions", "Dishonored Check",capId);
		}
	}
	
*/
