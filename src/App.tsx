import { useState } from 'react';
import SolarSystem from './components/SolarSystem';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [pat, setPat] = useState('');

  return (
    <div className="App" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        username={username}
        onUsernameChange={setUsername}
        pat={pat}
        onPatChange={setPat}
      />
      <div className="solar-system-slot" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SolarSystem />
      </div>
    </div>
  );
}

export default App;
