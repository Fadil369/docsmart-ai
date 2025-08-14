import { createRoot } from 'react-dom/client';

// Simple test component to verify basic React rendering
function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          🎉 DocSmart AI - Test Mode
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          This is a minimal test to verify React is working correctly.
        </p>
        <p style={{ color: '#0066cc', fontSize: '14px' }}>
          Build Time: {new Date().toLocaleString()}
        </p>
        <button 
          onClick={() => alert('React is working!')}
          style={{
            background: '#0066cc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Test Click
        </button>
      </div>
    </div>
  );
}

// Try to render the test app
try {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(<TestApp />);
    console.log('✅ React rendering successful');
  } else {
    console.error('❌ Root element not found');
  }
} catch (error) {
  console.error('❌ React rendering failed:', error);
  
  // Fallback to vanilla JS
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: Arial; background: #f0f0f0; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center;">
          <h1 style="color: #cc0000; margin-bottom: 20px;">⚠️ Error Loading Application</h1>
          <p style="color: #666; margin-bottom: 20px;">React failed to initialize. Error details:</p>
          <pre style="color: #cc0000; background: #fff5f5; padding: 10px; border-radius: 4px; text-align: left; font-size: 12px;">${error.message}</pre>
          <button onclick="window.location.reload()" style="background: #cc0000; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 20px;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}
