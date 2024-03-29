/* 
* SCRIPT 376
*/
var batchJobName = "" + aa.env.getValue("BatchJobName");	// Name of the batch job

var SCRIPT_VERSION = 3.0;
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM", null, true));


eval(getScriptText("INCLUDES_BATCH"));

function getScriptText(e) {
	var t = aa.getServiceProviderCode();
	if (arguments.length > 1)
		t = arguments[1];
	e = e.toUpperCase();
	var n = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var r = n.getScriptByPK(t, e, "ADMIN");
		return r.getScriptText() + ""
	} catch (i) {
		return ""
	}
}


notifyOverdueIssuedPermits("Water", "Water", "SWMP", "Permit");


function notifyOverdueIssuedPermits(grp, typ, stype, cat){
    var idx,
        lic,
        expAccDate,
        expJsDate,
        expSince,
        capScript,
        minExpDaysAllowed = 30,
        eParams,
        capScriptList = aa.cap.getByAppType(grp, typ, stype, cat).getOutput();
    
    for(idx in capScriptList) {
        capScript = capScriptList[idx];
        if(ifTracer(capScript.getCapStatus() == "Issued", "Record status = Issued")) {
        //    capScript.capModel.expDate = new Date(2018,4,3);
            lic = aa.expiration.getLicensesByCapID(capScript.capID).getOutput();
            if(lic != null && lic.getExpDate != null) {// && lic.expStatus == 'Active') {
                aa.print('record id - ' + capScript.capID.getCustomID());
                expAccDate = lic.getExpDate();
                if(expAccDate != null) {
                    expJsDate = new Date(expAccDate.year, expAccDate.month-1, expAccDate.dayOfMonth);
                    aa.print('expJsDate - ' + expJsDate);
                    expSince = dateDiff(new Date().setHours(0,0,0,0), expJsDate);
                    aa.print('expSince - ' + expSince);
                    if (expSince == minExpDaysAllowed) {
                        capId=capScript.getCapID();
                        aa.print("sending email, cap id = " + capId.getCustomID());
                        //send email
                        eParams = aa.util.newHashtable();
                        emailContacts("Applicant", "WAT RENEWAL OF SWMP PERMIT # 376", eParams, "",  aa.util.newHashtable());
                        //change renewal status
                        lic.setExpStatus("About to Expire");
                        aa.expiration.editB1Expiration(lic.getB1Expiration());
                        //updateAppStatus("About to Expire","Updated via Batch Job : " + batchJobName, capScript.getCapID());
                    } 
                }
            }
        }
    }
}
