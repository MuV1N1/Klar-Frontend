export type GreetingPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export function greetingPeriod(date: Date = new Date()): GreetingPeriod {
	const hour = date.getHours();
	if (hour < 5) return 'night';
	if (hour < 11) return 'morning';
	if (hour < 18) return 'afternoon';
	if (hour < 23) return 'evening';
	return 'night';
}
