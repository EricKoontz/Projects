var assetInfo = getAssetInfo(AssetMasterPK);
var assetSeq = AssetMasterPK.getG1AssetSequenceNumber();

// validate and make new asset id
var capKey = assetInfo["InvestID"];
logDebug("Investigation ID for this Asset is " + capKey);
capKey = capKey.replace("ENF-", "");
capKey = capKey.replace("BCC-", "");  // story 2609
capKey = capKey.replace("-INV", "");
var assetdm = aa.asset.getAssetData(assetSeq).getOutput().getAssetDataModel();
var assetmm = assetdm.getAssetMaster();
var evidenceId = assetmm.getG1AssetID();
logDebug("The Evidence ID is " + evidenceId);
evidenceId = capKey + "-" + evidenceId;
logDebug("new Evidence ID is " + evidenceId);

// update the asset id
assetmm.setG1AssetID(evidenceId);
assetdm.setAssetMaster(assetmm);

var result = aa.asset.editAsset(assetdm).getSuccess();
logDebug("updated asset success? " + result);

// Link the records
var woam = aa.asset.newWorkOrderAssetScriptModel().getOutput().getWorkOrderAssetModel();
woam.setCapID(aa.cap.getCapID(capKey).getOutput());
woam.setAssetPK(AssetMasterPK);
woam.setAuditID(currentUserID);
result = aa.asset.createWorkOrderAsset(woam);
logDebug("linked asset to investigation success? " + result.getSuccess() + " " + result.getErrorMessage());



function getAssetInfo(assetKey) {
	var ret = [];
	try {
		var seq = assetKey.getG1AssetSequenceNumber();
		var a = aa.asset.getAssetData(seq).getOutput().getDataAttributes().toArray();
		for (var i in a) {
			var v = a[i];
			var name = a[i].getG1AttributeName();
			var val = a[i].getG1AttributeValue();
			logDebug(name + " = " + val);
			ret[name] = val;
		}
		return ret;

	} catch (err) {
		return false;
	}

}