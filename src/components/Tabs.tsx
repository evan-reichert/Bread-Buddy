// Here is where we will create the tabs boilerplate
// Import the dependencies that we will need to create the tabs component
import { useState } from 'react';
import './Tabs.css';

// Define the tabs function that will be used to create the tabs component
function Tabs() {
    const [activeTab, setActiveTab] = useState<string>("Dashboard");

    const StyleSheet = {
        container: 'container',
        tabsHeader: 'tabsHeader',
        tab: 'tab',
        activeTab: 'activeTab',
        tabContent: 'tabContent',
    };

    return (
        <div className={StyleSheet.container}>

            {/* Create the tabs header */}
            <div className={StyleSheet.tabsHeader}>

                <div
                    className={activeTab === "Dashboard" ? StyleSheet.activeTab : StyleSheet.tab}
                    onClick={() => setActiveTab("Dashboard")}
                >
                    Dashboard
                </div>
                <div
                    className={activeTab === "Bank" ? StyleSheet.activeTab : StyleSheet.tab}
                    onClick={() => setActiveTab("Bank")}
                >
                    Bank
                </div>
                <div
                    className={activeTab === "Goals" ? StyleSheet.activeTab : StyleSheet.tab}
                    onClick={() => setActiveTab("Goals")}
                >
                    Goals
                </div>
            </div>

            {/* Content for the active tab */}
            <div className={StyleSheet.tabContent}>
                {activeTab === "Dashboard" && <div>Dashboard Content</div>}
                {activeTab === "Bank" && <div>Bank Content</div>}
                {activeTab === "Goals" && <div>Goals Content</div>}
            </div>
        </div>
    )
}

// Export the tabs component so it can be used in other parts of the application
export default Tabs;