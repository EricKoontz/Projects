var array = [];
var sql = "SELECT " +
"aaa.SERV_PROV_CODE, " +
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
"fee_schedule.EFF_DATE as FISCAL_YEAR, " +
"payment.PAYMENT_DATE as COLLECTED_DATE, " +
"payment.PAYMENT_METHOD as PAY_BY_TYPE, " +
"payment.PAYMENT_REF_NBR as CHECK_NO, " +
"payment.RECEIPT_NBR as RECEIPT_NO," +
"cashier_session.DEPOSIT_SLIP_NBR as BANK_DEPOSIT_NO, " +
"cashier_session.DEPOSIT_DATE as BANK_DEPOSIT_DATE, " +
"payment.PAYEE_ADDRESS as PAYOR_ADDRESS1, " +
"payment.PAYEE as PAYOR_NAME_FIRST, " +
"payment.PAYEE_PHONE as PAYOR_PHONE, " +
"'POINT-OF-SALE' as LIC_NO, " +
"fee.GF_L1 as ACCOUNT_CODE, " +
"fee.GF_L2 as INDEX_CODE, " +
"fee.GF_L3 as PCA, " +
"payment.PAYMENT_AMOUNT as APPLIED_PAYMENT " +

"FROM ACCOUNTING_AUDIT_TRAIL aaa, " +
"B1PERMIT base_record, " +
"F4CASHIER_SESSION cashier_session, " +
"X4PAYMENT_FEEITEM payment_fee, " +
"F4FEEITEM fee, " +
"RFEE_SCHEDULE fee_schedule, " +
"F4PAYMENT payment " +


"WHERE aaa.SERV_PROV_CODE = '" + aa.getServiceProviderCode() + "'" +
//payment
"AND aaa.PAYMENT_SEQ_NBR = payment.PAYMENT_SEQ_NBR " +
"AND aaa.SERV_PROV_CODE = payment.SERV_PROV_CODE " +
//cashier session
"AND cashier_session.SERV_PROV_CODE = aaa.SERV_PROV_CODE " +
"AND cashier_session.SESSION_NBR = aaa.SESSION_NBR " +
//record
"AND base_record.SERV_PROV_CODE = payment.SERV_PROV_CODE " +
"AND base_record.B1_PER_ID1 = payment.B1_PER_ID1 " +
"AND base_record.B1_PER_ID2 = payment.B1_PER_ID2 " +
"AND base_record.B1_PER_ID3 = payment.B1_PER_ID3 " +
//payment to payment_fee
"AND payment.SERV_PROV_CODE = payment_fee.SERV_PROV_CODE " +
"AND payment.B1_PER_ID1 = payment_fee.B1_PER_ID1 " +
"AND payment.B1_PER_ID2 = payment_fee.B1_PER_ID2 " +
"AND payment.B1_PER_ID3 = payment_fee.B1_PER_ID3 " +
"AND payment.PAYMENT_SEQ_NBR = payment_fee.PAYMENT_SEQ_NBR " +
//fee to payment_fee
"AND fee.SERV_PROV_CODE = payment_fee.SERV_PROV_CODE " +
"AND fee.B1_PER_ID1 = payment_fee.B1_PER_ID1 " +
"AND fee.B1_PER_ID2 = payment_fee.B1_PER_ID2 " +
"AND fee.B1_PER_ID3 = payment_fee.B1_PER_ID3 " +
"AND fee.FEEITEM_SEQ_NBR = payment_fee.FEEITEM_SEQ_NBR " +
//fee to fee_schedule
"AND fee.SERV_PROV_CODE = fee_schedule.SERV_PROV_CODE " +
"AND fee.GF_FEE_SCHEDULE = fee_schedule.FEE_SCHEDULE_NAME " +
"AND fee.FEE_SCHEDULE_VERSION = fee_schedule.FEE_SCHEDULE_VERSION " +
//misc filter
"AND aaa.ACTION = 'Payment' " +
//The point of sale record number
"AND base_record.B1_ALT_ID = '10FDD-00000-#0001' " +
"AND payment.F4PAYMENT_UDF1 is null " +
"AND payment.PAYMENT_METHOD != 'Credit Card' " +
"AND cashier_session.DEPOSIT_SLIP_NBR IS NOT NULL " +

//This temporarily disables this SQL statement. Remove the 1 = 2 to restore the functionality
"AND 1 = 2 " +

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

