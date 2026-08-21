// Here is where we will create the bank tab content
// Import the dependencies that we will need to create the bank tab content
import { motion } from 'framer-motion';
import greenOrb from '../assets/green-orb.svg';
import greenSpark from '../assets/green-spark.svg';
import yellowSpark from '../assets/yellow-spark.svg';
import redSpark from '../assets/red-spark.svg';
import yellowOrb from '../assets/yellow-orb.svg';
import redOrb from '../assets/red-orb.svg';
import {
    Bar,
    BarChart,
    Cell,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Health from './Health';
import type { BudgetInputs } from './Tabs';
import { getTier, type HealthTier } from './TierLogic';
import './Bank.css';

// Define the WeeklySavings type and the weekly savings data that will be used to create the bank tab content
type WeeklySavings = {
    week: string;
    amount: number;
};

// Define the animation variants that will be used to create the bank tab content
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.08,
        },
    },
} as const;

// Define the rise-in animation variants that will be used to create the bank tab content
const riseInVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.45, ease: 'easeOut' },
    },
} as const;

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
                className={`${className} bank-svg-spark`}
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: [0.3, 0.75, 0.3], rotate: [-10, 2, -10], y: [0, -4, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            />
        </>
    );
}

function buildWeeklySavings(totalSaved: number): WeeklySavings[] {
    if (totalSaved <= 0) {
        return [
            { week: 'Week 1', amount: 0 },
            { week: 'Week 2', amount: 0 },
            { week: 'Week 3', amount: 0 },
            { week: 'Week 4', amount: 0 },
        ];
    }

    // Deliberately uneven distribution to better mimic real week-to-week saving changes.
    const weights = [0.19, 0.23, 0.27, 0.31];
    const rounded = weights.map((weight) => Math.round(totalSaved * weight));
    const roundedTotal = rounded.reduce((sum, value) => sum + value, 0);
    const correction = Math.round(totalSaved - roundedTotal);
    rounded[rounded.length - 1] = Math.max(0, rounded[rounded.length - 1] + correction);

    return rounded.map((amount, index) => ({
        week: `Week ${index + 1}`,
        amount,
    }));
}

// Define the bank function that will be used to create the bank tab content
type BankProps = {
    budgetInputs: BudgetInputs;
};

function Bank({ budgetInputs }: BankProps) {
    const income = Number(budgetInputs.monthlyIncome) || 0;
    const rent = Number(budgetInputs.rent) || 0;
    const utilities = Number(budgetInputs.utilities) || 0;
    const other = Number(budgetInputs.other) || 0;
    const variableCosts = Number(budgetInputs.variableCosts) || 0;
    const investments = Number(budgetInputs.investments) || 0;
    const monthlyGoal = Number(budgetInputs.monthlySavings) || 0;
    const fixedCosts = rent + utilities + other + variableCosts + investments;
    const totalSaved = Math.max(0, income - fixedCosts);
    const bankTier = getTier({
        income,
        fixedCosts,
        monthlyGoal,
    });
    const remainingToGoal = Math.max(0, monthlyGoal - totalSaved);
    const weeklySavingsData = buildWeeklySavings(totalSaved);
    const monthToDateContribution = weeklySavingsData.reduce((sum, item) => sum + item.amount, 0);
    const weeklyAverage = Math.round(monthToDateContribution / weeklySavingsData.length);
    const bestWeekAmount = Math.max(...weeklySavingsData.map((item) => item.amount), 0);
    const nextMilestone = totalSaved > 0 ? Math.ceil(totalSaved / 500) * 500 : 500;
    const yAxisMax = Math.max(100, ...weeklySavingsData.map((item) => item.amount));
    const chartAnimationKey = weeklySavingsData.map((item) => item.amount).join('-');

    // Define the currency formatter that will be used to format the currency values
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

    // Define the metric cards that will be used to display the bank metrics
    const metricCards = [
        { label: 'Monthly Goal', value: currencyFormatter.format(monthlyGoal) },
        { label: 'Remaining to Goal', value: currencyFormatter.format(remainingToGoal) },
        { label: 'Weekly Average', value: currencyFormatter.format(weeklyAverage) },
    ];

    // Return the bank tab content that will be rendered in the bank tab
    return (
        <motion.section
            className="bank-dashboard container-fluid px-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Health budgetInputs={budgetInputs} />

            <div className="row g-3 mb-4">
                {metricCards.map((item) => (
                    <div className="col-12 col-md-4" key={item.label}>
                        <motion.article
                            className="card border-0 shadow-sm h-100 metric-bubble"
                            variants={riseInVariants}
                            whileHover={{ y: -7, scale: 1.02 }}
                            whileTap={{ scale: 0.985 }}
                        >
                            <div className="card-body">
                                <OrbDecor className="bank-svg-orb bank-svg-orb--metric" tier={bankTier} />
                                <p className="text-muted mb-2">{item.label}</p>
                                <h3 className="h5 mb-0">{item.value}</h3>
                            </div>
                        </motion.article>
                    </div>
                ))}
            </div>

            <motion.article className="card border-0 shadow-sm mb-4" variants={riseInVariants}>
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                        <h3 className="h5 mb-0">Amount saved per week</h3>
                        <span className="text-secondary small">Last 4 weeks</span>
                    </div>

                    <div className="bank-chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                key={chartAnimationKey}
                                data={weeklySavingsData}
                                margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                                <YAxis
                                    domain={[0, Math.ceil(yAxisMax * 1.15)]}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(34, 197, 94, 0.10)' }}
                                    formatter={(value) => {
                                        const numericValue =
                                            typeof value === 'number' ? value : Number(value) || 0;
                                        return [currencyFormatter.format(numericValue), 'Saved'];
                                    }}
                                />
                                <Bar
                                    dataKey="amount"
                                    radius={[10, 10, 0, 0]}
                                    isAnimationActive={true}
                                    animationDuration={900}
                                    animationBegin={120}
                                    animationEasing="ease-out"
                                    minPointSize={4}
                                >
                                    {weeklySavingsData.map((item, index) => (
                                        <Cell
                                            key={`${item.week}-${item.amount}`}
                                            fill={index % 2 === 0 ? '#22C55E' : '#16A34A'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.article>
            
            <motion.article className="card border-0 shadow-sm" variants={riseInVariants}>
                <div className="card-body">
                    <h3 className="h5 mb-3">Quick insights</h3>
                    <ul className="bank-insights list-unstyled mb-0">
                        <li>Best projected week: <strong>{currencyFormatter.format(bestWeekAmount)}</strong></li>
                        <li>Fixed monthly costs: <strong>{currencyFormatter.format(fixedCosts)}</strong></li>
                        <li>Next milestone: <strong>{currencyFormatter.format(nextMilestone)}</strong></li>
                    </ul>
                </div>
            </motion.article>
        </motion.section>
    );
}

// Export the bank component so it can be used in other parts of the application
export default Bank;