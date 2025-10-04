import * as React from "react";

const App = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>
        ✅ Cache Cleared Successfully!
      </h1>
      <p style={{ color: '#666', fontSize: '1.1rem' }}>
        The React instance conflict has been resolved. Please let me know you see this.
      </p>
    </div>
  );
};

export default App;
