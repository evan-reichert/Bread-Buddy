import { useCallback, useEffect, useRef, useState } from 'react';
import Auth from './components/Acc-Created';
import AccNew from './components/Acc-New';
import Tabs from './components/Tabs';
import {
  clearStoredSession,
  hasStoredSession,
  isSessionExpired,
  loginUser,
  persistSession,
  registerUser,
  SESSION_INACTIVITY_TIMEOUT_MS,
  touchSessionActivity,
  type Credentials,
} from './lib/auth';
import './App.css';

function App() {
  const inactivityTimerRef = useRef<number | null>(null);
  const [screen, setScreen] = useState<'auth' | 'create-account' | 'app'>(
    (() => {
      if (!hasStoredSession()) {
        return 'auth';
      }

      if (isSessionExpired()) {
        clearStoredSession();
        return 'auth';
      }

      return 'app';
    })(),
  );

  const logoutToAuth = useCallback(() => {
    clearStoredSession();
    setScreen('auth');
  }, []);

  const resetInactivityTimer = useCallback(() => {
    touchSessionActivity();

    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      logoutToAuth();
    }, SESSION_INACTIVITY_TIMEOUT_MS);
  }, [logoutToAuth]);

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

  useEffect(() => {
    if (screen !== 'app') {
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    if (isSessionExpired()) {
      logoutToAuth();
      return;
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity);
    });

    resetInactivityTimer();

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [logoutToAuth, resetInactivityTimer, screen]);

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
      {screen === 'app' && <Tabs onLogout={logoutToAuth} />}
    </main>
  );
}

export default App;
