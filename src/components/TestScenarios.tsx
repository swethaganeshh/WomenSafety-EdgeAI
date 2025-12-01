import { audioService } from '../services/audioService';
import { screamDetectionService } from '../services/screamDetectionService';
import { emergencyService } from '../services/emergencyService';
import { DetectionResult } from '../types/detection';

interface TestScenariosProps {
  onDetection: (result: DetectionResult) => void;
  userId?: string;
}

export function TestScenarios({ onDetection, userId }: TestScenariosProps) {
  const runTestScenario = async (
    scenario: 'high' | 'medium' | 'low' | 'none',
    withAccelerometer: boolean = false,
    withKeyword: boolean = false
  ) => {
    const classification = audioService.mockEdgeImpulseClassification(scenario);

    const accelerometerData = withAccelerometer
      ? emergencyService.generateMockAccelerometerData('spike')
      : emergencyService.generateMockAccelerometerData('normal');

    const keywords = withKeyword ? ['help', 'stop'] : undefined;

    const location = await emergencyService.getLocationCoordinates();

    const result = screamDetectionService.analyzeAudio({
      classification,
      accelerometerData,
      location: location || undefined,
      keywords
    });

    onDetection(result);

    if (result.detection) {
      await emergencyService.handleEmergencyDetection(result, userId);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Test Scenarios</h2>
      <p style={styles.description}>
        Simulate different audio classification scenarios to test the detection system
      </p>

      <div style={styles.grid}>
        <button
          style={{ ...styles.button, ...styles.highButton }}
          onClick={() => runTestScenario('high', false, false)}
        >
          <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div style={styles.buttonTitle}>High Distress</div>
            <div style={styles.buttonSubtitle}>Scream: 85%</div>
          </div>
        </button>

        <button
          style={{ ...styles.button, ...styles.mediumButton }}
          onClick={() => runTestScenario('medium', false, false)}
        >
          <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div style={styles.buttonTitle}>Medium Distress</div>
            <div style={styles.buttonSubtitle}>Scream: 62%</div>
          </div>
        </button>

        <button
          style={{ ...styles.button, ...styles.lowButton }}
          onClick={() => runTestScenario('low', false, false)}
        >
          <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div style={styles.buttonTitle}>Low Distress</div>
            <div style={styles.buttonSubtitle}>Scream: 35%</div>
          </div>
        </button>

        <button
          style={{ ...styles.button, ...styles.noneButton }}
          onClick={() => runTestScenario('none', false, false)}
        >
          <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div style={styles.buttonTitle}>No Distress</div>
            <div style={styles.buttonSubtitle}>Normal Audio</div>
          </div>
        </button>

        <button
          style={{ ...styles.button, ...styles.specialButton }}
          onClick={() => runTestScenario('medium', true, false)}
        >
          <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div style={styles.buttonTitle}>With Accelerometer</div>
            <div style={styles.buttonSubtitle}>Medium + Movement</div>
          </div>
        </button>

        <button
          style={{ ...styles.button, ...styles.specialButton }}
          onClick={() => runTestScenario('medium', false, true)}
        >
          <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div style={styles.buttonTitle}>With Keywords</div>
            <div style={styles.buttonSubtitle}>Medium + "Help"</div>
          </div>
        </button>
      </div>

      <div style={styles.infoCard}>
        <svg style={styles.infoIcon} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <p style={styles.infoTitle}>Testing Mode</p>
          <p style={styles.infoText}>
            These scenarios simulate different Edge Impulse classification outputs.
            In production, these values would come from the actual audio classifier model.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    color: '#f9fafb'
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#f9fafb'
  },
  description: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '24px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#374151',
    border: '2px solid transparent',
    borderRadius: '8px',
    color: '#f9fafb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    fontSize: '14px'
  },
  highButton: {
    borderColor: '#ef4444'
  },
  mediumButton: {
    borderColor: '#f59e0b'
  },
  lowButton: {
    borderColor: '#3b82f6'
  },
  noneButton: {
    borderColor: '#10b981'
  },
  specialButton: {
    borderColor: '#8b5cf6'
  },
  buttonIcon: {
    width: '32px',
    height: '32px',
    flexShrink: 0
  },
  buttonTitle: {
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '2px'
  },
  buttonSubtitle: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  infoCard: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#1e3a5f',
    borderRadius: '8px',
    borderLeft: '4px solid #3b82f6'
  },
  infoIcon: {
    width: '24px',
    height: '24px',
    color: '#3b82f6',
    flexShrink: 0
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#93c5fd',
    marginBottom: '4px'
  },
  infoText: {
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#bfdbfe'
  }
};
