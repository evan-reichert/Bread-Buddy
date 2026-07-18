// Here is where we will create the authentication boilerplate
// Import the dependencies that we will need to create the authentication component
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import bblogo from '../assets/bblogo.png';
import './Acc-Created.css';

type AuthProps = {
    onCreateAccount: () => void;
    onSignIn: () => void;
};

// Define the authentication function that will be used to create the authentication component
function Auth({ onCreateAccount, onSignIn }: AuthProps) {
    const reduceMotion = useReducedMotion();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const canSignIn = credentials.username.trim().length > 0 && credentials.password.trim().length > 0;

    return (
        <motion.section
            className="auth-page d-flex flex-column align-items-center justify-content-center px-3 py-5"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
        >
            <motion.header
                className="auth-header-center mb-4"
                aria-label="Bread Buddy brand"
                initial={reduceMotion ? undefined : { opacity: 0, y: -26 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <span className="auth-header-logo-shell" aria-hidden="true">
                    <img src={bblogo} alt="Bread Buddy logo" className="auth-header-logo" />
                </span>
                <span className="auth-header-title">Bread Buddy</span>
            </motion.header>

            <motion.div
                className="auth-card auth-pop card shadow-sm border-0"
                initial={reduceMotion ? undefined : { opacity: 0, y: -18, scale: 0.985 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
            >
                <div className="card-body p-4 p-md-5 text-center">
                    <p className="text-uppercase text-secondary fw-semibold mb-2">Welcome</p>
                    <h1 className="h3 mb-3">Sign in to Bread Buddy</h1>
                    <p className="auth-support-text text-muted mb-4">
                        Secure account access with a calm, focused workflow.
                    </p>

                    <p className="create-account-text text-muted mb-4">
                        Don't have an account? Create one now to start managing your money with Bread Buddy.
                    </p>

                    <button type="button" className="btn btn-success w-100 mb-3" onClick={onCreateAccount}>
                        Create Account
                    </button>

                    <p className="text-muted mb-2">Already have an account?</p>
                    <div className="auth-login-bubbles mb-3">
                        <input
                            type="text"
                            className="form-control auth-input-bubble"
                            placeholder="Username"
                            autoComplete="username"
                            value={credentials.username}
                            onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
                        />
                        <input
                            type="password"
                            className="form-control auth-input-bubble"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                        />
                    </div>

                    <button type="button" className="btn btn-outline-secondary w-100" onClick={onSignIn} disabled={!canSignIn}>
                        Sign In
                    </button>
                </div>
            </motion.div>
        </motion.section>
    );
}

// Export the authentication component so it can be used in other parts of the application
export default Auth;