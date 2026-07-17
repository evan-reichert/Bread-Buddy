// Here is where we will create the bank tab content
// Import the dependencies that we will need to create the bank tab content
import bbmasc from '../assets/bbmasc.png';
import { motion } from 'framer-motion';
import greenOrb from '../assets/green-orb.svg';
import greenSpark from '../assets/green-spark.svg';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import './Bank.css';

// Define the WeeklySavings type and the weekly savings data that will be used to create the bank tab content
type WeeklySavings = {
    week: string;
    amount: number;
};
// Define the weekly savings data that will be used to create the bank tab content
const weeklySavingsData: WeeklySavings[] = [
    { week: 'Week 1', amount: 45 },
    { week: 'Week 2', amount: 70 },
    { week: 'Week 3', amount: 95 },
    { week: 'Week 4', amount: 82 },
];

// Define the savings start date that will be used to calculate the number of months saving
const savingsStartDate = new Date('2026-01-01');

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
                className={`${className} bank-svg-spark`}
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: [0.3, 0.75, 0.3], rotate: [-10, 2, -10], y: [0, -4, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            />
        </>
    );
}

// Define the function that will be used to calculate the number of months saving
function getMonthsSaving(startDate: Date): number {
    const now = new Date();
    const yearsDiff = now.getFullYear() - startDate.getFullYear();
    const monthsDiff = now.getMonth() - startDate.getMonth();
    return Math.max(1, yearsDiff * 12 + monthsDiff + 1);
}

// Define the bank function that will be used to create the bank tab content
function Bank() {
    const totalSaved = 1462;
    const monthlyGoal = 1600;
    const remainingToGoal = Math.max(0, monthlyGoal - totalSaved);
    const monthsSaving = getMonthsSaving(savingsStartDate);
    const monthToDateContribution = weeklySavingsData.reduce((sum, item) => sum + item.amount, 0);
    const weeklyAverage = Math.round(monthToDateContribution / weeklySavingsData.length);

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
            <motion.div className="bank-hero card border-0 shadow-sm mb-4" variants={riseInVariants}>
                <div className="card-body d-flex flex-column flex-lg-row align-items-center justify-content-between gap-4">
                    <div className="d-flex align-items-center gap-3">
                        <motion.div
                            className="bank-mascot-shell"
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
                            <img src={bbmasc} alt="Bread Buddy mascot" className="bank-mascot" />
                        </motion.div>

                        <div>
                            <p className="text-uppercase text-muted mb-1 bank-kicker">Bread Buddy Bank</p>
                            <h2 className="h4 mb-1">Your savings are on a solid streak.</h2>
                            <p className="mb-0 text-secondary">{monthsSaving} months of consistent saving progress.</p>
                        </div>
                    </div>

                    <motion.div
                        className="saved-bubble text-center"
                        whileHover={{ y: -6, scale: 1.03, boxShadow: '0 18px 30px rgba(34, 197, 94, 0.35)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <OrbDecor className="bank-svg-orb bank-svg-orb--saved" />
                        <p className="mb-1 saved-bubble-label">Saved so far</p>
                        <p className="mb-0 saved-bubble-value">{currencyFormatter.format(totalSaved)}</p>
                    </motion.div>
                </div>
            </motion.div>

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
                                <OrbDecor className="bank-svg-orb bank-svg-orb--metric" />
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
                            <BarChart data={weeklySavingsData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(34, 197, 94, 0.10)' }}
                                    formatter={(value: number) => [currencyFormatter.format(value), 'Saved']}
                                />
                                <Bar dataKey="amount" radius={[10, 10, 0, 0]} fill="#22C55E" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.article>
            
            <motion.article className="card border-0 shadow-sm" variants={riseInVariants}>
                <div className="card-body">
                    <h3 className="h5 mb-3">Quick insights</h3>
                    <ul className="bank-insights list-unstyled mb-0">
                        <li>Best week this month: <strong>{currencyFormatter.format(95)}</strong></li>
                        <li>Consistency streak: <strong>{monthsSaving} months</strong></li>
                        <li>Next milestone: <strong>{currencyFormatter.format(2000)}</strong></li>
                    </ul>
                </div>
            </motion.article>
        </motion.section>
    );
}

// Export the bank component so it can be used in other parts of the application
export default Bank;