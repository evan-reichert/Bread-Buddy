import { useState } from 'react';
import Auth from './components/Acc-Created';
import AccNew from './components/Acc-New';
import Tabs from './components/Tabs';
import './App.css';

function App() {
  const [screen, setScreen] = useState<'auth' | 'create-account' | 'app'>('auth');

  return (
    <main className="appShell">
      {screen === 'auth' && (
        <Auth
          onCreateAccount={() => setScreen('create-account')}
          onSignIn={() => setScreen('app')}
        />
      )}
      {screen === 'create-account' && <AccNew onContinue={() => setScreen('app')} />}
      {screen === 'app' && <Tabs />}
    </main>
  );
}

export default App;
