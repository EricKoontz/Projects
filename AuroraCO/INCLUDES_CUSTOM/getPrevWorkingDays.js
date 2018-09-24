/**
 * Calculates date of N working days before a date
 * @param fromDate {Date} date to calculate from
 * @param numOfDays working days number
 * @returns {Date} date of N working days before fromDate 
 */
function getPrevWorkingDays(fromDate, numOfDays) {
	var prev = null;
	while (numOfDays-- != 0) {
		var getFrom = aa.date.getScriptDateTime(fromDate);
		prev = aa.calendar.getPreviousWorkDay(getFrom);
		prev = prev.getOutput();
		fromDate = prev;
	}
	return prev;
}