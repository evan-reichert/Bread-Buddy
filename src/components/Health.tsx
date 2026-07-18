// Here is where the savings health is designated
import { motion } from 'framer-motion';
import bbmasc from '../assets/bbmasc.png';
import greenOrb from '../assets/green-orb.svg';
import greenSpark from '../assets/green-spark.svg';
import type { BudgetInputs } from './Tabs';
import './Health.css';

type HealthProps = {
	budgetInputs: BudgetInputs;
};

function OrbDecor({ className }: { className: string }) {
	return (
		<>
			<motion.img
				src={greenOrb}
				alt=""
				aria-hidden="true"
				className={className}
				initial={{ opacity: 0, scale: 0.86 }}
				animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.08, 1] }}
				transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
			/>
			<motion.img
				src={greenSpark}
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

function Health({ budgetInputs }: HealthProps) {
	const income = Number(budgetInputs.monthlyIncome) || 0;
	const rent = Number(budgetInputs.rent) || 0;
	const utilities = Number(budgetInputs.utilities) || 0;
	const other = Number(budgetInputs.other) || 0;
	const monthlyGoal = Number(budgetInputs.monthlySavings) || 0;

	const fixedCosts = rent + utilities + other;
	const totalSaved = Math.max(0, income - fixedCosts);
	const savingsRate = income > 0 ? totalSaved / income : 0;
	const goalProgress = monthlyGoal > 0 ? totalSaved / monthlyGoal : 0;

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	});

	let progressStatement = 'Enter your monthly income and fixed costs in Dashboard to view your progress.';

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

	return (
		<motion.div className="health-hero card border-0 shadow-sm mb-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
			<div className="card-body d-flex flex-column flex-lg-row align-items-center justify-content-between gap-4">
				<div className="d-flex align-items-center gap-3">
					<motion.div
						className="health-mascot-shell"
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
						<img src={bbmasc} alt="Bread Buddy mascot" className="health-mascot" />
					</motion.div>

					<div>
						<p className="text-uppercase text-muted mb-1 health-kicker">Bread Buddy Health</p>
						<h2 className="h4 mb-1">Your savings health snapshot.</h2>
						<p className="mb-0 text-secondary">{progressStatement}</p>
					</div>
				</div>

				<motion.div
					className="health-saved-bubble text-center"
					whileHover={{ y: -6, scale: 1.03, boxShadow: '0 18px 30px rgba(34, 197, 94, 0.35)' }}
					whileTap={{ scale: 0.98 }}
				>
					<OrbDecor className="health-svg-orb health-svg-orb--saved" />
					<p className="mb-1 health-saved-label">Saved so far</p>
					<p className="mb-0 health-saved-value">{currencyFormatter.format(totalSaved)}</p>
				</motion.div>
			</div>
		</motion.div>
	);
}

export default Health;
