import { useState } from 'react';
import Auth from './components/Acc-Created';
import AccNew from './components/Acc-New';
import Tabs from './components/Tabs';
import { hasStoredSession, loginUser, persistSession, registerUser, type Credentials } from './lib/auth';
import './App.css';

function App() {
  const [screen, setScreen] = useState<'auth' | 'create-account' | 'app'>(
    hasStoredSession() ? 'app' : 'auth',
  );

  const handleSignIn = async (credentials: Credentials) => {
    const authResponse = await loginUser(credentials);
    persistSession(authResponse, authResponse.username);
    setScreen('app');
  };

  const handleCreateAccount = async (credentials: Credentials) => {
    const registerResponse = await registerUser(credentials);
    persistSession(registerResponse, registerResponse.username);
    setScreen('app');
  };

  return (
    <main className="appShell">
      {screen === 'auth' && (
        <Auth
          onCreateAccount={() => setScreen('create-account')}
          onSignIn={handleSignIn}
        />
      )}
      {screen === 'create-account' && (
        <AccNew
          onCreateAccount={handleCreateAccount}
          onBackToSignIn={() => setScreen('auth')}
        />
      )}
      {screen === 'app' && <Tabs />}
    </main>
  );
}

export default App;
