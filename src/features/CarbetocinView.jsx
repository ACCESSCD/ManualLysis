import React from 'react';

const indications = [
  'תאומים',
  'חשד למקרוסומיה מעל 4 ק"ג',
  'שלית פתח / אקרטה',
  'קיסרי intrapartum',
  'מעל 2 קיסרים בעבר',
  'BMI מעל 35',
  'PPH בעבר',
  'Grandmultipara – לידה 6 ומעלה',
];

const CarbetocinView = () => {
  return (
    <div
      dir="rtl"
      style={{
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#525659',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1
          style={{
            color: '#fff',
            marginBottom: '30px',
            textAlign: 'center',
            fontSize: '2.2rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          נוהל למתן קרבטוצין
        </h1>

        <div
          style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            padding: '30px',
            boxSizing: 'border-box',
            color: '#222',
          }}
        >
          <div
            style={{
              backgroundColor: '#fde8e8',
              border: '1px solid #e57373',
              borderRadius: '8px',
              padding: '16px 20px',
              marginBottom: '28px',
              fontWeight: 'bold',
              fontSize: '1.15rem',
              textAlign: 'center',
              color: '#b71c1c',
            }}
          >
            הנוהל מיועד ל<u>מניעה</u> בלבד — לא לטיפול ב-PPH
          </div>

          <h2
            style={{
              fontSize: '1.3rem',
              color: '#1a5fa8',
              borderBottom: '2px solid #1a5fa8',
              paddingBottom: '8px',
              marginBottom: '16px',
            }}
          >
            אינדיקציות למתן כמניעה בניתוח קיסרי
          </h2>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {indications.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#f2f6fb',
                  borderRight: '4px solid #1a5fa8',
                  borderRadius: '6px',
                  fontSize: '1.05rem',
                }}
              >
                <span style={{ color: '#1a5fa8', fontWeight: 'bold' }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CarbetocinView;
