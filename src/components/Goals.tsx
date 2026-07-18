// Here is where we will create the goals component
// Import the dependencies that we will need to create the goals component
import { useState } from 'react';
import { motion } from 'framer-motion';
import bbmasc from '../assets/bbmasc.png';
import greenOrb from '../assets/green-orb.svg';
import greenSpark from '../assets/green-spark.svg';
import type { BudgetInputs } from './Tabs';
import './Goals.css';

type GoalsProps = {
    budgetInputs: BudgetInputs;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        },
    },
} as const;

const riseInVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.42, ease: 'easeOut' },
    },
} as const;

function BubbleDecor() {
    return (
        <>
            <motion.img
                src={greenOrb}
                alt=""
                aria-hidden="true"
                className="goals-svg-orb"
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.08, 1] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
                src={greenSpark}
                alt=""
                aria-hidden="true"
                className="goals-svg-spark"
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: [0.3, 0.75, 0.3], rotate: [-10, 2, -10], y: [0, -4, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            />
        </>
    );
}

// Define the goals function that will be used to create the goals component
function Goals({ budgetInputs }: GoalsProps) {
    const [goalAmountInput, setGoalAmountInput] = useState('3000');
    const [timeframeDaysInput, setTimeframeDaysInput] = useState('120');

    const income = Number(budgetInputs.monthlyIncome) || 0;
    const costs = (Number(budgetInputs.rent) || 0)
        + (Number(budgetInputs.utilities) || 0)
        + (Number(budgetInputs.other) || 0);
    const savingsTarget = Number(budgetInputs.monthlySavings) || 0;
    const projectedSavings = Math.max(0, income - costs);
    const projectedDailySavings = projectedSavings / 30;
    const gapToTarget = Math.max(0, savingsTarget - projectedSavings);
    const progressPercent = savingsTarget > 0
        ? Math.min(100, Math.round((projectedSavings / savingsTarget) * 100))
        : 0;

    const goalAmount = Number(goalAmountInput) || 0;
    const timeframeDays = Number(timeframeDaysInput) || 0;
    const estimatedDaysToGoal = projectedDailySavings > 0 && goalAmount > 0
        ? Math.ceil(goalAmount / projectedDailySavings)
        : null;
    const daysDelta = estimatedDaysToGoal !== null && timeframeDays > 0
        ? estimatedDaysToGoal - timeframeDays
        : null;

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

    const goalsCards = [
        { label: 'Monthly Target', value: currencyFormatter.format(savingsTarget) },
        { label: 'Projected Savings', value: currencyFormatter.format(projectedSavings) },
        { label: 'Gap to Target', value: currencyFormatter.format(gapToTarget) },
    ];

    return (
        <motion.section
            className="goals-dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.article className="goals-hero card border-0 shadow-sm mb-4" variants={riseInVariants}>
                <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-4">
                        <motion.div
                            className="goals-mascot-shell"
                            initial={{ scale: 0.9, opacity: 0, y: 14 }}
                            animate={{ opacity: 1, scale: [1, 1.04, 1], y: [0, -7, 0] }}
                            transition={{
                                opacity: { duration: 0.45, ease: 'easeOut' },
                                scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                                y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            whileHover={{ scale: 1.08, rotate: -3 }}
                        >
                            <img src={bbmasc} alt="Bread Buddy mascot" className="goals-mascot" />
                        </motion.div>

                        <div>
                            <p className="text-uppercase text-muted mb-1 goals-kicker">Goals</p>
                            <h2 className="h4 mb-2">Turn your plan into milestones.</h2>
                            <p className="text-secondary mb-0">
                                Set a target amount and timeframe, then track how many days it should take at your current savings pace.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.article>

            <motion.div className="row g-3 mb-4" variants={riseInVariants}>
                {goalsCards.map((item) => (
                    <div className="col-12 col-md-4" key={item.label}>
                        <motion.article
                            className="goals-bubble card border-0 shadow-sm h-100"
                            whileHover={{ y: -7, scale: 1.02 }}
                            whileTap={{ scale: 0.985 }}
                        >
                            <div className="card-body">
                                <BubbleDecor />
                                <p className="text-muted mb-2">{item.label}</p>
                                <h3 className="h5 mb-0">{item.value}</h3>
                            </div>
                        </motion.article>
                    </div>
                ))}
            </motion.div>

            <motion.article className="card border-0 shadow-sm" variants={riseInVariants}>
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                        <h3 className="h5 mb-0">Goal Progress</h3>
                        <span className="text-secondary small">{progressPercent}% complete</span>
                    </div>

                    <div className="progress goals-progress mb-3" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                        <div className="progress-bar goals-progress-bar" style={{ width: `${progressPercent}%` }} />
                    </div>

                    <p className="text-secondary mb-0">
                        {savingsTarget <= 0
                            ? 'Set a monthly savings target in Dashboard to activate goal tracking.'
                            : gapToTarget === 0
                                ? 'You are on track and have already reached this month\'s target. Great work.'
                                : `You need ${currencyFormatter.format(gapToTarget)} more this month to reach your target.`}
                    </p>
                </div>
            </motion.article>

            <motion.article className="card border-0 shadow-sm mt-4" variants={riseInVariants}>
                <div className="card-body">
                    <h3 className="h5 mb-3">Timeline Planner</h3>

                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                            <label htmlFor="goalAmount" className="form-label text-muted mb-2">Savings Goal Amount</label>
                            <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input
                                    id="goalAmount"
                                    type="text"
                                    inputMode="decimal"
                                    className="form-control goals-input-bubble"
                                    value={goalAmountInput}
                                    onChange={(event) => setGoalAmountInput(event.target.value.replace(/[^\d.]/g, ''))}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <label htmlFor="goalTimeframe" className="form-label text-muted mb-2">Target Timeframe (days)</label>
                            <input
                                id="goalTimeframe"
                                type="text"
                                inputMode="numeric"
                                className="form-control goals-input-bubble"
                                value={timeframeDaysInput}
                                onChange={(event) => setTimeframeDaysInput(event.target.value.replace(/[^\d]/g, ''))}
                                placeholder="90"
                            />
                        </div>
                    </div>

                    <p className="text-secondary mb-2">
                        Current projected savings pace: <strong>{currencyFormatter.format(projectedDailySavings)}/day</strong>
                    </p>

                    <p className="mb-0 text-secondary">
                        {estimatedDaysToGoal === null
                            ? 'Add dashboard values and a valid goal amount to estimate a completion date.'
                            : `At your current pace, it will take about ${estimatedDaysToGoal} days to save ${currencyFormatter.format(goalAmount)}.`}
                        {estimatedDaysToGoal !== null && daysDelta !== null && timeframeDays > 0 && (
                            daysDelta <= 0
                                ? ` You are on pace to finish ${Math.abs(daysDelta)} day${Math.abs(daysDelta) === 1 ? '' : 's'} ahead of your target window.`
                                : ` You are about ${daysDelta} day${daysDelta === 1 ? '' : 's'} behind your target window.`
                        )}
                    </p>
                </div>
            </motion.article>
        </motion.section>
    );
}

// Export the goals component so it can be used in other parts of the application
export default Goals;