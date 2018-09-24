var pf = ["BLD Commercial Add-Alter","BLD Commercial Demo","BLD Grading","BLD Pool - Comm","BLD Pool - Res","BLD Residential","BLD Re-Roof","BLD Residential Add-Alter","BLD Residential Demo","BLD Sign - Temporary","BLD Solar Permit","BLD Trade Permits","BLD sign - Permanent","EH_BAF_APP","EH_CMP","EH_FOOD","EH_INST","EH_OWTS_APP","EH_POOL_APP","EH_WW_APP","Enforcement Complaint","LIC Business No Address","LIC Business Renewal no Address","LIC Business Renewal no Address - ASIT","LIC Business Renewal with address","Test","Service Request","PL_STANDARD","PLN Home Occ","LIC_UPLOAD_DOCUMENTS","LIC_EDIT_CONTACTS","LIC Pet License Renewal","LIC Pet License Application","LIC Medical Marijuana - CA","LIC Marijuana With Address - ASIT","LIC Marijuana Renewal With Address-ASIT","LIC Garage-Sale","LIC Event Application","LIC Default","LIC Contractor Renewal","LIC Contractor General","LIC Business with Address - ASIT","LIC Business With Address"]
var pf = ["PLN Standard"];
var m = "Licenses";

var c = aa.proxyInvoker.newInstance("com.accela.pa.configpageflow.PageFlowConfigBusiness").getOutput();
aa.print("instantiated " + c);

for (var p in pf)
{
var r = c.deletePageFlowGroup(aa.getServiceProviderCode(),m,pf[p],"ADMIN");
aa.print("no return code so hopefully page flow code " + pf[p] + " is gone now.");
}
				