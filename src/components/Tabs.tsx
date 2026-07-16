// Here is where we will create the tabs boilerplate
// Import the dependencies that we will need to create the tabs component
import { useState } from 'react';
import bblogo from '../assets/bblogo.png';
import Bank from './Bank';
import Dashboard from './Dashboard';
import './Tabs.css';

// Define the tabs function that will be used to create the tabs component
function Tabs() {
    const [activeTab, setActiveTab] = useState<string>('Dashboard');

    return (
        <div className="bb-container d-flex flex-column min-vh-100 w-100">

            {/* Create the tabs header */}
            <header className="bb-tabs-header navbar bg-white border-bottom sticky-top px-4 py-3">
                <div className="w-100 d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="bb-brand-section d-flex align-items-center">
                        <img src={bblogo} className="bb-brand-logo" alt="Bread Buddy logo" />
                        <span className="bb-brand-title">Bread Buddy</span>
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
                    </nav>
                </div>
            </header>

            {/* Content for the active tab */}
            <section className="bb-tab-content card shadow-sm border-0">
                <div className="card-body">
                    {activeTab === 'Dashboard' && <Dashboard />}
                    {activeTab === 'Bank' && <Bank />}
                    {activeTab === 'Goals' && <div>Goals Content</div>}
                </div>
            </section>
            </div>
    )
}

// Export the tabs component so it can be used in other parts of the application
export default Tabs;