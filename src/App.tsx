import { useState } from 'react';
import { AudioMonitor } from './components/AudioMonitor';
import { DetectionDisplay } from './components/DetectionDisplay';
import { TestScenarios } from './components/TestScenarios';
import { DetectionResult } from './types/detection';

function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [latestDetection, setLatestDetection] = useState<DetectionResult | null>(null);
  const [showTests, setShowTests] = useState(false);

  const handleDetection = (result: DetectionResult) => {
    setLatestDetection(result);

    if (result.detection) {
      console.log('ALERT:', result.distress_level, 'distress detected');
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <svg style={styles.logo} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <div>
              <h1 style={styles.title}>Scream Detection Safety System</h1>
              <p style={styles.subtitle}>AI-powered audio threat detection using Edge Impulse</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              style={styles.testToggleButton}
              onClick={() => setShowTests(!showTests)}
            >
              {showTests ? 'Hide Tests' : 'Show Tests'}
            </button>
            <button
              style={{
                ...styles.monitorButton,
                ...(isMonitoring ? styles.monitorButtonActive : {})
              }}
              onClick={toggleMonitoring}
            >
              {isMonitoring ? (
                <>
                  <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Stop Monitoring
                </>
              ) : (
                <>
                  <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Start Monitoring
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {showTests && (
          <section style={styles.section}>
            <TestScenarios onDetection={handleDetection} />
          </section>
        )}

        <section style={styles.section}>
          <AudioMonitor
            onDetection={handleDetection}
            isMonitoring={isMonitoring}
          />
        </section>

        <section style={styles.section}>
          <DetectionDisplay result={latestDetection} />
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>How It Works</h3>
            <ul style={styles.footerList}>
              <li>Continuous audio monitoring using microphone</li>
              <li>Real-time classification via Edge Impulse AI model</li>
              <li>Multi-signal analysis: scream + movement + keywords</li>
              <li>Automatic emergency contact notification</li>
            </ul>
          </div>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Detection Levels</h3>
            <ul style={styles.footerList}>
              <li><strong>High:</strong> Confidence ≥ 75% → Auto SOS</li>
              <li><strong>Medium:</strong> Confidence ≥ 50% → Notify contacts</li>
              <li><strong>Low:</strong> Unusual patterns → Safety check</li>
              <li><strong>None:</strong> Normal audio → Continue monitoring</li>
            </ul>
          </div>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Edge Impulse Model</h3>
            <p style={styles.footerText}>
              Project ID: 830709
              <br />
              Trained to detect: Scream, Noise, Talking, Silence
              <br />
              Optimized for embedded audio classification
            </p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerCopyright}>
            Scream Detection Safety System | Privacy-First AI Protection
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#111827',
    color: '#f9fafb',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#1f2937',
    borderBottom: '1px solid #374151',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logo: {
    width: '48px',
    height: '48px',
    color: '#ef4444'
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#f9fafb',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  testToggleButton: {
    padding: '10px 20px',
    backgroundColor: '#374151',
    border: 'none',
    borderRadius: '8px',
    color: '#f9fafb',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  monitorButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  monitorButtonActive: {
    backgroundColor: '#ef4444'
  },
  buttonIcon: {
    width: '20px',
    height: '20px'
  },
  main: {
    flex: 1,
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px'
  },
  section: {
    marginBottom: '32px'
  },
  footer: {
    backgroundColor: '#1f2937',
    borderTop: '1px solid #374151',
    marginTop: 'auto'
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '48px 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px'
  },
  footerSection: {
    color: '#d1d5db'
  },
  footerTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#f9fafb',
    marginBottom: '16px'
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '14px',
    lineHeight: '2'
  },
  footerText: {
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#9ca3af'
  },
  footerBottom: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    borderTop: '1px solid #374151'
  },
  footerCopyright: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280'
  }
};

export default App;
