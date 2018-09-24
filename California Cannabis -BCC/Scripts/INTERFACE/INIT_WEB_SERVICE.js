var url = aa.env.getValue("url");

try {
    var result = aa.util.httpPost(url,"");
    if(!result.getSuccess()) {
        aa.env.setValue("returnCode", "-1"); // error
        aa.env.setValue("returnValue", result.getErrorType() + " " + result.getErrorMessage());
        aa.print( result.getErrorType() + " " + result.getErrorMessage());
    } else {
        aa.env.setValue("returnCode", "0"); // success
        aa.env.setValue("returnValue", result.getOutput());
        aa.print(result.getOutput());
    }
} catch (err) {
	aa.env.setValue("returnCode", "-1"); // error
	aa.env.setValue("returnValue", err.message);
	aa.print(err.message);
}