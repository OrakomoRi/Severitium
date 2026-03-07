/**
 * Configuration for date periods with priorities.
 * Higher priority values override lower ones.
 */
const DATE_PERIODS = [
	{
		name: 'Spring',
		priority: 1,
		check: (month) => month >= 3 && month <= 5
	},
	{
		name: 'Summer',
		priority: 1,
		check: (month) => month >= 6 && month <= 8
	},
	{
		name: 'Autumn',
		priority: 1,
		check: (month) => month >= 9 && month <= 11
	},
	{
		name: 'Winter',
		priority: 1,
		check: (month) => month === 12 || month === 1 || month === 2
	}
];

/**
 * Function to detect the current period (season or special period).
 * 
 * @param {Date} [date] - Optional date to check (defaults to current date)
 * @returns {String} period name (season or holiday)
 */
export function _getPeriod(date = new Date()) {
	const month = date.getMonth() + 1;
	const day = date.getDate();
	
	const matches = DATE_PERIODS
		.filter(period => period.check(month, day, date))
		.sort((a, b) => b.priority - a.priority);
	
	return matches.length > 0 ? matches[0].name : 'Winter';
}