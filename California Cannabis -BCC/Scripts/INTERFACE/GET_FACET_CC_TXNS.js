var array = [];
var sql = "SELECT " +
"payment.SERV_PROV_CODE, " +
"base_record.B1_PER_ID1, " +
"base_record.B1_PER_ID2, " +
"base_record.B1_PER_ID3, " +
"base_record.B1_PER_CATEGORY as RECORD_TYPE, " +
"payment.PAYMENT_SEQ_NBR as PAYMENT_ID, " +
"payment.F4PAYMENT_UDF1 as UDF1, " +
"payment.F4PAYMENT_UDF2 as UDF2, " +
"payment.F4PAYMENT_UDF3 as UDF3, " +
"fee.FEEITEM_SEQ_NBR as FEE_ID, " +
"fee.GF_DES as FEE_DESCRIPTION, " +
"payment_fee.FEE_ALLOCATION as FEE_APPLIED_PAYMENT, " +
"(select EFF_DATE from RFEE_SCHEDULE fee_schedule where fee_schedule.SERV_PROV_CODE  = fee.SERV_PROV_CODE AND fee_schedule.FEE_SCHEDULE_NAME = fee.GF_FEE_SCHEDULE " +
"AND fee_schedule.FEE_SCHEDULE_VERSION = fee.FEE_SCHEDULE_VERSION) as FISCAL_YEAR, " +
"payment.PAYMENT_DATE as COLLECTED_DATE, " +
"(select CC_TYPE from etransaction where etransaction.serv_prov_code = payment.serv_prov_code and etransaction.batch_transaction_nbr = payment.batch_transaction_nbr " +
"AND etransaction.PROC_TRANS_ID = payment.TRANSACTION_CODE) as CREDIT_CARD_TYPE, " +
"payment.RECEIPT_NBR as RECEIPT_NO," +
"licensee_address.G7_ADDRESS1 as PAYOR_ADDRESS1, " +
"licensee_address.G7_ADDRESS2 as PAYOR_ADDRESS2, " +
"licensee_address.G7_ADDRESS3 as PAYOR_ADDRESS3, " +
"licensee_address.G7_CITY as PAYOR_CITY, " +
"licensee_address.G7_COUNTRY_CODE as PAYOR_COUNTRY, " +
"licensee.B1_FNAME as PAYOR_NAME_FIRST, " +
"licensee.B1_MNAME as PAYOR_NAME_M, " +
"licensee.B1_LNAME as PAYOR_NAME_LAST, " +
"licensee.B1_PHONE1 as PAYOR_PHONE, " +
"licensee_address.G7_STATE as PAYOR_STATE, " +
"licensee_address.G7_ZIP as PAYOR_ZIP, " +
"base_record.B1_ALT_ID as LIC_NO, " +
"parent_record.B1_ALT_ID as PARENT_LIC_NO, " +
"(select R1_APP_TYPE_ALIAS from R3APPTYP WHERE (R3APPTYP.SERV_PROV_CODE = base_record.SERV_PROV_CODE AND R3APPTYP.R1_PER_GROUP = base_record.B1_PER_GROUP AND " +
    " R3APPTYP.R1_PER_TYPE = base_record.B1_PER_TYPE AND R3APPTYP.R1_PER_SUB_TYPE = base_record.B1_PER_SUB_TYPE AND R3APPTYP.R1_PER_CATEGORY = base_record.B1_PER_CATEGORY))  as LIC_TYPE," +
"(select R1_APP_TYPE_ALIAS from R3APPTYP WHERE (R3APPTYP.SERV_PROV_CODE = parent_record.SERV_PROV_CODE AND R3APPTYP.R1_PER_GROUP = parent_record.B1_PER_GROUP AND " +
    " R3APPTYP.R1_PER_TYPE = parent_record.B1_PER_TYPE AND R3APPTYP.R1_PER_SUB_TYPE = parent_record.B1_PER_SUB_TYPE AND R3APPTYP.R1_PER_CATEGORY = parent_record.B1_PER_CATEGORY)) as PARENT_LIC_TYPE," +
