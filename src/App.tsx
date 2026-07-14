import { useState } from 'react';
import Auth from './components/Auth';
import Tabs from './components/Tabs';
import './App.css';

function App() {
  const [showAuth, setShowAuth] = useState(true);

  return (
    <main className="appShell">
      {showAuth ? <Auth onContinue={() => setShowAuth(false)} /> : <Tabs />}
    </main>
  );
}

export default App;
