// Here is where we will create the tabs boilerplate
// Import the dependencies that we will need to create the tabs component
import { useState, useEffect, useRef } from 'react';
import { authenticatedGet, authenticatedPut, clearStoredSession } from '../lib/auth';
import bblogo from '../assets/bblogo.png';
import Bank from './Bank';
import Dashboard from './Dashboard';
import Goals from './Goals';
import './Tabs.css';

// Define the BudgetInputs type that will be used to create the tabs component
export type BudgetInputs = {
    monthlyIncome: string;
    rent: string;
    utilities: string;
    other: string;
    variableCosts: string;
    investments: string;
    monthlySavings: string;
};

type BudgetInputsApi = {
    monthlyIncome: number;
    rent: number;
    utilities: number;
    other: number;
    variableCosts: number;
    investments: number;
    monthlySavings: number;
};

type TabsProps = { onLogout: () => void };

// Define the tabs function that will be used to create the tabs component
function Tabs({ onLogout }: TabsProps) {
    const [activeTab, setActiveTab] = useState<string>('Dashboard');
    const hasHydratedRef = useRef(false);
    const saveTimeoutRef = useRef<number | null>(null);
    const [budgetInputs, setBudgetInputs] = useState<BudgetInputs>({
        monthlyIncome: '',
        rent: '',
        utilities: '',
        other: '',
        variableCosts: '',
        investments: '',
        monthlySavings: '',
    })

    const isAuthExpiredError = (error: unknown) => (
        error instanceof Error
        && (
            error.message.includes('Session expired')
            || error.message.includes('Authentication required')
        )
    );

    useEffect(() => {
        if (!hasHydratedRef.current) {
            hasHydratedRef.current = true;
            return;
        }

        if (saveTimeoutRef.current !== null) {
            window.clearTimeout(saveTimeoutRef.current);
        }

        const toNumber = (value: string) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };

        saveTimeoutRef.current = window.setTimeout(async () => {
            try {
                await authenticatedPut('/me/budget-inputs', {
                    monthlyIncome: toNumber(budgetInputs.monthlyIncome),
                    rent: toNumber(budgetInputs.rent),
                    utilities: toNumber(budgetInputs.utilities),
                    other: toNumber(budgetInputs.other),
                    variableCosts: toNumber(budgetInputs.variableCosts),
                    investments: toNumber(budgetInputs.investments),
                    monthlySavings: toNumber(budgetInputs.monthlySavings),
                });
            } catch (error) {
                if (isAuthExpiredError(error)) {
                    onLogout();
                    return;
                }
                console.error('Failed to save budget inputs:', error);
            }
        }, 500);

        return () => {
            if (saveTimeoutRef.current !== null) {
                window.clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [budgetInputs]);

    useEffect(() => {
        const fetchBudgetInputs = async () => {
            try {
                const response = await authenticatedGet<BudgetInputsApi>('/me/budget-inputs');
                setBudgetInputs({
                    monthlyIncome: String(response.monthlyIncome ?? ''),
                    rent: String(response.rent ?? ''),
                    utilities: String(response.utilities ?? ''),
                    other: String(response.other ?? ''),
                    variableCosts: String(response.variableCosts ?? ''),
                    investments: String(response.investments ?? ''),
                    monthlySavings: String(response.monthlySavings ?? ''),
                });
            } catch (error) {
                if (isAuthExpiredError(error)) {
                    onLogout();
                    return;
                }
                console.error('Failed to fetch budget inputs:', error);
            }
        };

        fetchBudgetInputs();
    }, []);
    
    function handleLogout() {
        if (saveTimeoutRef.current !== null) {
            window.clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        clearStoredSession();
        onLogout();
    }

    return (
        <div className="bb-container d-flex flex-column min-vh-100 w-100">

            {/* Create the tabs header */}
            <header className="bb-tabs-header navbar bg-white border-bottom sticky-top px-4 py-3">
                <div className="w-100 d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="bb-brand-section d-flex align-items-center">
                        <img src={bblogo} className="bb-brand-logo" alt="Bread Buddy logo" />
                        <div className="bb-brand-text d-flex flex-column">
                            <span className="bb-brand-title">Bread Buddy</span>
                            <span className="bb-brand-subtitle">Keep your bread up.</span>
                        </div>
                    </div>

                    <nav className="nav nav-pills bb-tabs-nav" aria-label="Main sections">
                        <button
                            type="button"
                            className={`nav-link bb-tab-link ${activeTab === 'Dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Dashboard')}
                        >
                            Dashboard
                        </button>
                        <button
                            type="button"
                            className={`nav-link bb-tab-link ${activeTab === 'Bank' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Bank')}
                        >
                            Bank
                        </button>
                        <button
                            type="button"
                            className={`nav-link bb-tab-link ${activeTab === 'Goals' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Goals')}
                        >
                            Goals
                        </button>
                        <button
                            type="button"
                            className={`nav-link bb-tab-link`}
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            {/* Content for the active tab */}
            <section className="bb-tab-content card shadow-sm border-0">
                <div className="card-body">
                    {activeTab === 'Dashboard' && (
                        <Dashboard budgetInputs={budgetInputs} onBudgetInputsChange={setBudgetInputs} />
                    )}
                    {activeTab === 'Bank' && <Bank budgetInputs={budgetInputs} />}
                    {activeTab === 'Goals' && <Goals budgetInputs={budgetInputs} />}
                </div>
            </section>
            </div>
    )
}

// Export the tabs component so it can be used in other parts of the application
export default Tabs;