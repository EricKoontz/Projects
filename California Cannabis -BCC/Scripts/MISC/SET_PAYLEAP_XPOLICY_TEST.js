var array = [];
// set password to "Accela"
// for Oracle

var sql = "DECLARE \
    HAVE_ADAPTER_REC        NUMBER; \
    SEQ                NUMBER;        \
    AGENCY_ID            VARCHAR2(200);  \
    ADAPTER_NAME            VARCHAR2(50);  \
    ADAPTER_CONF            VARCHAR2(1000);  \
    GATEWAY_CONF            VARCHAR2(1000); \
    GATEWAY_URL_PARAMETERS        VARCHAR2(1000);  \
    MERCHANT_CONF            VARCHAR2(1000);     \
BEGIN \
 AGENCY_ID        :='BCC'; \
 ADAPTER_NAME     :='PAYLEAP_TEST'; \
 ADAPTER_CONF    :='Adapter=Redirect'; \
 GATEWAY_CONF    :='HostURL=https://fd-test.bcc.ca.gov/firstdata-0.1/initiatePayment'; \
 GATEWAY_URL_PARAMETERS := ''; \
 MERCHANT_CONF    :='ApplicationID=101'; \
    HAVE_ADAPTER_REC :=0; \
    SELECT count(*) into HAVE_ADAPTER_REC \
    FROM XPOLICY \
    WHERE SERV_PROV_CODE = AGENCY_ID \
    AND POLICY_NAME = 'PaymentAdapterSec' \
    AND LEVEL_TYPE = 'Adapter' \
    AND LEVEL_DATA = ADAPTER_NAME; \
    IF (HAVE_ADAPTER_REC <= 0) THEN   \
        SELECT T.LAST_NUMBER \
        INTO SEQ \
        FROM AA_SYS_SEQ T \
        WHERE T.SEQUENCE_NAME = 'XPOLICY_SEQ'; \
        SEQ := SEQ + 1; \
        INSERT INTO XPOLICY \
            (SERV_PROV_CODE, POLICY_SEQ, POLICY_NAME, LEVEL_TYPE, LEVEL_DATA, DATA1, RIGHT_GRANTED, \
            STATUS, REC_DATE, REC_FUL_NAM, REC_STATUS, MENUITEM_CODE, DATA2, DATA3, DATA4, MENU_LEVEL, \
            DATA5, RES_ID) \
        VALUES \
            (AGENCY_ID, SEQ, 'PaymentAdapterSec', 'Adapter', ADAPTER_NAME, ADAPTER_CONF, 'F', \
            'A', SYSDATE, 'ADMIN', 'A', '', GATEWAY_CONF , GATEWAY_URL_PARAMETERS, MERCHANT_CONF, '', \
            '', ''); \
        UPDATE AA_SYS_SEQ SET LAST_NUMBER = SEQ WHERE SEQUENCE_NAME = 'XPOLICY_SEQ'; \
    END IF; \
    UPDATE XPOLICY \
    SET  \
        DATA1=ADAPTER_CONF, \
        DATA2=GATEWAY_CONF , \
        DATA3=GATEWAY_URL_PARAMETERS, \
        DATA4=MERCHANT_CONF, \
        REC_DATE=SYSDATE, \
        REC_FUL_NAM='ADMIN' \
    WHERE SERV_PROV_CODE = AGENCY_ID \
    AND POLICY_NAME = 'PaymentAdapterSec' \
    AND LEVEL_TYPE = 'Adapter' \
    AND LEVEL_DATA = ADAPTER_NAME; \
 COMMIT; \
END; ";

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




