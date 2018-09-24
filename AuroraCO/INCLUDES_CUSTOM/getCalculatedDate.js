
/**
 * @param statusDate work flow status date
 * @param daysOut number of days that need to be shifted
 * @returns {String} status date plus the days out
 */
function getCalculatedDate(statusDate, daysOut) {
	var newDate = new Date(statusDate);
	newDate.setDate(newDate.getDate() + parseInt(daysOut));
	var dd = newDate.getDate();
	var mm = newDate.getMonth() + 1;
	var yy = newDate.getFullYear();
	var formatedDate = mm + "/" + dd + "/" + yy;
	return formatedDate;
}