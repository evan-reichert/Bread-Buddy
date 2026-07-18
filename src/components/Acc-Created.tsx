// Here is where we will create the authentication boilerplate
// Import the dependencies that we will need to create the authentication component
import './Auth.css';

type AuthProps = {
    onContinue: () => void;
};

// Define the authentication function that will be used to create the authentication component
function Auth({ onContinue }: AuthProps) {
    return (
        <section className="auth-page d-flex align-items-center justify-content-center px-3 py-5">
            <div className="auth-card card shadow-sm border-0">
                <div className="card-body p-4 p-md-5 text-center">
                    <p className="text-uppercase text-secondary fw-semibold mb-2">Welcome</p>
                    <h1 className="h3 mb-3">Sign in to Bread Buddy</h1>
                    <p className="text-muted mb-4">
                        Authentication is coming next. This screen now loads first by default.
                    </p>

                    <button type="button" className="btn btn-success w-100" onClick={onContinue}>
                        Continue
                    </button>
                </div>
            </div>
        </section>
    );
}

// Export the authentication component so it can be used in other parts of the application
export default Auth;