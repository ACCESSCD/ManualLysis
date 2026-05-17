import React from 'react';

const MedDosesView = () => {
  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#525659', minHeight: '100vh', width: '100%' }}>
      <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: '#fff', marginBottom: '30px', textAlign: 'center', fontSize: '2.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>MedDoses Reference</h1>
        <div style={{ 
          width: '100%', 
          backgroundColor: '#fff', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <img 
            src={`${import.meta.env.BASE_URL}Doses.jpeg`}
            alt="MedDoses Reference Chart" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              display: 'block', 
              borderRadius: '8px',
              border: '1px solid #eee'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default MedDosesView;