"licensee_address.G7_ADDRESS1 as LICENSEE_ADDRESS1, " +
"licensee_address.G7_ADDRESS2 as LICENSEE_ADDRESS2, " +
"licensee_address.G7_ADDRESS3 as LICENSEE_ADDRESS3, " +
"licensee_address.G7_CITY as LICENSEE_CITY, " +
"licensee_address.G7_COUNTRY_CODE as LICENSEE_COUNTRY, " +
"expiration.EXPIRATION_DATE as LIC_EXP_DATE, " +
"parent_expiration.EXPIRATION_DATE as PARENT_LIC_EXP_DATE, " +
"licensee.B1_BUSINESS_NAME as BUSINESS_NAME, " +
"licensee.B1_BUSINESS_NAME2 as BUSINESS_NAME2, " +
//phone on G7 is null so taking from B3
"licensee.B1_PHONE1 as LICENSEE_PHONE, " +
"licensee_address.G7_STATE as LICENSEE_STATE, " +
"licensee_address.G7_ZIP as LICENSEE_ZIP, " +
"fee.GF_L1 as ACCOUNT_CODE, " +
"fee.GF_L2 as INDEX_CODE, " +
"fee.GF_L3 as PCA, " +
"payment.PAYMENT_AMOUNT as APPLIED_PAYMENT " +

