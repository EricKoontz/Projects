if (wfTask.equals("Review") && wfStatus.equals("Changes Accepted")) {
    if (parentCapId) {
        var isTemp = isASITrue(getAppSpecific("Are you requesting a temporary license?", parentCapId));
        if (isTemp || appMatch("Licenses/Cannabis/Temporary Event/Incomplete Attestation")) { // If parent is temporary, we will use the attestations from this amendment
            copyAppSpecificInfo(capId, parentCapId);
        }
        // always copy over the new tables.
        copyASITablesWithRemove(capId, parentCapId);
    }
}