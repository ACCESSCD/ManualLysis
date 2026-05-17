import React, { useState } from 'react';
import ManualLysisView from './features/ManualLysisView';
import MedDosesView from './features/MedDosesView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('manualLysis');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false); // Close sidebar on selection
  };

  return (
    <div className="app-container">
      <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
        ☰ Menu
      </button>

      <div className={`overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Meds/ManualLysis</h2>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <ul className="nav-list">
          <li 
            className={currentView === 'manualLysis' ? 'active' : ''} 
            onClick={() => handleNavClick('manualLysis')}
          >
            Manual Lysis
          </li>
          <li 
            className={currentView === 'medDoses' ? 'active' : ''} 
            onClick={() => handleNavClick('medDoses')}
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
