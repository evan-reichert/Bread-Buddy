// Here is where the account creation component will be created
// Import the dependencies that we will need to create the account creation component
import { useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import bblogo from '../assets/bblogo.png';
import './Acc-New.css';

type AccNewProps = {
    onContinue: () => void;
};

// Define the account creation function that will be used to create the account creation component
function AuthNew({ onContinue }: AccNewProps) {
    const reduceMotion = useReducedMotion();
    const [credentials, setCredentials] = useState({ username: '', password: '', confirmPassword: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const username = credentials.username.trim();
    const password = credentials.password;
    const confirmPassword = credentials.confirmPassword;

    const usernameIsValid = /^[a-zA-Z0-9._-]{3,24}$/.test(username);
    const passwordIsValid = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
    const passwordsMatch = password.length > 0 && password === confirmPassword;
    const canCreate = usernameIsValid && passwordIsValid && passwordsMatch && !isCreating;

    const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!usernameIsValid) {
            setErrorMessage('Username must be 3-24 characters and can include letters, numbers, dot, underscore, or hyphen.');
            return;
        }

        if (!passwordIsValid) {
            setErrorMessage('Password must be at least 8 characters and include at least one letter and one number.');
            return;
        }

        if (!passwordsMatch) {
            setErrorMessage('Passwords do not match. Please confirm your password.');
            return;
        }

        setErrorMessage('');
        setIsCreating(true);

        try {
            // Placeholder persistence until backend signup endpoint is connected.
            localStorage.setItem(
                'bb_user_signup_draft',
                JSON.stringify({ username, createdAt: new Date().toISOString() }),
            );
            onContinue();
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <motion.section
            className="acc-new-page d-flex flex-column align-items-center justify-content-center px-3 py-5"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
        >
            <motion.header
                className="acc-new-header-center mb-4"
                initial={reduceMotion ? undefined : { opacity: 0, y: -24 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <span className="acc-new-header-logo-shell" aria-hidden="true">
                    <img src={bblogo} alt="Bread Buddy logo" className="acc-new-header-logo" />
                </span>
                <span className="acc-new-header-title">Bread Buddy</span>
            </motion.header>

            <motion.div
                className="acc-new-card card shadow-sm border-0"
                initial={reduceMotion ? undefined : { opacity: 0, y: -18, scale: 0.985 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
            >
                <form className="card-body p-4 p-md-5 text-center" onSubmit={handleCreateAccount}>
                    <p className="text-uppercase text-secondary fw-semibold mb-2">Welcome</p>
                    <h1 className="h3 mb-3">Create your Bread Buddy account</h1>
                    <p className="text-muted mb-4">
                        Create your account to start stacking your bread.
                    </p>

                    <div className="auth-create-bubbles mb-3">
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
                            autoComplete="new-password"
                            value={credentials.password}
                            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                        />
                        <input
                            type="password"
                            className="form-control auth-input-bubble"
                            placeholder="Confirm Password"
                            autoComplete="new-password"
                            value={credentials.confirmPassword}
                            onChange={(event) => setCredentials((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                        />
                    </div>

                    {errorMessage && <p className="acc-new-error mb-3">{errorMessage}</p>}

                    <button type="submit" className="btn btn-success w-100" disabled={!canCreate}>
                        {isCreating ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </motion.div>
        </motion.section>
    );
}

// Export the account creation component so it can be used in other parts of the application
export default AuthNew;