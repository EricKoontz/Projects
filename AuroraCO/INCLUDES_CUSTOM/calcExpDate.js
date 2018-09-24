
function calcExpDate(issueDate) {
    // issueDate + 3
    var date = new Date(dateAdd(issueDate, 1095));
    // Set to the last day of that month 
    expDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    // If February, and its a leap year, then use 28th
    if ((expDate.getMonth() + 1) == 2) {
        if (expDate.getDate() == 29) {
            expDate.setDate(28);
        }
    }

    return aa.date.parseDate(((date.getMonth() + 1) + "/" + expDate.getDate() + "/" + date.getFullYear()));
}
