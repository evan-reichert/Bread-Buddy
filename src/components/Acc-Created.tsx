// Here is where we will create the authentication boilerplate
// Import the dependencies that we will need to create the authentication component
import bblogo from '../assets/bblogo.png';
import './Acc-Created.css';

type AuthProps = {
    onContinue: () => void;
};

// Define the authentication function that will be used to create the authentication component
function Auth({ onContinue }: AuthProps) {
    return (
        <section className="auth-page d-flex flex-column align-items-center justify-content-center px-3 py-5">
            <header className="auth-header-center mb-4" aria-label="Bread Buddy brand">
                <img src={bblogo} alt="Bread Buddy logo" className="auth-header-logo" />
                <span className="auth-header-title">Bread Buddy</span>
            </header>
            <div className="auth-card auth-pop card shadow-sm border-0">
                <div className="card-body p-4 p-md-5 text-center">
                    <p className="text-uppercase text-secondary fw-semibold mb-2">Welcome</p>
                    <h1 className="h3 mb-3">Sign in to Bread Buddy</h1>

                    <p className="create-account-text text-muted mb-4">
                        Don't have an account? Create one now to start managing your money with Bread Buddy.
                    </p>

                    <button type="button" className="btn btn-success w-100 mb-3" onClick={onContinue}>
                        Create Account
                    </button>

                    <p className="text-muted mb-2">Already have an account?</p>
                    <button type="button" className="btn btn-outline-secondary w-100" onClick={onContinue}>
                        Sign In
                    </button>
                </div>
            </div>
        </section>
    );
}

// Export the authentication component so it can be used in other parts of the application
export default Auth;