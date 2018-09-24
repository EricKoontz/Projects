var array = [];
// set password to "Accela"

var sql = "DECLARE @HAVE_ADAPTER_REC	FLOAT; \
DECLARE @SEQ				FLOAT;			 \
DECLARE @AGENCY_ID			VARCHAR(200);	\
DECLARE @ADAPTER_NAME		VARCHAR(50);	 \
DECLARE @ADAPTER_CONF		VARCHAR(1000);	 \
DECLARE @GATEWAY_CONF		VARCHAR(1000);	 \
DECLARE @GATEWAY_URL_PARAMETERS		VARCHAR(1000); \
DECLARE @MERCHANT_CONF			VARCHAR(1000); \
 \
BEGIN \
  set @AGENCY_ID		='BCC'; \
  set @ADAPTER_NAME 	='PAYLEAP_PREPROD'; \
  set @ADAPTER_CONF	='Adapter=Redirect'; \
  set @GATEWAY_CONF	='HostURL=https://fd-preprod.bcc.ca.gov/firstdata-0.1/initiatePayment'; \
  set @GATEWAY_URL_PARAMETERS = ''; \
  set @MERCHANT_CONF	='ApplicationID=101'; \
 \
	set @HAVE_ADAPTER_REC =0; \
 \
	SELECT @HAVE_ADAPTER_REC = count(*) \
	FROM XPOLICY \
	WHERE SERV_PROV_CODE = @AGENCY_ID \
	AND POLICY_NAME = 'PaymentAdapterSec' \
	AND LEVEL_TYPE = 'Adapter' \
	AND LEVEL_DATA = @ADAPTER_NAME; \
	IF (@HAVE_ADAPTER_REC <= 0) \
	BEGIN \
		SELECT @SEQ=T.LAST_NUMBER       \
		FROM AA_SYS_SEQ T \
		WHERE T.SEQUENCE_NAME = 'XPOLICY_SEQ' \
 \
		SET @SEQ = @SEQ + 1; \
 \
		INSERT INTO XPOLICY \
			(SERV_PROV_CODE, POLICY_SEQ, POLICY_NAME, LEVEL_TYPE, LEVEL_DATA, DATA1, RIGHT_GRANTED, \
			STATUS, REC_DATE, REC_FUL_NAM, REC_STATUS, MENUITEM_CODE, DATA2, DATA3, DATA4, MENU_LEVEL, \
			DATA5, RES_ID) \
		VALUES \
			(@AGENCY_ID, @SEQ, 'PaymentAdapterSec', 'Adapter', @ADAPTER_NAME, @ADAPTER_CONF, 'F', \
			'A', GETDATE(), 'ADMIN', 'A', '', @GATEWAY_CONF, @GATEWAY_URL_PARAMETERS, @MERCHANT_CONF, \
			'', '', ''); \
 \
		UPDATE AA_SYS_SEQ SET LAST_NUMBER = @SEQ WHERE SEQUENCE_NAME = 'XPOLICY_SEQ' \
	END \
 \
	UPDATE XPOLICY \
	SET  \
		DATA1=@ADAPTER_CONF, \
		DATA2=@GATEWAY_CONF, \
		DATA3=@GATEWAY_URL_PARAMETERS, \
		DATA4=@MERCHANT_CONF, \
		REC_DATE=GETDATE(), \
		REC_FUL_NAM='ADMIN' \
	WHERE SERV_PROV_CODE = @AGENCY_ID \
	AND POLICY_NAME = 'PaymentAdapterSec' \
	AND LEVEL_TYPE = 'Adapter' \
	AND LEVEL_DATA = @ADAPTER_NAME \
 \
   \
END ";

//var sql = "SELECT * FROM xpolicy where policy_name = 'PaymentAdapterSec' and serv_prov_code = 'BCC'"


    var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
    var ds = initialContext.lookup("java:/AA");
    var conn = ds.getConnection();
    var sStmt = conn.prepareStatement(sql);
 sStmt.execute();
/*
   while (rSet.next()) {
        var obj = {};
        var md = rSet.getMetaData();
        var columns = md.getColumnCount();
        for (i = 1; i <= columns; i++) {
            obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
        }
        obj.count = rSet.getRow();
        array.push(obj)
    }

*/
    aa.env.setValue("returnCode", "0"); // success
    aa.env.setValue("returnValue", JSON.stringify(array));
    aa.print(JSON.stringify(array));
    sStmt.close();
    conn.close();