"FROM  " +
"F4PAYMENT payment " +
    "INNER JOIN B1PERMIT base_record "+
        "ON (payment.SERV_PROV_CODE = base_record.SERV_PROV_CODE " +
        "AND payment.B1_PER_ID1 = base_record.B1_PER_ID1 " +
        "AND payment.B1_PER_ID2 = base_record.B1_PER_ID2 " +
        "AND payment.B1_PER_ID3 = base_record.B1_PER_ID3) " +
    "INNER JOIN X4PAYMENT_FEEITEM payment_fee " +
        "ON (payment.SERV_PROV_CODE = payment_fee.SERV_PROV_CODE " +
        "AND payment.B1_PER_ID1 = payment_fee.B1_PER_ID1 " +
        "AND payment.B1_PER_ID2 = payment_fee.B1_PER_ID2 " +
        "AND payment.B1_PER_ID3 = payment_fee.B1_PER_ID3 " +
        "AND payment.PAYMENT_SEQ_NBR = payment_fee.PAYMENT_SEQ_NBR) " +
    "INNER JOIN F4FEEITEM fee "+
        "ON (payment_fee.SERV_PROV_CODE = fee.SERV_PROV_CODE " +
        "AND payment_fee.B1_PER_ID1 = fee.B1_PER_ID1 " +
        "AND payment_fee.B1_PER_ID2 = fee.B1_PER_ID2 " +
        "AND payment_fee.B1_PER_ID3 = fee.B1_PER_ID3 " +
        "AND payment_fee.FEEITEM_SEQ_NBR = fee.FEEITEM_SEQ_NBR) " +
    "LEFT JOIN B1_EXPIRATION expiration " +
    "   ON (payment.SERV_PROV_CODE = expiration.SERV_PROV_CODE " +
    "   AND payment.B1_PER_ID1 = expiration.B1_PER_ID1 " +
    "   AND payment.B1_PER_ID2 = expiration.B1_PER_ID2 " +
    "   AND payment.B1_PER_ID3 = expiration.B1_PER_ID3) " +
    //if parent record exists join that to expiration
    "LEFT JOIN XAPP2REF base_to_parent " +
    "   ON (payment.SERV_PROV_CODE = base_to_parent.SERV_PROV_CODE " +
    "   AND payment.B1_PER_ID1 = base_to_parent.B1_PER_ID1 " +
    "   AND payment.B1_PER_ID2 = base_to_parent.B1_PER_ID2 " +
    "   AND payment.B1_PER_ID3 = base_to_parent.B1_PER_ID3 " +
    "   AND base_to_parent.B1_RELATIONSHIP = 'R') " +
    "LEFT JOIN B1PERMIT parent_record " +
    "   ON (base_to_parent.MASTER_SERV_PROV_CODE = parent_record.SERV_PROV_CODE " +
    "   AND base_to_parent.B1_MASTER_ID1 = parent_record.B1_PER_ID1 " +
    "   AND base_to_parent.B1_MASTER_ID2 = parent_record.B1_PER_ID2 " +
    "   AND base_to_parent.B1_MASTER_ID3 = parent_record.B1_PER_ID3 " +
    "   AND parent_record.B1_PER_CATEGORY = 'License') " +
    "LEFT JOIN B1_EXPIRATION parent_expiration " +
    "   ON (parent_record.SERV_PROV_CODE = parent_expiration.SERV_PROV_CODE " +
    "   AND parent_record.B1_PER_ID1 = parent_expiration.B1_PER_ID1 " +
    "   AND parent_record.B1_PER_ID2 = parent_expiration.B1_PER_ID2 " +
    "   AND parent_record.B1_PER_ID3 = parent_expiration.B1_PER_ID3) " +
     "LEFT JOIN B3CONTACT licensee" +
    "   ON (base_record.SERV_PROV_CODE = licensee.SERV_PROV_CODE " +
    "   AND base_record.B1_PER_ID1 = licensee.B1_PER_ID1 " +
    "   AND base_record.B1_PER_ID2 = licensee.B1_PER_ID2 " +
    "   AND base_record.B1_PER_ID3 = licensee.B1_PER_ID3 " +
    "   AND licensee.B1_CONTACT_TYPE in ('Owner Applicant') " +
    "   AND licensee.REC_STATUS      = 'A' )" +
    //XRECORD_CONTACT_ENTITY - licensee to licensee address mapping
    "LEFT JOIN XRECORD_CONTACT_ENTITY lic_x_add " +
    "   ON (base_record.SERV_PROV_CODE = lic_x_add.SERV_PROV_CODE " +
    "   AND base_record.B1_PER_ID1 = lic_x_add.B1_PER_ID1 " +
    "   AND base_record.B1_PER_ID2 = lic_x_add.B1_PER_ID2 " +
    "   AND base_record.B1_PER_ID3 = lic_x_add.B1_PER_ID3 " +
    "   AND licensee.B1_CONTACT_NBR = lic_x_add.B1_CONTACT_NBR  and lic_x_add.PRIMARY_FLAG = 'Y'" +
    "   AND lic_x_add.ENT_TYPE IN ('CONTACT','CAP_CONTACT')) " +
    //G7CONTACT_ADDRESS - licensee address
    "LEFT JOIN G7CONTACT_ADDRESS licensee_address " +
    "   ON  (base_record.SERV_PROV_CODE = licensee_address.SERV_PROV_CODE " +
    "   AND lic_x_add.ENT_ID1 = licensee_address.RES_ID " +
    "   AND lic_x_add.ENT_TYPE = licensee_address.G7_ENTITY_TYPE " +
    "   AND licensee_address.REC_STATUS = 'A') " +
    
"WHERE payment.SERV_PROV_CODE = '" + aa.getServiceProviderCode() + "' " +
"AND payment.F4PAYMENT_UDF1 is null " +
"AND payment.PAYMENT_METHOD = 'Credit Card' " +		
"AND base_record.B1_PER_CATEGORY = 'Application'" +
//"AND base_record.b1_alt_id in ('CEO14-18-0000002-APP', 'M10-18-0000364-APP') " +
"ORDER BY payment.PAYMENT_SEQ_NBR";

