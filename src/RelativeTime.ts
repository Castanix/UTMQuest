const formatter = new Intl.RelativeTimeFormat(undefined, {
	numeric: "auto",
});

function GetRelativeTime(date: number) {
	// @ts-ignore
	const seconds = Math.floor((new Date() - date) / 1000);

	let interval = seconds / 31536000;

	if (interval > 1) {
		return formatter.format(-1 * Math.floor(interval), "years");
	}
	interval = seconds / 2592000;
	if (interval > 1) {
		return formatter.format(-1 * Math.floor(interval), "months");
	}
	interval = seconds / 86400;
	if (interval > 1) {
		return formatter.format(-1 * Math.floor(interval), "days");
	}
	interval = seconds / 3600;
	if (interval > 1) {
		return formatter.format(-1 * Math.floor(interval), "hours");
	}
	interval = seconds / 60;
	if (interval > 1) {
		return formatter.format(-1 * Math.floor(interval), "minutes");
	}
	return formatter.format(-1 * Math.floor(seconds), "seconds");
}

export default GetRelativeTime;
