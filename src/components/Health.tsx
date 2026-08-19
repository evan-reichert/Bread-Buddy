// Here is where the savings health is designated
import { motion } from 'framer-motion';
import bbmasc from '../assets/bbmasc.png';
import bbmasc_mold from '../assets/bbmasc_mold.png';
import bbmasc_meh from '../assets/bbmasc_meh.png';
import greenOrb from '../assets/green-orb.svg';
import greenSpark from '../assets/green-spark.svg';
import yellowSpark from '../assets/yellow-spark.svg';
import redSpark from '../assets/red-spark.svg';
import yellowOrb from '../assets/yellow-orb.svg';
import redOrb from '../assets/red-orb.svg';
import type { BudgetInputs } from './Tabs';
import { getTier, type HealthTier } from './TierLogic';
import './Health.css';

// Define the HealthProps type that will be used to create the savings health component
type HealthProps = {
	budgetInputs: BudgetInputs;
};

// Define the animation variants that will be used to create the savings health component
function OrbDecor({ className, tier }: { className: string; tier: HealthTier }) {
	const decorByTier = {
                green: { orb: greenOrb, spark: greenSpark },
                yellow: { orb: yellowOrb, spark: yellowSpark },
                red: { orb: redOrb, spark: redSpark },
		};
    const decor = decorByTier[tier];

	return (
		<>
			<motion.img
				src={decor.orb}
				alt=""
				aria-hidden="true"
				className={className}
				initial={{ opacity: 0, scale: 0.86 }}
				animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.08, 1] }}
				transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
			/>
			<motion.img
				src={decor.spark}
				alt=""
				aria-hidden="true"
				className={`${className} health-svg-spark`}
				initial={{ opacity: 0, rotate: -10 }}
				animate={{ opacity: [0.3, 0.75, 0.3], rotate: [-10, 2, -10], y: [0, -4, 0] }}
				transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
			/>
		</>
	);
}

// Define the Health function that will be used to create the savings health component
function Health({ budgetInputs }: HealthProps) {
	// Calculate the total saved, savings rate, and goal progress based on the budget inputs
    const income = Number(budgetInputs.monthlyIncome) || 0;
	const rent = Number(budgetInputs.rent) || 0;
	const utilities = Number(budgetInputs.utilities) || 0;
	const other = Number(budgetInputs.other) || 0;
	const variableCosts = Number(budgetInputs.variableCosts) || 0;
	const investments = Number(budgetInputs.investments) || 0;
	const monthlyGoal = Number(budgetInputs.monthlySavings) || 0;

    // Calculate the fixed costs, total saved, savings rate, and goal progress based on the budget inputs
	const fixedCosts = rent + utilities + other + variableCosts + investments;
	const totalSaved = Math.max(0, income - fixedCosts);
	const savingsRate = income > 0 ? totalSaved / income : 0;
	const goalProgress = monthlyGoal > 0 ? totalSaved / monthlyGoal : 0;

	const healthTier = getTier({
		income,
		fixedCosts,
		monthlyGoal,
	});

    // Create the tier colors
    const greenColor = '0 18px 30px rgba(34, 197, 94, 0.35)';
    const yellowColor = '0 18px 30px rgba(250, 204, 21, 0.35)';
    const redColor = '0 18px 30px rgba(239, 68, 68, 0.35)';

    // Create the tier config map
	const tierConfig = new Map<HealthTier, { mascot: string; mascotAlt: string; hoverShadow: string }>([
        ['green', { hoverShadow: greenColor, mascot: bbmasc, mascotAlt: 'Bread Buddy mascot' }],
        ['yellow', { hoverShadow: yellowColor, mascot: bbmasc_meh, mascotAlt: 'Bread Buddy mascot' }],
        ['red', { hoverShadow: redColor, mascot: bbmasc_mold, mascotAlt: 'Bread Buddy mascot with mold' }],
    ]);

    // Get the current tier config based on the health tier
	const activeTier = tierConfig.get(healthTier) || { hoverShadow: greenColor, mascot: bbmasc, mascotAlt: 'Bread Buddy mascot' };


    // Formats data into a currency format for display
	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	});

    // Define the progress statement that will be displayed based on the budget inputs and calculated values
	let progressStatement = 'Enter your monthly income and fixed costs in Dashboard to view your progress.';

    // Update the progress statement based on the budget inputs and calculated values
	if (income > 0 && monthlyGoal <= 0) {
		progressStatement = 'Set a monthly savings target in Dashboard to track goal progress accurately.';
	} else if (income > 0 && monthlyGoal > 0) {
		if (goalProgress >= 1) {
			progressStatement = `Excellent. You are above your monthly savings target by ${currencyFormatter.format(totalSaved - monthlyGoal)}.`;
		} else if (savingsRate >= 0.2) {
			progressStatement = `Strong progress. You are saving ${(savingsRate * 100).toFixed(0)}% of your income and are ${Math.round(goalProgress * 100)}% to target.`;
		} else if (savingsRate >= 0.1) {
			progressStatement = `Steady progress. You are saving ${(savingsRate * 100).toFixed(0)}% of your income and need ${currencyFormatter.format(monthlyGoal - totalSaved)} more to hit your target.`;
		} else {
			progressStatement = `Heads up: savings rate is ${(savingsRate * 100).toFixed(0)}%. Lower fixed costs or raise your target contribution to reach ${currencyFormatter.format(monthlyGoal)}.`;
		}
	}

    // Return the TSX for the savings health component
	return (
		<motion.div className={`health-hero-${healthTier} card border-0 shadow-sm mb-4`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
			<div className="card-body d-flex flex-column flex-lg-row align-items-center justify-content-between gap-4">
				<div className="d-flex align-items-center gap-3">
					<motion.div
						className={`health-mascot-shell health-mascot-shell-${healthTier}`}
						initial={{ scale: 0.9, opacity: 0, y: 16 }}
						animate={{
							scale: [1, 1.04, 1],
							y: [0, -8, 0],
							opacity: 1,
						}}
						transition={{
							opacity: { duration: 0.45, ease: 'easeOut' },
							scale: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
							y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
						}}
						whileHover={{ scale: 1.08, rotate: -3 }}
					>
						<img src={activeTier.mascot} alt={activeTier.mascotAlt} className="health-mascot" />
					</motion.div>

					<div>
						<p className="text-uppercase text-muted mb-1 health-kicker">Bread Buddy Health</p>
						<h2 className="h4 mb-1">Your savings health snapshot.</h2>
						<p className="mb-0 text-secondary">{progressStatement}</p>
					</div>
				</div>

				<motion.div
					className={`health-saved-bubble-${healthTier} text-center`}
					whileHover={{ y: -6, scale: 1.03, boxShadow: activeTier.hoverShadow }}
					whileTap={{ scale: 0.98 }}
				>
					<OrbDecor className="health-svg-orb health-svg-orb--saved" tier={healthTier} />
					<p className="mb-1 health-saved-label">Saved so far</p>
					<p className="mb-0 health-saved-value">{currencyFormatter.format(totalSaved)}</p>
				</motion.div>
			</div>
		</motion.div>
	);
}

export default Health;