var sql2 = "SELECT " +
"payment.SERV_PROV_CODE, " +
"base_record.B1_PER_ID1, " +
"base_record.B1_PER_ID2, " +
"base_record.B1_PER_ID3, " +
"base_record.B1_PER_CATEGORY as RECORD_TYPE, " +
"payment.PAYMENT_SEQ_NBR as PAYMENT_ID, " +
"payment.F4PAYMENT_UDF1 as UDF1, " +
"payment.F4PAYMENT_UDF2 as UDF2, " +
"payment.F4PAYMENT_UDF3 as UDF3, " +
"fee.FEEITEM_SEQ_NBR as FEE_ID, " +
"fee.GF_DES as FEE_DESCRIPTION, " +
"payment_fee.FEE_ALLOCATION as FEE_APPLIED_PAYMENT, " +
"(select EFF_DATE from RFEE_SCHEDULE fee_schedule where fee_schedule.SERV_PROV_CODE  = fee.SERV_PROV_CODE AND fee_schedule.FEE_SCHEDULE_NAME = fee.GF_FEE_SCHEDULE " +
"AND fee_schedule.FEE_SCHEDULE_VERSION = fee.FEE_SCHEDULE_VERSION) as FISCAL_YEAR, " +
"payment.PAYMENT_DATE as COLLECTED_DATE, " +
"(select CC_TYPE from etransaction where etransaction.serv_prov_code = payment.serv_prov_code and etransaction.batch_transaction_nbr = payment.batch_transaction_nbr " +
"AND etransaction.PROC_TRANS_ID = payment.TRANSACTION_CODE) as CREDIT_CARD_TYPE, " +
"payment.RECEIPT_NBR as RECEIPT_NO," +
"licensee_address.G7_ADDRESS1 as PAYOR_ADDRESS1, " +
"licensee_address.G7_ADDRESS2 as PAYOR_ADDRESS2, " +
"licensee_address.G7_ADDRESS3 as PAYOR_ADDRESS3, " +
"licensee_address.G7_CITY as PAYOR_CITY, " +
"licensee_address.G7_COUNTRY_CODE as PAYOR_COUNTRY, " +
"licensee.B1_FNAME as PAYOR_NAME_FIRST, " +
"licensee.B1_MNAME as PAYOR_NAME_M, " +
"licensee.B1_LNAME as PAYOR_NAME_LAST, " +
"licensee.B1_PHONE1 as PAYOR_PHONE, " +
"licensee_address.G7_STATE as PAYOR_STATE, " +
"licensee_address.G7_ZIP as PAYOR_ZIP, " +
"base_record.B1_ALT_ID as LIC_NO, " +
"parent_record.B1_ALT_ID as PARENT_LIC_NO, " +
"(select R1_APP_TYPE_ALIAS from R3APPTYP WHERE (R3APPTYP.SERV_PROV_CODE = base_record.SERV_PROV_CODE AND R3APPTYP.R1_PER_GROUP = base_record.B1_PER_GROUP AND " +
    " R3APPTYP.R1_PER_TYPE = base_record.B1_PER_TYPE AND R3APPTYP.R1_PER_SUB_TYPE = base_record.B1_PER_SUB_TYPE AND R3APPTYP.R1_PER_CATEGORY = base_record.B1_PER_CATEGORY))  as LIC_TYPE," +
"(select R1_APP_TYPE_ALIAS from R3APPTYP WHERE (R3APPTYP.SERV_PROV_CODE = parent_record.SERV_PROV_CODE AND R3APPTYP.R1_PER_GROUP = parent_record.B1_PER_GROUP AND " +
    " R3APPTYP.R1_PER_TYPE = parent_record.B1_PER_TYPE AND R3APPTYP.R1_PER_SUB_TYPE = parent_record.B1_PER_SUB_TYPE AND R3APPTYP.R1_PER_CATEGORY = parent_record.B1_PER_CATEGORY)) as PARENT_LIC_TYPE," +
