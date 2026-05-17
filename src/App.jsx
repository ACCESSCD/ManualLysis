import React, { useState } from 'react';
import ManualLysisView from './features/ManualLysisView';
import MedDosesView from './features/MedDosesView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('manualLysis');

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Meds/ManualLysis</h2>
        </div>
        <ul className="nav-list">
          <li 
            className={currentView === 'manualLysis' ? 'active' : ''} 
            onClick={() => setCurrentView('manualLysis')}
          >
            Manual Lysis
          </li>
          <li 
            className={currentView === 'medDoses' ? 'active' : ''} 
            onClick={() => setCurrentView('medDoses')}
          >
            MedDoses
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {currentView === 'manualLysis' && <ManualLysisView />}
        {currentView === 'medDoses' && <MedDosesView />}
      </main>
    </div>
  );
}

export default App;
