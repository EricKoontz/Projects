CREATE VIEW dbo.V_DOCUMENT_BCC
WITH SCHEMABINDING
AS
SELECT A.SERV_PROV_CODE AS AGENCY_ID
	,A.B1_ALT_ID AS RECORD_ID
	,A.B1_PER_GROUP AS RECORD_MODULE
	,A.B1_SPECIAL_TEXT AS RECORD_NAME 
	,A.B1_FILE_DD AS RECORD_OPEN_DATE
	,A.B1_APPL_STATUS AS RECORD_STATUS
	,A.B1_APPL_STATUS_DATE AS RECORD_STATUS_DATE
	,A.B1_PER_CATEGORY AS RECORD_TYPE_CATEGORY
	,A.B1_PER_GROUP AS RECORD_TYPE_GROUP
	,A.B1_PER_SUB_TYPE AS RECORD_TYPE_SUBTYPE
	,A.B1_PER_TYPE AS RECORD_TYPE_TYPE
	,B.DOC_SEQ_NBR AS DOC_SEQ_NBR
	,B.DOC_NAME AS DOC_NAME
	,B.DOC_DESCRIPTION AS DOC_DESCRIPTION
	,B.DOC_GROUP AS DOC_GROUP
	,B.DOC_TYPE AS DOC_TYPE
	,B.DOC_SUBTYPE AS DOC_SUBTYPE
	,B.DOC_CATEGORY AS DOC_CATEGORY
	,B.DOC_VERSION AS DOC_VERSION
	,B.DOC_NUM_OF_SETS AS DOC_NUM_OF_SETS
	,B.DOC_STATUS AS DOC_STATUS
	,B.DOC_STATUS_DATE AS DOC_STATUS_DATE
	,B.DOC_COMMENT AS DOC_COMMENT
	,B.SOURCE AS DOC_SOURCE
	,B.URL AS DOC_URL
	,B.FILE_NAME AS DOC_FILE_NAME
	,B.FILE_SIZE AS DOC_FILE_SIZE
	,B.FILE_UPLOAD_BY AS DOC_FILE_UPLOAD_BY
	,B.FILE_UPLOAD_DATE AS DOC_FILE_UPLOAD_DATE
	,B.FILE_SIGNED AS DOC_SIGNED
	,B.FILE_SIGNED_BY AS DOC_SIGNED_BY
	,B.FILE_SIGNED_DATE AS DOC_SIGNED_DATE
	,B.DOC_DEPARTMENT AS DOC_DEPARTMENT
	,B.REC_DATE AS DOC_REC_DATE
	,B.REC_FUL_NAM AS DOC_REC_FUL_NAM
	,B.REC_STATUS AS DOC_REC_STATUS	
FROM B1PERMIT A inner join BDOCUMENT B on 1=1
	AND A.B1_PER_ID1 = B.B1_PER_ID1
	AND A.B1_PER_ID2 = B.B1_PER_ID2
	AND A.B1_PER_ID3 = B.B1_PER_ID3
	AND A.SERV_PROV_CODE = B.SERV_PROV_CODE
;
 