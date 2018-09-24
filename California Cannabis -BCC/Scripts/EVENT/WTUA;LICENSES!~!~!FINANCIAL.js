if (wfTask.equals("Review") && wfStatus.equals("Changes Accepted")) {
    if (parentCapId) {
                
        // always copy over the new tables.
        copyASITablesWithRemove(capId, parentCapId);
    }
}