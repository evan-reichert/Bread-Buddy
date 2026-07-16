// Here is where we will create the dashboard component
// Import the dependencies that we will need to create the dashboard component
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import bbmasc from '../assets/bbmasc.png';
import greenOrb from '../assets/green-orb.svg';
import greenSpark from '../assets/green-spark.svg';
import './Dashboard.css';

type BudgetField = {
  key: 'monthlyIncome' | 'rent' | 'utilities' | 'other';
  label: string;
};

const budgetFields: BudgetField[] = [
  { key: 'monthlyIncome', label: 'Monthly Income' },
  { key: 'rent', label: 'Rent' },
  { key: 'utilities', label: 'Utilities' },
  { key: 'other', label: 'Other Fixed Costs' },
];

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

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
} as const;

function BubbleDecor() {
  return (
    <>
      <motion.img
        src={greenOrb}
        alt=""
        aria-hidden="true"
        className="dashboard-svg-orb"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.08, 1] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={greenSpark}
        alt=""
        aria-hidden="true"
        className="dashboard-svg-spark"
        initial={{ opacity: 0, rotate: -8 }}
        animate={{ opacity: [0.35, 0.75, 0.35], rotate: [-8, 0, -8], y: [0, -4, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}

function Dashboard() {
  const [activeDashboardTab, setActiveDashboardTab] = useState<'Budget' | 'Savings'>('Budget');
  const [budget, setBudget] = useState({
    monthlyIncome: '',
    rent: '',
    utilities: '',
    other: '',
    monthlySavings: '',
  });

  const handleFieldChange = (key: keyof typeof budget, value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    setBudget((prev) => ({ ...prev, [key]: numericValue }));
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const totals = useMemo(() => {
    const income = Number(budget.monthlyIncome) || 0;
    const expenses = (Number(budget.rent) || 0) + (Number(budget.utilities) || 0) + (Number(budget.other) || 0);
    const savings = Number(budget.monthlySavings) || 0;

    return {
      income,
      expenses,
      savings,
      leftover: Math.max(0, income - expenses - savings),
    };
  }, [budget]);

  return (
    <motion.section
      className="dashboard-budget"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="dashboard-header card border-0 shadow-sm mb-4" variants={itemVariants}>
        <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <p className="text-uppercase text-muted mb-1 dashboard-kicker">Dashboard</p>
            <h2 className="h4 mb-1">Monthly Planner</h2>
            <p className="mb-0 text-secondary">Set your core numbers and tune your monthly plan.</p>
          </div>

          <nav className="nav nav-pills dashboard-subtabs" aria-label="Dashboard sections">
            <button
              type="button"
              className={`nav-link dashboard-subtab-link ${activeDashboardTab === 'Budget' ? 'active' : ''}`}
              onClick={() => setActiveDashboardTab('Budget')}
            >
              Budget Inputs
            </button>
            <button
              type="button"
              className={`nav-link dashboard-subtab-link ${activeDashboardTab === 'Savings' ? 'active' : ''}`}
              onClick={() => setActiveDashboardTab('Savings')}
            >
              Monthly Savings
            </button>
          </nav>
        </div>
      </motion.div>

      <motion.article
        className="dashboard-support card border-0 shadow-sm mb-4"
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.01 }}
      >
        <div className="card-body d-flex flex-column flex-md-row align-items-center gap-3 gap-md-4">
          <motion.div
            className="dashboard-mascot-shell"
            initial={{ scale: 0.9, opacity: 0, y: 14 }}
            animate={{
              opacity: 1,
              scale: [1, 1.04, 1],
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { duration: 0.4, ease: 'easeOut' },
              scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{ scale: 1.09, rotate: -3 }}
          >
            <img src={bbmasc} alt="Bread Buddy mascot support" className="dashboard-mascot" />
          </motion.div>

          <div className="dashboard-support-copy text-center text-md-start">
            <p className="text-uppercase text-muted mb-1 dashboard-kicker">Buddy Support</p>
            <h3 className="h5 mb-1">I am here to help you plan this month.</h3>
            <p className="text-secondary mb-0">
              Fill out your bubbles, then check Monthly Savings to tune your target.
            </p>
          </div>
        </div>
      </motion.article>

      {activeDashboardTab === 'Budget' && (
        <motion.div className="row g-3" variants={itemVariants}>
          {budgetFields.map((field) => (
            <div className="col-12 col-md-6" key={field.key}>
              <motion.article
                className="dashboard-bubble card border-0 shadow-sm h-100"
                whileHover={{ y: -7, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
              >
                <div className="card-body">
                  <BubbleDecor />
                  <label htmlFor={field.key} className="form-label text-muted mb-2">
                    {field.label}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      id={field.key}
                      type="text"
                      inputMode="decimal"
                      className="form-control"
                      value={budget[field.key]}
                      onChange={(event) => handleFieldChange(field.key, event.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </motion.article>
            </div>
          ))}
        </motion.div>
      )}

      {activeDashboardTab === 'Savings' && (
        <motion.div className="row g-3" variants={itemVariants}>
          <div className="col-12 col-lg-7">
            <motion.article
              className="dashboard-bubble card border-0 shadow-sm h-100"
              whileHover={{ y: -7, scale: 1.02 }}
              whileTap={{ scale: 0.985 }}
            >
              <div className="card-body">
                <BubbleDecor />
                <label htmlFor="monthlySavings" className="form-label text-muted mb-2">
                  Target Monthly Savings
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text">$</span>
                  <input
                    id="monthlySavings"
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    value={budget.monthlySavings}
                    onChange={(event) => handleFieldChange('monthlySavings', event.target.value)}
                    placeholder="0"
                  />
                </div>
                <p className="text-secondary mb-0">
                  Tip: Start with 10-20% of take-home income and raise it as fixed costs improve.
                </p>
              </div>
            </motion.article>
          </div>

          <div className="col-12 col-lg-5">
            <motion.article
              className="dashboard-bubble card border-0 shadow-sm h-100"
              whileHover={{ y: -7, scale: 1.02 }}
              whileTap={{ scale: 0.985 }}
            >
              <div className="card-body">
                <BubbleDecor />
                <p className="text-muted mb-2">Projected Leftover</p>
                <p className="dashboard-leftover mb-2">{formatter.format(totals.leftover)}</p>
                <p className="text-secondary mb-0 small">
                  Based on income, fixed costs, and your monthly savings target.
                </p>
              </div>
            </motion.article>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}

export default Dashboard;