"licensee_address.G7_ADDRESS1 as LICENSEE_ADDRESS1, " +
"licensee_address.G7_ADDRESS2 as LICENSEE_ADDRESS2, " +
"licensee_address.G7_ADDRESS3 as LICENSEE_ADDRESS3, " +
"licensee_address.G7_CITY as LICENSEE_CITY, " +
"licensee_address.G7_COUNTRY_CODE as LICENSEE_COUNTRY, " +
"expiration.EXPIRATION_DATE as LIC_EXP_DATE, " +
"parent_expiration.EXPIRATION_DATE as PARENT_LIC_EXP_DATE, " +
"licensee.B1_BUSINESS_NAME as BUSINESS_NAME, " +
"licensee.B1_BUSINESS_NAME2 as BUSINESS_NAME2, " +
//phone on G7 is null so taking from B3
"licensee.B1_PHONE1 as LICENSEE_PHONE, " +
"licensee_address.G7_STATE as LICENSEE_STATE, " +
"licensee_address.G7_ZIP as LICENSEE_ZIP, " +
"fee.GF_L1 as ACCOUNT_CODE, " +
"fee.GF_L2 as INDEX_CODE, " +
"fee.GF_L3 as PCA, " +
"payment.PAYMENT_AMOUNT as APPLIED_PAYMENT " +

