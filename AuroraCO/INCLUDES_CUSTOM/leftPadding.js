
/**
 * adds 0 padding to left of value (padded value will be 2 digits)
 * @param value
 * @returns padded value
 */
function leftPadding(value) {
	if (parseInt(value) < 10) {
		return "0" + value;
	} else {
		return value;
	}
}