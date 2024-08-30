/**
 * Function to detect what is the current season
 * 
 * @returns {String} season name
*/
function _getSeason() {
	// Get current date
	const currentDate = new Date();
	// Get current month (+ 1 'cause everything starts from 0 in programming)
	const month = currentDate.getMonth() + 1;

	// Debug
	// console.log(`Month: ${month}`);

	if (month >= 3 && month <= 5) { // Spring
		return 'Spring';
	} else if (month >= 6 && month <= 8) { // Summer
		return 'Summer';
	} else if (month >= 9 && month <= 11) { // Autumn
		return 'Autumn';
	} else { // Winter
		return 'Winter';
	}
}