"FROM  " +
"F4PAYMENT payment " +
    "INNER JOIN B1PERMIT base_record "+
        "ON (payment.SERV_PROV_CODE = base_record.SERV_PROV_CODE " +
        "AND payment.B1_PER_ID1 = base_record.B1_PER_ID1 " +
        "AND payment.B1_PER_ID2 = base_record.B1_PER_ID2 " +
        "AND payment.B1_PER_ID3 = base_record.B1_PER_ID3) " +
    "INNER JOIN X4PAYMENT_FEEITEM payment_fee " +
        "ON (payment.SERV_PROV_CODE = payment_fee.SERV_PROV_CODE " +
        "AND payment.B1_PER_ID1 = payment_fee.B1_PER_ID1 " +
        "AND payment.B1_PER_ID2 = payment_fee.B1_PER_ID2 " +
        "AND payment.B1_PER_ID3 = payment_fee.B1_PER_ID3 " +
        "AND payment.PAYMENT_SEQ_NBR = payment_fee.PAYMENT_SEQ_NBR) " +
    "INNER JOIN F4FEEITEM fee "+
        "ON (payment_fee.SERV_PROV_CODE = fee.SERV_PROV_CODE " +
        "AND payment_fee.B1_PER_ID1 = fee.B1_PER_ID1 " +
        "AND payment_fee.B1_PER_ID2 = fee.B1_PER_ID2 " +
        "AND payment_fee.B1_PER_ID3 = fee.B1_PER_ID3 " +
        "AND payment_fee.FEEITEM_SEQ_NBR = fee.FEEITEM_SEQ_NBR) " +
    "LEFT JOIN B1_EXPIRATION expiration " +
    "   ON (payment.SERV_PROV_CODE = expiration.SERV_PROV_CODE " +
    "   AND payment.B1_PER_ID1 = expiration.B1_PER_ID1 " +
    "   AND payment.B1_PER_ID2 = expiration.B1_PER_ID2 " +
    "   AND payment.B1_PER_ID3 = expiration.B1_PER_ID3) " +
    //if parent record exists join that to expiration
    "LEFT JOIN XAPP2REF base_to_parent " +
    "   ON (payment.SERV_PROV_CODE = base_to_parent.SERV_PROV_CODE " +
    "   AND payment.B1_PER_ID1 = base_to_parent.B1_PER_ID1 " +
    "   AND payment.B1_PER_ID2 = base_to_parent.B1_PER_ID2 " +
    "   AND payment.B1_PER_ID3 = base_to_parent.B1_PER_ID3 " +
    "   AND base_to_parent.B1_RELATIONSHIP in ('Amendment', 'R') )" +
    "LEFT JOIN B1PERMIT parent_record " +
    "   ON (base_to_parent.MASTER_SERV_PROV_CODE = parent_record.SERV_PROV_CODE " +
    "   AND base_to_parent.B1_MASTER_ID1 = parent_record.B1_PER_ID1 " +
    "   AND base_to_parent.B1_MASTER_ID2 = parent_record.B1_PER_ID2 " +
    "   AND base_to_parent.B1_MASTER_ID3 = parent_record.B1_PER_ID3 " +
    "   AND parent_record.B1_PER_CATEGORY = 'Application') " +
    "LEFT JOIN B1_EXPIRATION parent_expiration " +
    "   ON (parent_record.SERV_PROV_CODE = parent_expiration.SERV_PROV_CODE " +
    "   AND parent_record.B1_PER_ID1 = parent_expiration.B1_PER_ID1 " +
    "   AND parent_record.B1_PER_ID2 = parent_expiration.B1_PER_ID2 " +
    "   AND parent_record.B1_PER_ID3 = parent_expiration.B1_PER_ID3) " +
    "LEFT JOIN B3CONTACT licensee" +
    "   ON (parent_record.SERV_PROV_CODE = licensee.SERV_PROV_CODE " +
    "   AND parent_record.B1_PER_ID1 = licensee.B1_PER_ID1 " +
    "   AND parent_record.B1_PER_ID2 = licensee.B1_PER_ID2 " +
    "   AND parent_record.B1_PER_ID3 = licensee.B1_PER_ID3 " +
    "   AND licensee.B1_CONTACT_TYPE in ('Owner Applicant') " +
    "   AND licensee.REC_STATUS      = 'A') " +
    //XRECORD_CONTACT_ENTITY - licensee to licensee address mapping
    "LEFT JOIN XRECORD_CONTACT_ENTITY lic_x_add " +
    "   ON (parent_record.SERV_PROV_CODE = lic_x_add.SERV_PROV_CODE " +
    "   AND parent_record.B1_PER_ID1 = lic_x_add.B1_PER_ID1 " +
    "   AND parent_record.B1_PER_ID2 = lic_x_add.B1_PER_ID2 " +
    "   AND parent_record.B1_PER_ID3 = lic_x_add.B1_PER_ID3 " +
    "   AND licensee.B1_CONTACT_NBR = lic_x_add.B1_CONTACT_NBR  and lic_x_add.PRIMARY_FLAG = 'Y'" +
    "   AND lic_x_add.ENT_TYPE IN ('CONTACT','CAP_CONTACT')) " +
    //G7CONTACT_ADDRESS - licensee address
    "LEFT JOIN G7CONTACT_ADDRESS licensee_address " +
    "   ON  (parent_record.SERV_PROV_CODE = licensee_address.SERV_PROV_CODE " +
    "   AND lic_x_add.ENT_ID1 = licensee_address.RES_ID " +
    "   AND lic_x_add.ENT_TYPE = licensee_address.G7_ENTITY_TYPE " +
    "   AND licensee_address.REC_STATUS = 'A') " +
    
"WHERE payment.SERV_PROV_CODE = '" + aa.getServiceProviderCode() + "' " +
"AND payment.F4PAYMENT_UDF1 is null " +
"AND payment.PAYMENT_METHOD = 'Credit Card' " +		
"AND base_record.B1_PER_CATEGORY = 'Incomplete Attestation'" +
//"AND base_record.b1_alt_id in ('CEO14-18-0000016-ATT') " +
"ORDER BY payment.PAYMENT_SEQ_NBR";

try {
    var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
    var ds = initialContext.lookup("java:/AA");
    var conn = ds.getConnection();
    var sStmt = conn.prepareStatement(sql);
    var rSet = sStmt.executeQuery();
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
    rSet.close();
    sStmt.close();
   var sStmt = conn.prepareStatement(sql2);
   var rSet = sStmt.executeQuery();
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
    aa.env.setValue("returnCode", "0"); // success
    aa.env.setValue("returnValue", JSON.stringify(array));
    aa.print(JSON.stringify(array));
    rSet.close();
    sStmt.close();
    conn.close();
} catch (err) {
    aa.env.setValue("returnCode", "-1"); // error
    aa.env.setValue("returnValue", err.message);
    aa.print(err.message);
}

