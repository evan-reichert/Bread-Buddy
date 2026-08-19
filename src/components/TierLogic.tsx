// Tier logic placed into a new file for easier access and testing
export type HealthTier = 'green' | 'yellow' | 'red';

type TierInput = {
	income: number;
	fixedCosts: number;
	monthlyGoal: number;
};

export function getTier({ income, fixedCosts, monthlyGoal }: TierInput): HealthTier {
	const safeIncome = Number.isFinite(income) ? income : 0;
	const safeFixedCosts = Number.isFinite(fixedCosts) ? fixedCosts : 0;
	const safeMonthlyGoal = Number.isFinite(monthlyGoal) ? monthlyGoal : 0;

	const totalSaved = Math.max(0, safeIncome - safeFixedCosts);
	const savingsRate = safeIncome > 0 ? totalSaved / safeIncome : 0;
	const goalProgress = safeMonthlyGoal > 0 ? totalSaved / safeMonthlyGoal : 0;

	if (safeIncome <= 0) {
		return 'red';
	}
	if (goalProgress >= 1 || savingsRate >= 0.2) {
		return 'green';
	}
	if (goalProgress >= 0.6 || savingsRate >= 0.1) {
		return 'yellow';
	}
	return 'red';
}
